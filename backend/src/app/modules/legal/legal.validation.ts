import { z } from 'zod';

const LegalDocumentTypes = [
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
  'disclaimer',
  'refund-and-returns-policy',
  'delete-account',
] as const;

const upsertLegalZodSchema = z.object({
  body: z.object({
    type: z.enum(LegalDocumentTypes, {
      required_error: 'Legal document type is required',
    }),
    content: z.string({
      required_error: 'Content is required',
    }),
    isActive: z.boolean().optional(),
  }),
});

export const LegalValidation = {
  upsertLegalZodSchema,
};
