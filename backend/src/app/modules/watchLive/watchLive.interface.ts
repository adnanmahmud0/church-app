import { Document } from 'mongoose';

export interface IWatchLiveSettings {
  youtubeApiKey: string;
  youtubeChannelId: string;
  serviceSchedule: string;
  serviceTime: string;
  serviceAddress: string;
}

export interface IWatchLiveSettingsDoc extends IWatchLiveSettings, Document {}

export interface IWatchLivePlatform {
  label: string;
  description: string;
  icon: string;
  color: string;
  isYoutube: boolean;
  isActive: boolean;
  watchUrl: string | null;
  sortOrder: number;
}

export interface IWatchLivePlatformDoc extends IWatchLivePlatform, Document {}

export interface IYouTubeLiveStream {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  watchUrl: string;
  startedAt?: string;
  scheduledAt?: string;
  scheduledAtFormatted?: string;
}

export interface IYouTubeStatusResponse {
  isLive: boolean;
  liveStream: IYouTubeLiveStream | null;
  upcomingStream: IYouTubeLiveStream | null;
}

export interface IYouTubeRecentVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  watchUrl: string;
  duration: string;
  publishedAt: string;
  publishedFormatted: string;
}

export interface IYouTubeChannelInfo {
  channelId: string;
  channelTitle: string;
  channelUrl: string;
  subscriberCount: string;
  thumbnailUrl: string;
}
