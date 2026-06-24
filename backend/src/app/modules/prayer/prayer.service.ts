import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { IPrayerRequest } from './prayer.interface';
import { PrayerInteraction, PrayerRequest } from './prayer.model';
import { NotificationService } from '../notification/notification.service';

const createRequest = async (
  payload: Partial<IPrayerRequest>,
  user?: JwtPayload
) => {
  if (user) {
    payload.author_user_id = user.id;
  }
  
  const prayer = await PrayerRequest.create(payload);
  return prayer;
};

const mapPrayerRequest = (prayer: any, is_prayed: boolean = false) => ({
  id: prayer._id,
  author_name: prayer.is_anonymous ? 'Anonymous' : prayer.author_name,
  content: prayer.content,
  pray_count: prayer.pray_count,
  is_prayed,
  createdAt: prayer.createdAt,
});

const getRequests = async (
  page: number = 1,
  limit: number = 10,
  user?: JwtPayload,
  deviceFingerprint?: string
) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    PrayerRequest.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PrayerRequest.countDocuments({ status: 'active' }),
  ]);

  const totalPage = Math.ceil(total / limit);

  let interactionSet = new Set<string>();
  if ((user || deviceFingerprint) && data.length > 0) {
    const query: any = { prayer_request_id: { $in: data.map(p => p._id) } };
    if (user) {
      query.user_id = user.id;
    } else if (deviceFingerprint) {
      query.device_fingerprint = deviceFingerprint;
    }
    const interactions = await PrayerInteraction.find(query).lean();
    interactions.forEach(i => interactionSet.add(i.prayer_request_id.toString()));
  }

  return {
    meta: { page, limit, totalPage, total },
    data: data.map(p => mapPrayerRequest(p, interactionSet.has(p._id.toString()))),
  };
};

const getMyRequests = async (user: JwtPayload) => {
  const data = await PrayerRequest.find({ author_user_id: user.id }).sort({ createdAt: -1 }).lean();
  
  let interactionSet = new Set<string>();
  if (data.length > 0) {
    const interactions = await PrayerInteraction.find({
      prayer_request_id: { $in: data.map(p => p._id) },
      user_id: user.id
    }).lean();
    interactions.forEach(i => interactionSet.add(i.prayer_request_id.toString()));
  }

  return data.map(p => mapPrayerRequest(p, interactionSet.has(p._id.toString())));
};

const getSingleRequest = async (
  id: string,
  user?: JwtPayload,
  deviceFingerprint?: string
) => {
  const data = await PrayerRequest.findById(id).lean();
  if (!data) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Prayer request not found');
  }

  let is_prayed = false;
  if (user || deviceFingerprint) {
    const query: any = { prayer_request_id: id };
    if (user) {
      query.user_id = user.id;
    } else if (deviceFingerprint) {
      query.device_fingerprint = deviceFingerprint;
    }
    const interaction = await PrayerInteraction.findOne(query).lean();
    if (interaction) {
      is_prayed = true;
    }
  }

  return mapPrayerRequest(data, is_prayed);
};

const prayForRequest = async (
  id: string,
  user?: JwtPayload,
  deviceFingerprint?: string
) => {
  const prayer = await PrayerRequest.findById(id);
  if (!prayer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Prayer request not found');
  }

  // Deduplication check
  const query: any = { prayer_request_id: id };
  if (user) {
    query.user_id = user.id;
  } else if (deviceFingerprint) {
    query.device_fingerprint = deviceFingerprint;
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Must provide authentication or device fingerprint');
  }

  const existingInteraction = await PrayerInteraction.findOne(query);

  if (!existingInteraction) {
    await PrayerInteraction.create(query);
    prayer.pray_count += 1;
    await prayer.save();

    if (prayer.author_user_id) {
      const isSelfPray = user && prayer.author_user_id.toString() === user.id;
      if (!isSelfPray) {
        const { User } = await import('../user/user.model');
        const author = await User.findById(prayer.author_user_id);
        
        // Only send if the author hasn't turned off prayer notifications
        if (author && author.notificationPreferences?.prayer !== false) {
          NotificationService.sendNotificationToUser(prayer.author_user_id.toString(), {
            title: 'Someone prayed for you 🙏',
            body: 'Someone just prayed for your prayer request.',
            data: { type: 'prayer', prayerId: prayer._id.toString() },
          }).catch(err => console.error('Failed to send prayer notification:', err));
        }
      }
    }
  } else {
    await PrayerInteraction.deleteOne(query);
    prayer.pray_count = Math.max(0, prayer.pray_count - 1);
    await prayer.save();
  }

  return prayer;
};

const updateRequest = async (
  id: string,
  payload: Partial<IPrayerRequest>,
  user?: JwtPayload,
  deviceFingerprint?: string
) => {
  const prayer = await PrayerRequest.findById(id);
  if (!prayer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Prayer request not found');
  }

  // Authorization check
  const isOwner = user && prayer.author_user_id?.toString() === user.id;
  const isGuestOwner = !prayer.author_user_id && deviceFingerprint && prayer.device_fingerprint === deviceFingerprint;
  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN');

  if (!isOwner && !isGuestOwner && !isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only update your own prayer requests');
  }

  const updated = await PrayerRequest.findByIdAndUpdate(id, payload, { new: true });
  return updated;
};

const deleteRequest = async (id: string, user?: JwtPayload, deviceFingerprint?: string) => {
  const prayer = await PrayerRequest.findById(id);
  if (!prayer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Prayer request not found');
  }

  // Authorization check
  const isOwner = user && prayer.author_user_id?.toString() === user.id;
  const isGuestOwner = !prayer.author_user_id && deviceFingerprint && prayer.device_fingerprint === deviceFingerprint;
  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN');

  if (!isOwner && !isGuestOwner && !isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only delete your own prayer requests');
  }

  // Hard delete the request and its associated interactions
  await PrayerInteraction.deleteMany({ prayer_request_id: id });
  const deleted = await PrayerRequest.findByIdAndDelete(id);
  return deleted;
};

const getStats = async () => {
  const [totalRequests, activeRequests, totalPrays] = await Promise.all([
    PrayerRequest.countDocuments(),
    PrayerRequest.countDocuments({ status: 'active' }),
    PrayerInteraction.countDocuments(),
  ]);

  return {
    totalRequests,
    activeRequests,
    totalPrays,
  };
};

export const PrayerService = {
  createRequest,
  getRequests,
  getMyRequests,
  getSingleRequest,
  prayForRequest,
  updateRequest,
  deleteRequest,
  getStats,
};
