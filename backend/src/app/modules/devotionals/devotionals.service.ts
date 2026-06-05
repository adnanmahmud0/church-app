import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Devotional, DevotionalRead } from './devotionals.model';
import { IDevotional } from './devotionals.interface';

const calculateDayLabel = (dateStr: string | Date): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[date.getUTCDay()];
};

const mapDevotional = (d: any) => {
  const dateObj = new Date(d.date);
  return {
    id: d._id,
    title: d.title,
    dayLabel: calculateDayLabel(d.assignedDateString),
    date: d.assignedDateString ? new Date(d.assignedDateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unassigned',
    dateISO: d.assignedDateString || '',
    cycleCount: d.cycleCount,
    scriptureRef: d.scriptureRef,
    scriptureQuote: d.scriptureQuote,
    reflection: d.reflection,
    reflectionPreview: d.reflection ? d.reflection.substring(0, 100) + '...' : '',
    prayer: d.prayer,
    isDraft: d.isDraft,
    publishedAt: d.publishedAt,
  };
};

const getDevotionals = async (page: number = 1, limit: number = 20, includeDrafts: boolean = false) => {
  const skip = (page - 1) * limit;
  const query = includeDrafts ? {} : { isDraft: false };

  const [devotionals, total] = await Promise.all([
    Devotional.find(query).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    Devotional.countDocuments(query),
  ]);

  return {
    devotionals: devotionals.map(mapDevotional),
    total,
    page,
    limit,
  };
};

const getTodayDevotional = async () => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Check if we already assigned one for today
  let devotional = await Devotional.findOne({
    isDraft: false,
    assignedDateString: todayStr,
  }).lean();

  // 2. If not found, assign a new one
  if (!devotional) {
    // Find the minimum cycleCount among active devotionals
    const minCycleDoc = await Devotional.findOne({ isDraft: false })
      .sort({ cycleCount: 1 })
      .select('cycleCount')
      .lean();

    if (!minCycleDoc) throw new ApiError(StatusCodes.NOT_FOUND, "No active devotionals found in pool");
    
    const minCycle = minCycleDoc.cycleCount || 0;

    // Find all devotionals with this minimum cycle count
    const pool = await Devotional.find({ isDraft: false, cycleCount: minCycle }).lean();
    
    // Pick a random one
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];

    // Update it
    devotional = await Devotional.findByIdAndUpdate(
      chosen._id,
      { 
        assignedDateString: todayStr,
        $inc: { cycleCount: 1 } 
      },
      { new: true }
    ).lean();
  }

  if (!devotional) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to assign devotional");
  return mapDevotional(devotional);
};

const getDevotionalById = async (id: string) => {
  const devotional = await Devotional.findById(id).lean();
  if (!devotional) throw new ApiError(StatusCodes.NOT_FOUND, 'Devotional not found');
  return mapDevotional(devotional);
};

const markAsRead = async (devotionalId: string, userId: string) => {
  const existing = await DevotionalRead.findOne({ devotionalId, userId });
  if (existing) return { isRead: true, readAt: existing.readAt };

  const read = await DevotionalRead.create({ devotionalId, userId });
  return { isRead: true, readAt: read.readAt };
};

const getReadStatus = async (userId: string) => {
  const reads = await DevotionalRead.find({ userId }).select('devotionalId').lean();
  return { readIds: reads.map(r => r.devotionalId.toString()) };
};

const createDevotional = async (payload: Partial<IDevotional>) => {
  if (!payload.isDraft && !payload.publishedAt) {
    payload.publishedAt = new Date();
  }
  const result = await Devotional.create(payload);
  return mapDevotional(result);
};

const updateDevotional = async (id: string, payload: Partial<IDevotional>) => {
  if (payload.isDraft === false && !payload.publishedAt) {
    payload.publishedAt = new Date();
  }
  const updated = await Devotional.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Devotional not found');
  return mapDevotional(updated);
};

const deleteDevotional = async (id: string) => {
  const deleted = await Devotional.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, 'Devotional not found');
  await DevotionalRead.deleteMany({ devotionalId: id });
  return mapDevotional(deleted);
};

const getStats = async () => {
  const [totalDevotionals, totalReads, allReads, upcomingScheduled] = await Promise.all([
    Devotional.countDocuments(),
    DevotionalRead.countDocuments(),
    DevotionalRead.find().populate('devotionalId').lean(),
    Devotional.countDocuments({ isDraft: false, cycleCount: 0 }), // Using this for "upcoming Scheduled" as unused devotionals
  ]);

  const uniqueReaders = new Set(allReads.map(r => r.userId)).size;

  // Most read calculation
  const readCounts: Record<string, number> = {};
  allReads.forEach(r => {
    const dId = r.devotionalId?._id?.toString();
    if (dId) readCounts[dId] = (readCounts[dId] || 0) + 1;
  });

  let mostReadTitle = "N/A";
  let maxCount = 0;
  Object.keys(readCounts).forEach(dId => {
    if (readCounts[dId] > maxCount) {
      maxCount = readCounts[dId];
      const matchingRead = allReads.find(r => r.devotionalId?._id?.toString() === dId);
      mostReadTitle = (matchingRead?.devotionalId as any)?.title || "Unknown";
    }
  });

  // Calculate avg reads per day
  const activeDaysCount = await Devotional.countDocuments({ isDraft: false, assignedDateString: { $ne: null } });
  const avgReadsPerDay = activeDaysCount > 0 ? Math.round(totalReads / activeDaysCount) : 0;

  // Recent 14 days chart data
  const chartData = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateIso = d.toISOString().split('T')[0];
    
    // Count reads on that day
    const startOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    const count = await DevotionalRead.countDocuments({
      readAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    chartData.push({ date: dateIso, reads: count });
  }

  // Top 5 devotionals
  const topIds = Object.keys(readCounts).sort((a, b) => readCounts[b] - readCounts[a]).slice(0, 5);
  const topDevotionals = topIds.map(dId => {
    const matchingRead = allReads.find(r => r.devotionalId?._id?.toString() === dId);
    const d = matchingRead?.devotionalId as any;
    return {
      title: d?.title || 'Unknown',
      date: d?.assignedDateString ? new Date(d.assignedDateString).toISOString().split('T')[0] : 'Unassigned',
      readCount: readCounts[dId]
    };
  });

  return {
    totalDevotionals,
    totalReads,
    uniqueReaders,
    avgReadsPerDay,
    mostReadTitle,
    upcomingScheduled,
    chartData,
    topDevotionals
  };
};

export const DevotionalsService = {
  getDevotionals,
  getTodayDevotional,
  getDevotionalById,
  markAsRead,
  getReadStatus,
  createDevotional,
  updateDevotional,
  deleteDevotional,
  getStats,
};
