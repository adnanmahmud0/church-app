import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../types/pagination';
import { ISermon } from './sermon.interface';
import { Sermon } from './sermon.model';

const createSermon = async (payload: ISermon) => {
  const result = await Sermon.create(payload);
  return result;
};

const getAllSermons = async (
  filters: { search?: string; category_id?: string },
  paginationOptions: IPaginationOptions
) => {
  const { search, category_id } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const andConditions = [];

  if (search) {
    andConditions.push({
      $or: ['title', 'speaker', 'tags'].map(field => ({
        [field]: {
          $regex: search,
          $options: 'i',
        },
      })),
    });
  }

  if (category_id) {
    andConditions.push({ category: category_id });
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Sermon.find(whereConditions)
    .populate('category', 'id name')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await Sermon.countDocuments(whereConditions);
  const total_pages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      total_pages,
      has_next_page: page < total_pages,
    },
    data: result,
  };
};

const getSermonById = async (id: string) => {
  const result = await Sermon.findById(id).populate('category', 'id name');
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sermon not found!');
  }
  return result;
};

const updateSermon = async (id: string, payload: Partial<ISermon>) => {
  const isExist = await Sermon.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sermon not found!');
  }
  const result = await Sermon.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

const deleteSermon = async (id: string) => {
  const isExist = await Sermon.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sermon not found!');
  }
  const result = await Sermon.findByIdAndDelete(id);
  return result;
};

const getLatestSermons = async (limit: number = 3) => {
  const result = await Sermon.find({})
    .populate('category', 'id name')
    .sort({ date: -1 })
    .limit(limit);
  
  return result;
};

export const SermonService = {
  createSermon,
  getAllSermons,
  getSermonById,
  updateSermon,
  deleteSermon,
  getLatestSermons,
};
