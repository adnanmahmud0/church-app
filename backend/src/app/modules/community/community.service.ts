import { CommunityGroup } from './community.model';
import { ICommunityGroup, IPlatform } from './community.interface';

const getPlatformLabel = (platform: IPlatform): string => {
  switch (platform) {
    case 'whatsapp': return 'WhatsApp';
    case 'facebook': return 'Facebook Group';
    case 'telegram': return 'Telegram';
    case 'messenger': return 'Messenger';
    case 'other': return 'Community';
    default: return 'Community';
  }
};

const getAllGroups = async (isAdmin: boolean) => {
  const query = isAdmin ? {} : { isActive: true };
  const groups = await CommunityGroup.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
  
  return groups.map(g => ({
    id: g._id.toString(),
    title: g.title,
    description: g.description,
    joinLink: g.joinLink,
    platform: g.platform,
    platformLabel: g.platformLabel,
    sortOrder: g.sortOrder,
    isActive: g.isActive,
    createdAt: (g as any).createdAt,
  }));
};

const getGroupById = async (id: string) => {
  const group = await CommunityGroup.findById(id).lean();
  if (!group) return null;
  
  return {
    id: group._id.toString(),
    title: group.title,
    description: group.description,
    joinLink: group.joinLink,
    platform: group.platform,
    platformLabel: group.platformLabel,
    sortOrder: group.sortOrder,
    isActive: group.isActive,
    createdAt: (group as any).createdAt,
  };
};

const createGroup = async (payload: Partial<ICommunityGroup>) => {
  if (payload.platform) {
    payload.platformLabel = getPlatformLabel(payload.platform);
  }
  
  if (payload.sortOrder === undefined) {
    const lastGroup = await CommunityGroup.findOne().sort({ sortOrder: -1 });
    payload.sortOrder = lastGroup ? lastGroup.sortOrder + 1 : 1;
  }
  
  const result = await CommunityGroup.create(payload);
  return result;
};

const updateGroup = async (id: string, payload: Partial<ICommunityGroup>) => {
  if (payload.platform) {
    payload.platformLabel = getPlatformLabel(payload.platform);
  }
  
  const result = await CommunityGroup.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteGroup = async (id: string) => {
  // Soft delete by default as requested by standard patterns
  const result = await CommunityGroup.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  return result;
};

const reorderGroups = async (items: { id: string; sortOrder: number }[]) => {
  const operations = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id as any },
      update: { $set: { sortOrder: item.sortOrder } },
    },
  }));

  const result = await CommunityGroup.bulkWrite(operations);
  return result;
};

const getStats = async () => {
  const totalGroups = await CommunityGroup.countDocuments();
  const activeGroups = await CommunityGroup.countDocuments({ isActive: true });
  
  const platformStats = await CommunityGroup.aggregate([
    {
      $group: {
        _id: '$platform',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        platform: '$_id',
        count: 1,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return {
    totalGroups,
    activeGroups,
    byPlatform: platformStats,
  };
};

export const CommunityService = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  reorderGroups,
  getStats,
};
