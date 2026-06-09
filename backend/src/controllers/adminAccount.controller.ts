import { NextFunction, Request, Response } from 'express';
import * as accountService from '../services/adminAccount.service';
import { listAuditLogs } from '../services/adminAudit.service';

const context = (req: Request) => ({
  actorId: req.user!.userId,
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});

const handleKnown = (res: Response, error: any) => {
  const messages: Record<string, string> = {
    NOT_FOUND: 'Không tìm thấy tài khoản quản trị',
    CANNOT_CHANGE_SELF_ACCESS: 'Bạn không thể tự khóa hoặc tự hạ quyền chính mình',
    LAST_ACTIVE_SUPER_ADMIN: 'Không thể khóa hoặc hạ quyền SUPER_ADMIN đang hoạt động cuối cùng'
  };
  if (messages[error.message]) {
    res.status(error.message === 'NOT_FOUND' ? 404 : 400).json({ success: false, error: { code: error.message, message: messages[error.message] } });
    return true;
  }
  if (error.code === 'P2002') {
    res.status(409).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email đã được sử dụng' } });
    return true;
  }
  return false;
};

export const listAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await accountService.listAdminAccounts(req.query as any) }); } catch (error) { next(error); }
};
export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json({ success: true, data: await accountService.createAdminAccount(req.user!.userId, req.body, context(req)) }); }
  catch (error) { if (!handleKnown(res, error)) next(error); }
};
export const updateAccount = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await accountService.updateAdminAccount(req.user!.userId, req.params.id, req.body, context(req)) }); }
  catch (error) { if (!handleKnown(res, error)) next(error); }
};
export const disableAccount = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await accountService.setAdminAccountStatus(req.user!.userId, req.params.id, 'DISABLED', context(req)) }); }
  catch (error) { if (!handleKnown(res, error)) next(error); }
};
export const enableAccount = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await accountService.setAdminAccountStatus(req.user!.userId, req.params.id, 'ACTIVE', context(req)) }); }
  catch (error) { if (!handleKnown(res, error)) next(error); }
};
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await accountService.resetAdminPassword(req.params.id, context(req)) }); }
  catch (error) { if (!handleKnown(res, error)) next(error); }
};
export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await listAuditLogs(req.query as any) }); } catch (error) { next(error); }
};
