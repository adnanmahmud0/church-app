import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Event, EventCategory, EventRSVP } from './events.model';
import { IEvent, IEventCategory } from './events.interface';
import { Types } from 'mongoose';

const mapEvent = (e: any, currentUserId?: string, rsvps: any[] = []) => {
  const dateObj = new Date(e.date);
  const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
  
  let attendingCount = 0;
  let hasRsvp = false;

  if (rsvps.length > 0) {
    const eventRsvps = rsvps.filter(r => r.eventId.toString() === e._id.toString());
    attendingCount = eventRsvps.length;
    if (currentUserId) {
      hasRsvp = eventRsvps.some(r => r.userId === currentUserId);
    }
  } else {
    // If we didn't pre-fetch rsvps, we might just pass attendingCount in e
    attendingCount = e.attendingCount || 0;
    hasRsvp = e.hasRsvp || false;
  }

  const cat = e.categoryId || {};

  return {
    id: e._id,
    title: e.title,
    category: cat.label?.toLowerCase() || 'other',
    categoryLabel: cat.label?.toUpperCase() || 'OTHER',
    categoryColor: cat.color || '#3b5bdb',
    date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    dateISO: dateObj.toISOString().split('T')[0],
    time: e.time,
    location: e.location,
    description: e.description,
    isDraft: e.isDraft,
    attendingCount,
    hasRsvp,
    isPast,
    createdAt: e.createdAt,
  };
};

const getEvents = async (page: number = 1, limit: number = 20, isPast: boolean = false, category?: string, currentUserId?: string, includeDrafts: boolean = false) => {
  const skip = (page - 1) * limit;
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  let query: any = {};
  if (!includeDrafts) query.isDraft = false;

  if (isPast) {
    query.date = { $lt: startOfToday };
  } else {
    query.date = { $gte: startOfToday };
  }

  if (category && category.toLowerCase() !== 'all') {
    const catDoc = await EventCategory.findOne({ label: new RegExp(`^${category}$`, 'i') });
    if (catDoc) {
      query.categoryId = catDoc._id;
    }
  }

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('categoryId')
      .sort({ date: isPast ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Event.countDocuments(query),
  ]);

  const eventIds = events.map(e => e._id);
  const rsvps = await EventRSVP.find({ eventId: { $in: eventIds } }).lean();

  return {
    events: events.map(e => mapEvent(e, currentUserId, rsvps)),
    total,
    page,
    limit,
  };
};

const getEventById = async (id: string, currentUserId?: string) => {
  const event = await Event.findById(id).populate('categoryId').lean();
  if (!event) throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');

  const rsvps = await EventRSVP.find({ eventId: id }).lean();
  return mapEvent(event, currentUserId, rsvps);
};

const rsvpEvent = async (id: string, userId: string) => {
  const event = await Event.findById(id);
  if (!event) throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');

  try {
    await EventRSVP.create({ eventId: id, userId });
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Already RSVPed');
    }
    throw error;
  }

  const count = await EventRSVP.countDocuments({ eventId: id });
  return { hasRsvp: true, attendingCount: count };
};

const cancelRsvp = async (id: string, userId: string) => {
  await EventRSVP.findOneAndDelete({ eventId: id, userId });
  const count = await EventRSVP.countDocuments({ eventId: id });
  return { hasRsvp: false, attendingCount: count };
};

// Admin operations
const createEvent = async (payload: Partial<IEvent>) => {
  const result = await Event.create(payload);
  const populated = await Event.findById(result._id).populate('categoryId').lean();
  return mapEvent(populated);
};

const updateEvent = async (id: string, payload: Partial<IEvent>) => {
  const updated = await Event.findByIdAndUpdate(id, payload, { new: true }).populate('categoryId').lean();
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  return mapEvent(updated);
};

const deleteEvent = async (id: string) => {
  const deleted = await Event.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  await EventRSVP.deleteMany({ eventId: id });
  return { id };
};

// Categories
const getCategories = async () => {
  const categories = await EventCategory.find().sort({ sortOrder: 1 }).lean();
  const allCat = { id: 'all', label: 'All', color: null, sortOrder: -1 };
  
  return [allCat, ...categories.map(c => ({
    id: c._id.toString(),
    label: c.label,
    color: c.color,
    sortOrder: c.sortOrder
  }))];
};

const createCategory = async (payload: Partial<IEventCategory>) => {
  const result = await EventCategory.create(payload);
  return result;
};

const updateCategory = async (id: string, payload: Partial<IEventCategory>) => {
  const updated = await EventCategory.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  return updated;
};

const deleteCategory = async (id: string) => {
  const inUse = await Event.exists({ categoryId: id });
  if (inUse) throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete category in use');
  
  const deleted = await EventCategory.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  return deleted;
};

// Stats
const getStats = async () => {
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const nextWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalUpcoming, totalPast, upcomingThisWeek, totalRsvps, eventsWithRsvps, allCategories] = await Promise.all([
    Event.countDocuments({ date: { $gte: startOfToday }, isDraft: false }),
    Event.countDocuments({ date: { $lt: startOfToday }, isDraft: false }),
    Event.countDocuments({ date: { $gte: startOfToday, $lt: nextWeek }, isDraft: false }),
    EventRSVP.countDocuments(),
    Event.aggregate([
      {
        $lookup: {
          from: 'eventrsvps',
          localField: '_id',
          foreignField: 'eventId',
          as: 'rsvps'
        }
      },
      {
        $project: {
          title: 1,
          categoryId: 1,
          rsvpCount: { $size: '$rsvps' }
        }
      },
      { $sort: { rsvpCount: -1 } }
    ]),
    EventCategory.find().lean()
  ]);

  const avgAttendance = eventsWithRsvps.length > 0 ? Math.round(totalRsvps / eventsWithRsvps.length) : 0;
  const mostAttendedEvent = eventsWithRsvps.length > 0 ? eventsWithRsvps[0].title : "N/A";

  const byCategory = allCategories.map(cat => {
    const catEvents = eventsWithRsvps.filter(e => e.categoryId?.toString() === cat._id.toString());
    const totalAttendance = catEvents.reduce((sum, e) => sum + e.rsvpCount, 0);
    return {
      category: cat.label,
      count: catEvents.length,
      totalAttendance
    };
  });

  return {
    totalUpcoming,
    totalPast,
    totalRsvps,
    avgAttendance,
    mostAttendedEvent,
    upcomingThisWeek,
    byCategory
  };
};

export const EventsService = {
  getEvents,
  getEventById,
  rsvpEvent,
  cancelRsvp,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStats
};
