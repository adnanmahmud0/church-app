import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { jwtHelper } from '../../../helpers/jwtHelper';
import unlinkFile from '../../../shared/unlinkFile';
import { GivingService } from '../giving/giving.service';
import { IUser } from './user.interface';
import { User } from './user.model';

const createUserToDB = async (payload: Partial<IUser>): Promise<{ user: IUser; accessToken: string; refreshToken: string }> => {
  const { deviceId, name, email, password, ...rest } = payload;

  // If deviceId is provided, try to find an existing guest user and upgrade them
  if (deviceId) {
    const existingGuest = await User.findOne({ deviceId, role: USER_ROLES.GUEST });
    if (existingGuest) {
      // Check if email is already taken by another user
      if (email) {
        const emailTaken = await User.findOne({ email, _id: { $ne: existingGuest._id } });
        if (emailTaken) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        password as string,
        Number(config.bcrypt_salt_rounds)
      );

      // Upgrade the guest user to a full user
      const upgradedUser = await User.findOneAndUpdate(
        { _id: existingGuest._id },
        {
          name,
          email,
          password: hashedPassword,
          role: USER_ROLES.USER,
          verified: true,
          ...rest,
        },
        { new: true }
      );

      if (!upgradedUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to upgrade guest user');
      }

      const jwtPayload = {
        id: upgradedUser._id,
        role: upgradedUser.role,
        email: upgradedUser.email,
      };
      const accessToken = jwtHelper.createToken(
        jwtPayload,
        config.jwt.jwt_secret as string,
        config.jwt.jwt_expire_in as StringValue
      );
      const refreshToken = jwtHelper.createToken(
        jwtPayload,
        config.jwt.jwt_refresh_secret as string,
        config.jwt.jwt_refresh_expire_in as StringValue
      );

      return { user: upgradedUser, accessToken, refreshToken };
    }
  }

  //set role and verified status
  payload.role = USER_ROLES.USER;
  payload.verified = true;
  
  const createdUser = await User.create(payload);
  if (!createdUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const jwtPayload = {
    id: createdUser._id,
    role: createdUser.role,
    email: createdUser.email,
  };
  const accessToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt.jwt_secret as string,
    config.jwt.jwt_expire_in as StringValue
  );
  const refreshToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as string,
    config.jwt.jwt_refresh_expire_in as StringValue
  );

  return { user: createdUser, accessToken, refreshToken };
};

const getUserProfileFromDB = async (
  user: JwtPayload
) => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Get Giving Summary
  const givingSummary = await GivingService.getProfileGivingSummary(id);

  // Get recent 3 saved sermons
  const savedSermons = await getFavoriteSermonsFromDB(user, 3);

  // Generate initials
  const initials = isExistUser.name
    ? isExistUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return {
    user: {
      id: (isExistUser as any)._id,
      name: isExistUser.name,
      email: isExistUser.email,
      initials,
      member_since: new Date((isExistUser as any).createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      status: 'ACTIVE MEMBER', // Hardcoded as per UI screenshot
      role: isExistUser.role,
    },
    giving_summary: givingSummary,
    saved_sermons: savedSermons,
  };
};

const getUserGivingSummaryFromDB = async (user: JwtPayload) => {
  const { id } = user;
  return await GivingService.getProfileGivingSummary(id);
};

const getUserGivingHistoryFromDB = async (user: JwtPayload, page: number, limit: number, year?: number) => {
  const { id } = user;
  return await GivingService.getUserGivingHistory(id, page, limit, year);
};

const deleteAccountFromDB = async (user: JwtPayload) => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  await User.findByIdAndDelete(id);
  return null;
};


const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Removed unlinkFile because images are now managed by Media Gallery and shared.


  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getAllUsersFromDB = async (): Promise<IUser[]> => {
  const users = await User.find({ role: USER_ROLES.USER }).sort({ createdAt: -1 });
  return users;
};

const toggleFavoriteSermonToDB = async (user: JwtPayload, sermonId: string) => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const favoriteSermons = isExistUser.favoriteSermons || [];
  const index = favoriteSermons.findIndex((sId: any) => sId.toString() === sermonId);

  if (index === -1) {
    // Add
    favoriteSermons.push(sermonId as any);
  } else {
    // Remove
    favoriteSermons.splice(index, 1);
  }

  const updateDoc = await User.findOneAndUpdate(
    { _id: id },
    { favoriteSermons },
    { new: true }
  ).populate('favoriteSermons');

  return updateDoc;
};

const getFavoriteSermonsFromDB = async (user: JwtPayload, limit?: number) => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const userData = await User.findById(id).populate('favoriteSermons');
  let favorites = userData?.favoriteSermons || [];

  // Reverse array to show the most recently added items first
  favorites = [...favorites].reverse();

  if (limit) {
    favorites = favorites.slice(0, limit);
  }

  return favorites;
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsersFromDB,
  toggleFavoriteSermonToDB,
  getFavoriteSermonsFromDB,
  getUserGivingSummaryFromDB,
  getUserGivingHistoryFromDB,
  deleteAccountFromDB,
};
