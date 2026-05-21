import { Request, Response, NextFunction } from 'express';
import * as eventsService from '../services/events.service';

const knownErrors: Record<string, { status: number; message: string }> = {
  EVENT_INVALID_DATE: { status: 400, message: 'Thời gian sự kiện không hợp lệ' },
  EVENT_INVALID_DATE_RANGE: { status: 400, message: 'Thời gian kết thúc phải sau thời gian bắt đầu' },
  EVENT_MISSING_IMAGES: { status: 400, message: 'Sự kiện cần có ít nhất một ảnh trước khi xuất bản' },
  EVENT_MISSING_THUMBNAIL: { status: 400, message: 'Vui lòng chọn ảnh thumbnail trước khi xuất bản' },
  EVENT_THUMBNAIL_NOT_IN_IMAGES: { status: 400, message: 'Ảnh thumbnail phải nằm trong danh sách ảnh sự kiện' },
  NOT_FOUND: { status: 404, message: 'Không tìm thấy sự kiện' }
};

const handleKnownError = (res: Response, error: any) => {
  const known = knownErrors[error.message];
  if (!known) return false;

  res.status(known.status).json({
    success: false,
    error: { code: error.message, message: known.message }
  });
  return true;
};

export const getAdminEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await eventsService.getAdminEvents(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await eventsService.createEvent(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    if (handleKnownError(res, error)) return;
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await eventsService.updateEvent(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    if (handleKnownError(res, error)) return;
    next(error);
  }
};

export const archiveEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await eventsService.archiveEvent(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    if (handleKnownError(res, error)) return;
    next(error);
  }
};

export const publishEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await eventsService.publishEvent(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    if (handleKnownError(res, error)) return;
    next(error);
  }
};

export const closeEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await eventsService.closeEvent(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    if (handleKnownError(res, error)) return;
    next(error);
  }
};

export const getPublicEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await eventsService.getPublicEvents(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPublicEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await eventsService.getPublicEvent(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    if (handleKnownError(res, error)) return;
    next(error);
  }
};
