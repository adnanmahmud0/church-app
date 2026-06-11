import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { EventsService } from './events.service';

const getUpcomingEvents = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category = req.query.category as string;
  const userId = req.user?.id || (req.query.userId as string);
  
  const result = await EventsService.getEvents(page, limit, false, category, userId, false);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Upcoming events retrieved successfully',
    data: result,
  });
});

const getLatestEvents = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
  const userId = req.user?.id || (req.query.userId as string);
  
  const result = await EventsService.getLatestEvents(limit, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Latest events retrieved successfully',
    data: result,
  });
});

const getPastEvents = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category = req.query.category as string;
  const userId = req.user?.id || (req.query.userId as string);
  
  // As per requirement, "History" now means events the user has RSVP'd to.
  // We pass isPast = null (all dates) and onlyRsvpd = true.
  const result = await EventsService.getEvents(page, limit, null, category, userId, false, true);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Past events retrieved successfully',
    data: result,
  });
});

const getAdminEvents = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const category = req.query.category as string;
  // If status is passed we can filter by upcoming/past, else get all
  const status = req.query.status as string; 
  let isPast = false;
  if(status === 'past') isPast = true;
  // Note: currently getEvents splits past and upcoming strictly. 
  // Let's modify getting all for admin if we need it, but for now we'll just use the existing method.
  
  const result = await EventsService.getEvents(page, limit, isPast, category, undefined, true);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Events retrieved successfully',
    data: result,
  });
});


const getEventById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || (req.query.userId as string);
  const result = await EventsService.getEventById(req.params.id, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event retrieved successfully',
    data: result,
  });
});

const rsvpEvent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: 'User is not authenticated',
      data: null,
    });
  }
  
  const result = await EventsService.rsvpEvent(req.params.id, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.hasRsvp ? 'RSVP successful' : 'RSVP cancelled',
    data: result,
  });
});

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.createEvent(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Event created successfully',
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.updateEvent(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event updated successfully',
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.deleteEvent(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event deleted successfully',
    data: result,
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.getCategories();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.createCategory(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.updateCategory(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.deleteCategory(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Category deleted successfully',
    data: result,
  });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.getStats();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Stats retrieved successfully',
    data: result,
  });
});

export const EventsController = {
  getUpcomingEvents,
  getLatestEvents,
  getPastEvents,
  getAdminEvents,
  getEventById,
  rsvpEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStats,
};
