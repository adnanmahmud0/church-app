import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISermonSeries } from './sermonSeries.interface';
import { SermonSeries } from './sermonSeries.model';

const createSermonSeries = async (payload: ISermonSeries) => {
  const result = await SermonSeries.create(payload);
  return result;
};

const getAllSermonSeries = async () => {
  const result = await SermonSeries.aggregate([
    {
      $lookup: {
        from: 'sermons',
        localField: '_id',
        foreignField: 'series',
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
        sermonsData: 0
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);
  return result;
};

const getSermonSeriesById = async (id: string) => {
  const result = await SermonSeries.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sermon Series not found!');
  }
  return result;
};

const updateSermonSeries = async (id: string, payload: Partial<ISermonSeries>) => {
  const isExist = await SermonSeries.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sermon Series not found!');
  }
  const result = await SermonSeries.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

const deleteSermonSeries = async (id: string) => {
  const isExist = await SermonSeries.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sermon Series not found!');
  }
  const result = await SermonSeries.findByIdAndDelete(id);
  return result;
};

export const SermonSeriesService = {
  createSermonSeries,
  getAllSermonSeries,
  getSermonSeriesById,
  updateSermonSeries,
  deleteSermonSeries,
};
