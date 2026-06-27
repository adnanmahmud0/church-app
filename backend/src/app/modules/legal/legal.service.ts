import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ILegal, LegalDocumentType } from './legal.interface';
import { Legal } from './legal.model';

const upsertLegalDocument = async (type: LegalDocumentType, payload: Partial<ILegal>) => {
  const document = await Legal.findOneAndUpdate(
    { type },
    { ...payload, type },
    { new: true, upsert: true, runValidators: true }
  );
  return document;
};

const getLegalDocument = async (type: LegalDocumentType) => {
  const document = await Legal.findOne({ type, isActive: true });
  if (!document) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Legal document not found');
  }
  return document;
};

const getLegalDocumentAdmin = async (type: LegalDocumentType) => {
  let document = await Legal.findOne({ type });
  if (!document) {
    // Return empty template if not exists for admin to edit
    return {
      type,
      content: '',
      isActive: true
    };
  }
  return document;
};

const getAllLegalDocuments = async () => {
  const documents = await Legal.find().select('type isActive updatedAt');
  return documents;
};

export const LegalService = {
  upsertLegalDocument,
  getLegalDocument,
  getLegalDocumentAdmin,
  getAllLegalDocuments,
};
