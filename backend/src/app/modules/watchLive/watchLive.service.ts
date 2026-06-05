import NodeCache from 'node-cache';
import { WatchLiveSettings, WatchLivePlatform } from './watchLive.model';
import {
  IWatchLiveSettings,
  IWatchLivePlatform,
  IYouTubeStatusResponse,
  IYouTubeRecentVideo,
  IYouTubeChannelInfo,
} from './watchLive.interface';

// Initialize cache
const youtubeCache = new NodeCache({ stdTTL: 60 });

const getSettings = async () => {
  return await (WatchLiveSettings as any).getSettings();
};

const updateSettings = async (payload: Partial<IWatchLiveSettings>) => {
  const settings = await getSettings();
  (settings as any).set(payload);
  await settings.save();
  
  // Clear cache if API key or channel ID changes
  if (payload.youtubeApiKey || payload.youtubeChannelId) {
    youtubeCache.flushAll();
  }
  
  return settings;
};

const getPlatforms = async () => {
  // Ensure YouTube platform exists
  let youtubePlatform = await WatchLivePlatform.findOne({ isYoutube: true });
  if (!youtubePlatform) {
    youtubePlatform = await WatchLivePlatform.create({
      label: 'YouTube Live',
      description: 'Opens YouTube in browser',
      icon: 'youtube',
      color: '#FF0000',
      isYoutube: true,
      isActive: true,
      sortOrder: -1, // always first
    });
  }
  
  return await WatchLivePlatform.find().sort({ sortOrder: 1 });
};

const addPlatform = async (payload: Partial<IWatchLivePlatform>) => {
  payload.isYoutube = false; // ensure manual platforms aren't marked as YouTube
  const maxOrder = await WatchLivePlatform.findOne().sort('-sortOrder');
  payload.sortOrder = maxOrder ? maxOrder.sortOrder + 1 : 1;
  return await WatchLivePlatform.create(payload);
};

const updatePlatform = async (id: string, payload: Partial<IWatchLivePlatform>) => {
  delete payload.isYoutube; // prevent changing this flag
  return await WatchLivePlatform.findByIdAndUpdate(id, payload, { new: true });
};

const deletePlatform = async (id: string) => {
  const platform = await WatchLivePlatform.findById(id);
  if (!platform) {
    throw new Error('Platform not found');
  }
  if (platform.isYoutube) {
    throw new Error('Cannot delete the built-in YouTube platform');
  }
  return await WatchLivePlatform.findByIdAndDelete(id);
};

const reorderPlatforms = async (items: { id: string; sortOrder: number }[]) => {
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id, isYoutube: false }, // Prevent reordering YouTube? We can allow it but default to -1
      update: { sortOrder: item.sortOrder },
    },
  }));
  await WatchLivePlatform.bulkWrite(bulkOps as any);
};

// --- YouTube API Integration ---

const getYouTubeApiKey = async (): Promise<string> => {
  const settings = await getSettings();
  const key = settings.youtubeApiKey || process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error('YouTube API key is not configured');
  }
  return key;
};

const getYouTubeChannelId = async (): Promise<string> => {
  const settings = await getSettings();
  if (!settings.youtubeChannelId) {
    throw new Error('YouTube Channel ID is not configured');
  }
  return settings.youtubeChannelId;
};

const parseISO8601Duration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return duration;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  return `${seconds} sec`;
};

const getYoutubeStatus = async (): Promise<IYouTubeStatusResponse> => {
  const cacheKey = 'youtube_status';
  const cached = youtubeCache.get<IYouTubeStatusResponse>(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = await getYouTubeApiKey();
    const channelId = await getYouTubeChannelId();

    // Fetch both live and upcoming streams concurrently
    const [liveRes, upcomingRes] = await Promise.all([
      fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`),
      fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&key=${apiKey}`)
    ]);

    const liveData = await liveRes.json();
    const upcomingData = await upcomingRes.json();

    const response: IYouTubeStatusResponse = {
      isLive: false,
      liveStream: null,
      upcomingStream: null,
    };

    if (liveData.items && liveData.items.length > 0) {
      const item = liveData.items[0];
      response.isLive = true;
      response.liveStream = {
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        startedAt: item.snippet.publishedAt,
      };
    } else if (upcomingData.items && upcomingData.items.length > 0) {
      const item = upcomingData.items[0];
      
      // Need to fetch video details to get actual scheduled start time
      const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${item.id.videoId}&key=${apiKey}`);
      const videoData = await videoRes.json();
      const scheduledAt = videoData.items?.[0]?.liveStreamingDetails?.scheduledStartTime;
      
      let scheduledAtFormatted = '';
      if (scheduledAt) {
        const date = new Date(scheduledAt);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };
        scheduledAtFormatted = date.toLocaleDateString('en-GB', options);
      }

      response.upcomingStream = {
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        scheduledAt,
        scheduledAtFormatted,
      };
    }

    youtubeCache.set(cacheKey, response, 60); // Cache for 60 seconds
    return response;
  } catch (error) {
    console.error('YouTube API Error:', error);
    return { isLive: false, liveStream: null, upcomingStream: null }; // Silent fail to not break app
  }
};

const getRecentVideos = async (limit: number = 10): Promise<IYouTubeRecentVideo[]> => {
  const cacheKey = `youtube_recent_${limit}`;
  const cached = youtubeCache.get<IYouTubeRecentVideo[]>(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = await getYouTubeApiKey();
    const channelId = await getYouTubeChannelId();

    // Get recent videos
    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${limit}&key=${apiKey}`);
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // Get durations for those videos
    const videoIds = searchData.items.map((i: any) => i.id.videoId).join(',');
    const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`);
    const videoData = await videoRes.json();

    const durationMap: Record<string, string> = {};
    if (videoData.items) {
      videoData.items.forEach((item: any) => {
        durationMap[item.id] = parseISO8601Duration(item.contentDetails.duration);
      });
    }

    const videos: IYouTubeRecentVideo[] = searchData.items.map((item: any) => {
      const date = new Date(item.snippet.publishedAt);
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        duration: durationMap[item.id.videoId] || '',
        publishedAt: item.snippet.publishedAt,
        publishedFormatted: date.toLocaleDateString('en-GB', options),
      };
    });

    youtubeCache.set(cacheKey, videos, 15 * 60); // Cache for 15 minutes
    return videos;
  } catch (error) {
    console.error('YouTube API Error (Recent):', error);
    return [];
  }
};

const getChannelInfo = async (): Promise<IYouTubeChannelInfo | null> => {
  const cacheKey = 'youtube_channel';
  const cached = youtubeCache.get<IYouTubeChannelInfo>(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = await getYouTubeApiKey();
    const channelId = await getYouTubeChannelId();

    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    const channelInfo: IYouTubeChannelInfo = {
      channelId: item.id,
      channelTitle: item.snippet.title,
      channelUrl: `https://www.youtube.com/channel/${item.id}`,
      subscriberCount: item.statistics.subscriberCount,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    };

    youtubeCache.set(cacheKey, channelInfo, 60 * 60); // Cache for 1 hour
    return channelInfo;
  } catch (error) {
    console.error('YouTube API Error (Channel):', error);
    return null;
  }
};

const testYoutubeConnection = async (apiKey: string, channelId: string) => {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`);
    const data = await res.json();
    
    if (data.error) {
      return { valid: false, message: data.error.message };
    }
    
    if (!data.items || data.items.length === 0) {
      return { valid: false, message: 'Channel not found' };
    }

    return { valid: true, channelTitle: data.items[0].snippet.title };
  } catch (error: any) {
    return { valid: false, message: error.message };
  }
};

export const WatchLiveService = {
  getSettings,
  updateSettings,
  getPlatforms,
  addPlatform,
  updatePlatform,
  deletePlatform,
  reorderPlatforms,
  getYoutubeStatus,
  getRecentVideos,
  getChannelInfo,
  testYoutubeConnection,
};
