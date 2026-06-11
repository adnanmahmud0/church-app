import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISermonCategory } from './sermonCategory.interface';
import { SermonCategory } from './sermonCategory.model';

const createSermonCategory = async (payload: ISermonCategory) => {
  const result = await SermonCategory.create(payload);
  return result;
};

const getAllSermonCategory = async () => {
  const result = await SermonCategory.aggregate([
    {
      $lookup: {
        from: 'sermons',
        localField: '_id',
        foreignField: 'category',
        as: 'sermonsData'
      }
    },
    {
      $addFields: {
        sermonCount: { $size: "$sermonsData" },
        id: "$_id"
      }
    },
    {
      $project: {
        _id: 0,
        id: "$_id",
        name: 1
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);
  return result;
};

const getSermonCategoryById = async (id: string) => {
  const result = await SermonCategory.findById(id).select('_id name');
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sermon Category not found!');
  }
  return result;
};

const updateSermonCategory = async (id: string, payload: Partial<ISermonCategory>) => {
  const isExist = await SermonCategory.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sermon Category not found!');
  }
  const result = await SermonCategory.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

const deleteSermonCategory = async (id: string) => {
  const isExist = await SermonCategory.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sermon Category not found!');
  }
  const result = await SermonCategory.findByIdAndDelete(id);
  return result;
};

export const SermonCategoryService = {
  createSermonCategory,
  getAllSermonCategory,
  getSermonCategoryById,
  updateSermonCategory,
  deleteSermonCategory,
};
