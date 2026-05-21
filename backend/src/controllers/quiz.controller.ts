import { Request, Response, NextFunction } from 'express';
import * as quizService from '../services/quiz.service';

const handleKnownError = (res: Response, error: any) => {
  const messages: Record<string, { status: number; message: string }> = {
    QUIZ_NOT_OPEN: { status: 400, message: 'Bộ câu hỏi chưa mở hoặc đã đóng' },
    ATTEMPT_ALREADY_SUBMITTED: { status: 409, message: 'Bạn đã nộp bài cho bộ câu hỏi này' },
    QUIZ_MISSING_QUESTIONS: { status: 400, message: 'Bộ câu hỏi cần có ít nhất một câu hỏi trước khi xuất bản' },
    QUESTION_MISSING_CORRECT_OPTION: { status: 400, message: 'Mỗi câu hỏi cần có một đáp án đúng trước khi xuất bản' }
  };

  const known = messages[error.message];
  if (!known) return false;

  res.status(known.status).json({
    success: false,
    error: { code: error.message, message: known.message }
  });
  return true;
};

export const getTopics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.getPublicTopics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSetsByTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.getPublicSetsByTopic(req.params.topicId, req.user!.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.getPublicSet(req.params.setId, req.user!.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const startAttempt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.startAttempt(req.params.setId, req.user!.userId);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    if (handleKnownError(res, error)) return;
    next(error);
  }
};

export const submitAttempt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.submitAttempt(req.params.attemptId, req.user!.userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    if (handleKnownError(res, error)) return;
    next(error);
  }
};

export const getResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.getResult(req.params.setId, req.user!.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.getLeaderboard(req.params.setId, Number(req.query.limit) || 10);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminTopics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.getAdminTopics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.createTopic(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.updateTopic(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const archiveTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.archiveTopic(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminSets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.getAdminSets(req.query.topicId as string | undefined);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.createSet(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.updateSet(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const archiveSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.archiveSet(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const publishSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.publishSet(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    if (handleKnownError(res, error)) return;
    next(error);
  }
};

export const closeSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.closeSet(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const cloneSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.cloneSetToDraft(req.params.id);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.getAdminQuestions(req.query.quizSetId as string);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.createQuestion(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.updateQuestion(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const archiveQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.archiveQuestion(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSetStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.getSetStats(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const batchSaveQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.batchSaveQuestions(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const data = await quizService.getDashboardStats(startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
