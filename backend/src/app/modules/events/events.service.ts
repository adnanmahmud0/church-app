import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Event, EventCategory, EventRSVP } from './events.model';
import { IEvent, IEventCategory } from './events.interface';
import { Types } from 'mongoose';
import { ChurchInfo } from '../churchInfo/churchInfo.model';

const mapEvent = (e: any, currentUserId?: string, rsvps: any[] = [], timezone: string = 'UTC') => {
  const dateObj = new Date(e.date);
  
  // Use exact wall-clock time for the target timezone to determine if event is past
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  });
  
  const parts = formatter.formatToParts(now);
  const extract = (type: string) => parts.find(p => p.type === type)?.value || '00';
  const currentWallDate = `${extract('year')}-${extract('month')}-${extract('day')}`;
  const currentWallTime = `${extract('hour')}:${extract('minute')}:${extract('second')}`;

  const eventWallDate = dateObj.toISOString().split('T')[0];
  
  let evHours = 23;
  let evMinutes = 59;
  
  if (e.time) {
    const match = e.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      evHours = h;
      evMinutes = m;
    }
  }

  const evHoursStr = evHours.toString().padStart(2, '0');
  const evMinutesStr = evMinutes.toString().padStart(2, '0');
  const eventWallTime = `${evHoursStr}:${evMinutesStr}:00`;

  let isPast = false;
  if (eventWallDate < currentWallDate) {
    isPast = true;
  } else if (eventWallDate === currentWallDate) {
    isPast = eventWallTime < currentWallTime;
  }
  
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
    categoryId: cat._id,
    category: cat.label?.toLowerCase() || 'other',
    categoryLabel: cat.label?.toUpperCase() || 'OTHER',
    categoryColor: cat.color || '#3b5bdb',
    date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    dateISO: dateObj.toISOString().split('T')[0],
    time: e.time,
    location: e.location,
    attendingCount,
    hasRsvp,
    isPast,
    ...(e.description && { description: e.description }),
    ...(e.image && { image: e.image }),
    ...(e.isDraft !== undefined && { isDraft: e.isDraft }),
    ...(e.createdAt && { createdAt: e.createdAt }),
  };
};

const getEvents = async (page: number = 1, limit: number = 20, isPast: boolean | null = false, category?: string, currentUserId?: string, includeDrafts: boolean = false, onlyRsvpd: boolean = false) => {
  const skip = (page - 1) * limit;
  const churchInfo = await ChurchInfo.findOne().lean();
  const tz = churchInfo?.timezone || 'UTC';
  
  // Use the timezone to get the current date midnight in UTC terms for accurate day filtering
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = formatter.formatToParts(now);
  const extract = (type: string) => parts.find(p => p.type === type)?.value || '00';
  const y = parseInt(extract('year'));
  const m = parseInt(extract('month')) - 1;
  const d = parseInt(extract('day'));
  const startOfToday = new Date(Date.UTC(y, m, d));

  let query: any = {};
  if (!includeDrafts) query.isDraft = false;

  if (isPast === true) {
    query.date = { $lt: startOfToday };
  } else if (isPast === false) {
    query.date = { $gte: startOfToday };
  }

  if (onlyRsvpd) {
    if (currentUserId) {
      const userRsvps = await EventRSVP.find({ userId: currentUserId }).lean();
      const rsvpEventIds = userRsvps.map(r => r.eventId);
      query._id = { $in: rsvpEventIds };
    } else {
      // If user isn't identified, they can't have any RSVPs
      return { events: [], total: 0, page, limit };
    }
  }

  if (category && category.toLowerCase() !== 'all') {
    const catDoc = await EventCategory.findOne({ label: new RegExp(`^${category}$`, 'i') });
    if (catDoc) {
      query.categoryId = catDoc._id;
    }
  }

  let queryBuilder = Event.find(query)
    .populate('categoryId')
    .sort({ date: isPast ? -1 : 1 })
    .skip(skip)
    .limit(limit);

  if (!includeDrafts) {
    queryBuilder = queryBuilder.select('title categoryId date time location description image');
  }

  const [events, total] = await Promise.all([
    queryBuilder.lean(),
    Event.countDocuments(query),
  ]);

  const eventIds = events.map(e => e._id);
  const rsvps = await EventRSVP.find({ eventId: { $in: eventIds } }).lean();

  return {
    events: events.map(e => mapEvent(e, currentUserId, rsvps, tz)),
    total,
    page,
    limit,
  };
};

const getLatestEvents = async (limit: number = 3, currentUserId?: string) => {
  const churchInfo = await ChurchInfo.findOne().lean();
  const tz = churchInfo?.timezone || 'UTC';
  
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = formatter.formatToParts(now);
  const extract = (type: string) => parts.find(p => p.type === type)?.value || '00';
  const y = parseInt(extract('year'));
  const m = parseInt(extract('month')) - 1;
  const d = parseInt(extract('day'));
  const startOfToday = new Date(Date.UTC(y, m, d));

  const events = await Event.find({ isDraft: false, date: { $gte: startOfToday } })
    .populate('categoryId')
    .sort({ date: 1 })
    .limit(limit)
    .select('title categoryId date time location description image')
    .lean();

  if (!events.length) return [];

  const eventIds = events.map(e => e._id);
  const rsvps = await EventRSVP.find({ eventId: { $in: eventIds } }).lean();

  return events.map(e => mapEvent(e, currentUserId, rsvps, tz));
};

const getEventById = async (id: string, currentUserId?: string) => {
  const event = await Event.findById(id).populate('categoryId').lean();
  if (!event) throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');

  const rsvps = await EventRSVP.find({ eventId: id }).lean();
  const churchInfo = await ChurchInfo.findOne().lean();
  const tz = churchInfo?.timezone || 'UTC';
  return mapEvent(event, currentUserId, rsvps, tz);
};

const rsvpEvent = async (id: string, userId: string) => {
  const event = await Event.findById(id);
  if (!event) throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');

  const existingRsvp = await EventRSVP.findOne({ eventId: id, userId });

  if (existingRsvp) {
    await EventRSVP.deleteOne({ _id: existingRsvp._id });
    const count = await EventRSVP.countDocuments({ eventId: id });
    return { hasRsvp: false, attendingCount: count };
  } else {
    await EventRSVP.create({ eventId: id, userId });
    const count = await EventRSVP.countDocuments({ eventId: id });
    return { hasRsvp: true, attendingCount: count };
  }
};

// Admin operations
const createEvent = async (payload: Partial<IEvent>) => {
  const result = await Event.create(payload);
  const populated = await Event.findById(result._id).populate('categoryId').lean();
  const churchInfo = await ChurchInfo.findOne().lean();
  const tz = churchInfo?.timezone || 'UTC';
  return mapEvent(populated, undefined, [], tz);
};

const updateEvent = async (id: string, payload: Partial<IEvent>) => {
  const updated = await Event.findByIdAndUpdate(id, payload, { new: true }).populate('categoryId').lean();
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  const churchInfo = await ChurchInfo.findOne().lean();
  const tz = churchInfo?.timezone || 'UTC';
  return mapEvent(updated, undefined, [], tz);
};

const deleteEvent = async (id: string) => {
  const deleted = await Event.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  await EventRSVP.deleteMany({ eventId: id });
  return { id };
};

// Categories
const getCategories = async () => {
  const result = await EventCategory.aggregate([
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: 'categoryId',
        as: 'eventsData'
      }
    },
    {
      $addFields: {
        eventCount: { $size: "$eventsData" },
        id: "$_id"
      }
    },
    {
      $project: {
        _id: 0,
        id: "$_id",
        label: 1,
        color: 1,
        eventCount: 1,
        sortOrder: 1
      }
    },
    {
      $sort: { sortOrder: 1 }
    }
  ]);

  const allCat = { id: 'all', label: 'All', color: null, eventCount: 0 };
  
  return [allCat, ...result.map(c => ({
    id: c.id.toString(),
    label: c.label,
    color: c.color,
    eventCount: c.eventCount
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
  const eventCount = await Event.countDocuments({ categoryId: id });
  if (eventCount > 0) throw new ApiError(StatusCodes.BAD_REQUEST, `Cannot delete category. It is still used by ${eventCount} event(s) (Make sure to check both 'Upcoming' and 'Past' tabs).`);
  
  const deleted = await EventCategory.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  return deleted;
};

// Stats
const getStats = async () => {
  const churchInfo = await ChurchInfo.findOne().lean();
  const tz = churchInfo?.timezone || 'UTC';
  
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = formatter.formatToParts(now);
  const extract = (type: string) => parts.find(p => p.type === type)?.value || '00';
  const y = parseInt(extract('year'));
  const m = parseInt(extract('month')) - 1;
  const d = parseInt(extract('day'));
  const startOfToday = new Date(Date.UTC(y, m, d));
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
  getLatestEvents,
  getEventById,
  rsvpEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStats
};
