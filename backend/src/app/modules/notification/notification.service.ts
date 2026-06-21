import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import {
  INotificationLog,
  INotificationToken,
} from './notification.interface';
import { NotificationLog, NotificationToken } from './notification.model';

// Initialize Firebase Admin
try {
  if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Forcibly remove the conflicting environment variable so Firebase doesn't crash looking for the file
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } catch (e) {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      }
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      initializeApp();
    }
  }
} catch (error) {
  console.error('Firebase admin initialization error', error);
}

const saveDeviceToken = async (
  payload: INotificationToken
): Promise<INotificationToken> => {
  const isExist = await NotificationToken.findOne({ token: payload.token });

  if (isExist) {
    if (payload.user && String(isExist.user) !== String(payload.user)) {
      isExist.user = payload.user;
      await isExist.save();
    }
    return isExist;
  }

  const result = await NotificationToken.create(payload);
  return result;
};

const sendNotificationToAll = async (payload: {
  title: string;
  body: string;
  data?: { [key: string]: string };
}): Promise<INotificationLog> => {
  const tokens = await NotificationToken.find().distinct('token');

  if (!tokens || tokens.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No device tokens found');
  }

  const message: any = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    tokens: tokens,
  };

  if (payload.data) {
    message.data = payload.data;
  }

  let successCount = 0;
  let failureCount = 0;

  try {
    const response = await getMessaging().sendEachForMulticast(message);
    successCount = response.successCount;
    failureCount = response.failureCount;

    // Log the failed tokens for debugging/cleaning up
    if (failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      // Optionally, you can remove invalid tokens from the database here
      // await NotificationToken.deleteMany({ token: { $in: failedTokens } });
    }
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to send notifications: ${error.message || 'Unknown error'}`
    );
  }

  const logResult = await NotificationLog.create({
    title: payload.title,
    body: payload.body,
    successCount,
    failureCount,
  });

  return logResult;
};

const sendNotificationToTopic = async (
  topic: string,
  payload: {
    title: string;
    body: string;
    data?: { [key: string]: string };
  }
): Promise<INotificationLog> => {
  const message: any = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    topic: topic,
  };

  if (payload.data) {
    message.data = payload.data;
  }

  let successCount = 0;
  let failureCount = 0;

  try {
    const response = await getMessaging().send(message);
    successCount = 1; // topic send counts as 1 successful message dispatch
  } catch (error: any) {
    console.error(`Error sending message to topic ${topic}:`, error);
    failureCount = 1;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to send topic notification: ${error.message || 'Unknown error'}`
    );
  }

  const logResult = await NotificationLog.create({
    title: payload.title,
    body: payload.body,
    successCount,
    failureCount,
  });

  return logResult;
};

export const NotificationService = {
  saveDeviceToken,
  sendNotificationToAll,
  sendNotificationToTopic,
};
