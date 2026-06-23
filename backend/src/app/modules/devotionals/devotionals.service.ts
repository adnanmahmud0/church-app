import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Devotional, DevotionalRead } from './devotionals.model';
import { IDevotional } from './devotionals.interface';

const calculateDayLabel = (dateStr: string | Date | undefined | null): string => {
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
    posted: !!d.assignedDateString && d.assignedDateString <= new Date().toISOString().split('T')[0],
    scriptureRef: d.scriptureRef,
    scriptureQuote: d.scriptureQuote,
    reflection: d.reflection,
    reflectionPreview: d.reflection ? d.reflection.substring(0, 100) + '...' : '',
    prayer: d.prayer,
    isDraft: d.isDraft,
    publishedAt: d.publishedAt,
  };
};

const autoScheduleDevotionals = async () => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const activeDevotionals = await Devotional.find({ isDraft: false }).lean();
  if (activeDevotionals.length === 0) return;

  const scheduled = activeDevotionals.filter(d => d.assignedDateString && d.assignedDateString >= todayStr);
  const needsScheduling = activeDevotionals.filter(d => !d.assignedDateString || d.assignedDateString < todayStr);
  
  if (needsScheduling.length === 0) return;

  needsScheduling.sort((a, b) => {
    return a._id.toString().localeCompare(b._id.toString());
  });

  let currentMaxDate = new Date(todayStr);
  currentMaxDate.setDate(currentMaxDate.getDate() - 1); 

  if (scheduled.length > 0) {
    const maxDateStr = scheduled.reduce((max, d) => d.assignedDateString! > max ? d.assignedDateString! : max, "1970-01-01");
    currentMaxDate = new Date(maxDateStr);
  }

  for (const d of needsScheduling) {
    currentMaxDate.setDate(currentMaxDate.getDate() + 1);
    const nextDateStr = currentMaxDate.toISOString().split('T')[0];
    
    const updatePayload: any = {
      assignedDateString: nextDateStr
    };

    if (d.assignedDateString) {
      updatePayload.lastShownDate = d.assignedDateString;
    }

    await Devotional.findByIdAndUpdate(d._id, updatePayload);
  }
};

const getDevotionals = async (page: number = 1, limit: number = 20, includeDrafts: boolean = false, userId?: string) => {
  await autoScheduleDevotionals();
  const skip = (page - 1) * limit;

  let devotionals: any[] = [];
  let total = 0;

  if (includeDrafts) {
    const query = {};
    const [docs, count] = await Promise.all([
      Devotional.find(query).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
      Devotional.countDocuments(query),
    ]);
    devotionals = docs;
    total = count;
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    const pipeline: any[] = [
      { $match: { isDraft: false } },
      {
        $addFields: {
          effectiveDate: {
            $cond: {
              if: { 
                $and: [ 
                  { $ne: ["$assignedDateString", null] }, 
                  { $lte: ["$assignedDateString", todayStr] } 
                ] 
              },
              then: "$assignedDateString",
              else: "$lastShownDate"
            }
          }
        }
      },
      { $match: { effectiveDate: { $ne: null } } }
    ];

    const [docs, countResult] = await Promise.all([
      Devotional.aggregate([
        ...pipeline,
        { $sort: { effectiveDate: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]),
      Devotional.aggregate([
        ...pipeline,
        { $count: "total" }
      ])
    ]);
    
    devotionals = docs;
    total = countResult.length > 0 ? countResult[0].total : 0;
  }

  let readIds: string[] = [];
  if (userId) {
    const reads = await DevotionalRead.find({ userId, devotionalId: { $in: devotionals.map(d => d._id) } }).select('devotionalId').lean();
    readIds = reads.map(r => r.devotionalId.toString());
  }

  return {
    devotionals: devotionals.map(d => {
      const isRead = readIds.includes(d._id.toString());
      if (includeDrafts) {
        return {
          ...mapDevotional(d),
          isRead
        };
      } else {
        const dateStr = d.effectiveDate;
        return {
          id: d._id,
          title: d.title,
          dayLabel: calculateDayLabel(dateStr),
          date: dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unassigned',
          scriptureRef: d.scriptureRef,
          reflectionPreview: d.reflection ? d.reflection.substring(0, 100) + '...' : '',
          isRead
        };
      }
    }),
    total,
    page,
    limit,
  };
};

const getTodayDevotional = async (userId?: string) => {
  await autoScheduleDevotionals();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let devotional = await Devotional.findOne({
    isDraft: false,
    assignedDateString: todayStr,
  }).lean();

  if (!devotional) {
    devotional = await Devotional.findOne({ isDraft: false }).sort({ assignedDateString: 1 }).lean();
  }

  if (!devotional) throw new ApiError(StatusCodes.NOT_FOUND, "No active devotionals found");
  
  let isRead = false;
  if (userId) {
    const existing = await DevotionalRead.findOne({ devotionalId: devotional._id, userId });
    isRead = !!existing;
  }

  return { ...mapDevotional(devotional), isRead };
};

const getDevotionalById = async (id: string, userId?: string) => {
  const devotional = await Devotional.findById(id).lean();
  if (!devotional) throw new ApiError(StatusCodes.NOT_FOUND, 'Devotional not found');
  
  let isRead = false;
  if (userId) {
    const existing = await DevotionalRead.findOne({ devotionalId: devotional._id, userId });
    isRead = !!existing;
  }
  
  return { ...mapDevotional(devotional), isRead };
};

const markAsRead = async (devotionalId: string, userId: string) => {
  const existing = await DevotionalRead.findOne({ devotionalId, userId });
  if (existing) {
    await DevotionalRead.deleteOne({ _id: existing._id });
    return { isRead: false, readAt: null };
  }

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
  await autoScheduleDevotionals();

  if (!payload.isDraft) {
    const { NotificationService } = await import('../notification/notification.service');
    try {
      await NotificationService.sendNotificationToTopic('devotional', {
        title: 'New Devotional Available!',
        body: `"${result.title}" has just been posted. Read it now!`,
        data: {
          type: 'devotional',
          devotionalId: result._id.toString(),
        },
      });
    } catch (err) {
      console.error('Failed to send notification for new devotional:', err);
    }
  }

  return mapDevotional(result);
};

const updateDevotional = async (id: string, payload: Partial<IDevotional>) => {
  const existing = await Devotional.findById(id).lean();
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Devotional not found');

  if (payload.isDraft === false && !payload.publishedAt) {
    payload.publishedAt = new Date();
  }
  const updated = await Devotional.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Devotional not found');
  
  if (existing.isDraft && payload.isDraft === false) {
    const { NotificationService } = await import('../notification/notification.service');
    try {
      await NotificationService.sendNotificationToTopic('devotional', {
        title: 'New Devotional Available!',
        body: `"${updated.title}" has just been posted. Read it now!`,
        data: {
          type: 'devotional',
          devotionalId: updated._id.toString(),
        },
      });
    } catch (err) {
      console.error('Failed to send notification for updated devotional:', err);
    }
  }

  await autoScheduleDevotionals();
  return mapDevotional(updated);
};

const deleteDevotional = async (id: string) => {
  const deleted = await Devotional.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, 'Devotional not found');
  await DevotionalRead.deleteMany({ devotionalId: id });
  return mapDevotional(deleted);
};

const getStats = async () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [totalDevotionals, totalReads, allReads, upcomingScheduled] = await Promise.all([
    Devotional.countDocuments(),
    DevotionalRead.countDocuments(),
    DevotionalRead.find().populate('devotionalId').lean(),
    Devotional.countDocuments({ isDraft: false, assignedDateString: { $gt: todayStr } }),
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

const getProfileDevotionalSummary = async (userId: string) => {
  const reads = await DevotionalRead.find({ userId }).sort({ readAt: -1 }).lean();
  
  if (!reads.length) {
    return {
      total_devotionals_read: 0,
      devotionals_streak_days: 0,
      weekly_progress: 0,
      last_read_date: null,
    };
  }

  const total_devotionals_read = reads.length;
  const last_read_date = reads[0].readAt;

  // Extract unique local dates (YYYY-MM-DD) from reads
  const readDates = Array.from(new Set(reads.map(r => {
    const d = new Date(r.readAt!);
    return d.toISOString().split('T')[0];
  }))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date();
  
  // Calculate start of the current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  let weeklyProgress = 0;
  for (const dateStr of readDates) {
    const d = new Date(dateStr);
    if (d >= startOfWeek) {
      weeklyProgress++;
    } else {
      break; // Since readDates are sorted descending, once we go before start of week we can stop
    }
  }

  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If the user read today or yesterday, they have an active streak
  if (readDates[0] === todayStr || readDates[0] === yesterdayStr) {
    let checkDate = new Date(readDates[0]);
    
    for (let i = 0; i < readDates.length; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (readDates[i] === dStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    total_devotionals_read,
    devotionals_streak_days: streak,
    weekly_progress: weeklyProgress,
    last_read_date,
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
  getProfileDevotionalSummary,
};
