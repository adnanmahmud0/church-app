import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IUser } from '../user/user.interface';
import bcrypt from 'bcrypt';
import config from '../../../config';
import generateOTP from '../../../util/generateOTP';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { debug } from '../../../shared/debug';
import { Sermon } from '../sermons/sermon.model';
import { Event, EventRSVP } from '../events/events.model';
import { Devotional, DevotionalRead } from '../devotionals/devotionals.model';
import { PrayerRequest, PrayerInteraction } from '../prayer/prayer.model';
import { CommunityGroup } from '../community/community.model';
import { GivingTransaction } from '../giving/giving.model';

const getAllAdminsToDB = async (): Promise<IUser[]> => {
  return await User.find({ role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } }).select('-password');
};

const createAdminToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  payload.role = USER_ROLES.ADMIN;
  payload.verified = true; // Admins created by super admin are verified
  
  const createAdmin = await User.create(payload);
  if (!createAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin');
  }
  return createAdmin;
};

const updateAdminToDB = async (adminId: string, payload: Partial<IUser>): Promise<IUser | null> => {
  const targetAdmin = await User.findById(adminId);
  if (!targetAdmin) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found');
  }
  if (targetAdmin.role === USER_ROLES.SUPER_ADMIN) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot update a super admin account');
  }

  // Prevent role change
  if (payload.role) {
    delete payload.role;
  }

  // If password is being updated, hash it
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));
  }

  return await User.findByIdAndUpdate(adminId, payload, { new: true }).select('-password');
};

const deleteAdminToDB = async (adminId: string, currentUser: JwtPayload): Promise<IUser | null> => {
  const targetAdmin = await User.findById(adminId);
  if (!targetAdmin) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found');
  }
  if (targetAdmin.role === USER_ROLES.SUPER_ADMIN) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot delete a super admin account');
  }
  if (targetAdmin._id.toString() === currentUser.id) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot delete your own account');
  }

  return await User.findByIdAndDelete(adminId);
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser> & { currentPassword?: string }
): Promise<IUser | null> => {
  const { id } = user;
  const isExistUser = await User.findById(id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Handle password update
  if (payload.password) {
    if (!payload.currentPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Current password is required to set a new password');
    }
    const isMatch = await User.isMatchPassword(payload.currentPassword, isExistUser.password!);
    if (!isMatch) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Incorrect current password');
    }
    payload.password = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));
  }

  // Prevent role change
  if (payload.role) delete payload.role;

  // Handle email update logic
  if (payload.email && payload.email !== isExistUser.email) {
    if (isExistUser.role === USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Super admin cannot change email address');
    }
    
    // For admin role: set verified to false and generate OTP
    payload.verified = false;
    const otp = generateOTP();
    const authentication = {
      isResetPassword: false,
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };
    payload.authentication = authentication;

    const values = {
      name: payload.name || isExistUser.name,
      otp: otp,
      email: payload.email,
    };
    const template = emailTemplate.createAccount(values as any);
    emailHelper.sendEmail(template);
    debug('admin.profile.email_verification_sent', { email: payload.email });
  }

  delete payload.currentPassword;

  const updateDoc = await User.findByIdAndUpdate(id, payload, { new: true }).select('-password');
  return updateDoc;
};

const getDashboard = async () => {
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStr = now.toISOString().split('T')[0];

  const [
    totalUsers,
    newUsersThisMonth,
    totalSermons,
    totalEvents,
    upcomingEvents,
    totalRsvps,
    totalDevotionals,
    totalDevotionalReads,
    totalPrayerRequests,
    activePrayerRequests,
    totalPrays,
    totalCommunityGroups,
    activeCommunityGroups,
    givingThisYear,
    givingThisMonth,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.USER }),
    User.countDocuments({ role: USER_ROLES.USER, createdAt: { $gte: startOfMonth } }),
    Sermon.countDocuments(),
    Event.countDocuments({ isDraft: false }),
    Event.countDocuments({ date: { $gte: startOfToday }, isDraft: false }),
    EventRSVP.countDocuments(),
    Devotional.countDocuments({ isDraft: false }),
    DevotionalRead.countDocuments(),
    PrayerRequest.countDocuments(),
    PrayerRequest.countDocuments({ status: 'active' }),
    PrayerInteraction.countDocuments(),
    CommunityGroup.countDocuments(),
    CommunityGroup.countDocuments({ isActive: true }),
    GivingTransaction.find({ createdAt: { $gte: startOfYear }, status: 'completed' }).lean(),
    GivingTransaction.find({ createdAt: { $gte: startOfMonth }, status: 'completed' }).lean(),
    User.find({ role: USER_ROLES.USER }).sort({ createdAt: -1 }).limit(5).select('name email image createdAt').lean(),
  ]);

  const givingTotalYear = givingThisYear.reduce((sum: number, t: any) => sum + t.amount, 0);
  const givingTotalMonth = givingThisMonth.reduce((sum: number, t: any) => sum + t.amount, 0);

  // User registration chart (last 30 days)
  const registrationChartPromises = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    registrationChartPromises.push(
      User.countDocuments({ role: USER_ROLES.USER, createdAt: { $gte: dayStart, $lte: dayEnd } }).then(count => ({
        date: dayStart.toISOString().split('T')[0],
        count,
      }))
    );
  }
  const registrationChart = await Promise.all(registrationChartPromises);

  return {
    users: {
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
    },
    sermons: {
      total: totalSermons,
    },
    events: {
      total: totalEvents,
      upcoming: upcomingEvents,
      totalRsvps,
    },
    devotionals: {
      total: totalDevotionals,
      totalReads: totalDevotionalReads,
    },
    prayer: {
      totalRequests: totalPrayerRequests,
      activeRequests: activePrayerRequests,
      totalPrays,
    },
    community: {
      totalGroups: totalCommunityGroups,
      activeGroups: activeCommunityGroups,
    },
    giving: {
      totalThisYear: givingTotalYear,
      totalThisMonth: givingTotalMonth,
    },
    registrationChart,
    recentUsers: recentUsers.map((u: any) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      image: u.image,
      joinedAt: u.createdAt,
    })),
  };
};

export const AdminService = {
  getAllAdminsToDB,
  createAdminToDB,
  updateAdminToDB,
  deleteAdminToDB,
  updateProfileToDB,
  getDashboard,
};
