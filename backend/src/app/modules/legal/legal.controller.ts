import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { LegalService } from './legal.service';
import { LegalDocumentType } from './legal.interface';

const upsertLegalDocument = catchAsync(async (req: Request, res: Response) => {
  const type = req.params.type as LegalDocumentType;
  const result = await LegalService.upsertLegalDocument(type, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Legal document updated successfully',
    data: result,
  });
});

const getLegalDocument = catchAsync(async (req: Request, res: Response) => {
  const type = req.params.type as LegalDocumentType;
  const result = await LegalService.getLegalDocument(type);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Legal document retrieved successfully',
    data: result,
  });
});

const getLegalDocumentAdmin = catchAsync(async (req: Request, res: Response) => {
  const type = req.params.type as LegalDocumentType;
  const result = await LegalService.getLegalDocumentAdmin(type);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Legal document retrieved successfully',
    data: result,
  });
});

const getAllLegalDocuments = catchAsync(async (req: Request, res: Response) => {
  const result = await LegalService.getAllLegalDocuments();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Legal documents retrieved successfully',
    data: result,
  });
});

export const LegalController = {
  upsertLegalDocument,
  getLegalDocument,
  getLegalDocumentAdmin,
  getAllLegalDocuments,
};
