import { z } from 'zod';

const createEventCategoryZodSchema = z.object({
  body: z.object({
    label: z.string({ required_error: 'Label is required' }),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
    sortOrder: z.number().optional(),
  }),
});

const updateEventCategoryZodSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color').optional(),
    sortOrder: z.number().optional(),
  }),
});

const createEventZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    categoryId: z.string({ required_error: 'Category ID is required' }),
    date: z.string({ required_error: 'Date is required' }),
    time: z.string({ required_error: 'Time is required' }),
    location: z.string({ required_error: 'Location is required' }),
    description: z.string({ required_error: 'Description is required' }),
    image: z.string().optional(),
    isDraft: z.boolean().optional(),
  }),
});

const updateEventZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    categoryId: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    isDraft: z.boolean().optional(),
  }),
});



export const EventsValidation = {
  createEventCategoryZodSchema,
  updateEventCategoryZodSchema,
  createEventZodSchema,
  updateEventZodSchema,

};
