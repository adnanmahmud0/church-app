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
    const isMatch = await User.isMatchPassword(payload.currentPassword, isExistUser.password);
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
    const template = emailTemplate.createAccount(values);
    emailHelper.sendEmail(template);
    debug('admin.profile.email_verification_sent', { email: payload.email });
  }

  delete payload.currentPassword;

  const updateDoc = await User.findByIdAndUpdate(id, payload, { new: true }).select('-password');
  return updateDoc;
};

export const AdminService = {
  getAllAdminsToDB,
  createAdminToDB,
  updateAdminToDB,
  deleteAdminToDB,
  updateProfileToDB,
};
