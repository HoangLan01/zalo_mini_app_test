/**
 * Unit tests for feedback.service.ts
 */
import '../setup';
import { prismaMock, createMockUser, createMockFeedback } from '../setup';
import * as feedbackService from '../../services/feedback.service';
import { AppError } from '../../utils/appError';

describe('createFeedback', () => {
  const validFieldInput = {
    type: 'FIELD' as const,
    title: 'Đường hư hỏng',
    category: 'HA_TANG' as const,
    contactPhone: '0901234567',
    description: 'Đường phố bị nứt vỡ nghiêm trọng',
    imageUrls: ['https://example.com/img1.jpg'],
  };

  const validServiceInput = {
    type: 'SERVICE_ATTITUDE' as const,
    serviceUnit: 'Bộ phận Hộ tịch',
    satisfactionScore: 2,
    contactPhone: '0901234567',
    description: 'Thái độ phục vụ không tốt',
  };

  it('should create FIELD feedback successfully', async () => {
    prismaMock.feedback.count.mockResolvedValue(0);
    const mockFeedback = createMockFeedback();
    prismaMock.feedback.create.mockResolvedValue({
      ...mockFeedback,
      user: createMockUser(),
    } as any);

    const result = await feedbackService.createFeedback('test-user-id', validFieldInput);

    expect(prismaMock.feedback.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should create SERVICE_ATTITUDE feedback successfully', async () => {
    prismaMock.feedback.count.mockResolvedValue(0);
    const mockFeedback = createMockFeedback({ type: 'SERVICE_ATTITUDE' });
    prismaMock.feedback.create.mockResolvedValue({
      ...mockFeedback,
      user: createMockUser(),
    } as any);

    const result = await feedbackService.createFeedback('test-user-id', validServiceInput);

    expect(result).toBeDefined();
  });

  it('should throw MISSING_TITLE for FIELD type without title', async () => {
    const input = { ...validFieldInput, title: '' };

    await expect(feedbackService.createFeedback('test-user-id', input))
      .rejects.toThrow('Vui lòng nhập tiêu đề phản ánh');
  });

  it('should throw MISSING_CATEGORY for FIELD type without category', async () => {
    const input = { ...validFieldInput, category: undefined };

    await expect(feedbackService.createFeedback('test-user-id', input as any))
      .rejects.toThrow('Vui lòng chọn danh mục phản ánh');
  });

  it('should throw MISSING_DESCRIPTION for empty description', async () => {
    const input = { ...validFieldInput, description: '' };

    await expect(feedbackService.createFeedback('test-user-id', input))
      .rejects.toThrow('Vui lòng nhập nội dung phản ánh');
  });

  it('should throw TOO_MANY_IMAGES when more than 3 images', async () => {
    const input = {
      ...validFieldInput,
      imageUrls: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'],
    };

    await expect(feedbackService.createFeedback('test-user-id', input))
      .rejects.toThrow('Chỉ được đính kèm tối đa 3 ảnh');
  });

  it('should throw INVALID_CONTACT_PHONE for invalid phone number', async () => {
    const input = { ...validFieldInput, contactPhone: '123' };

    await expect(feedbackService.createFeedback('test-user-id', input))
      .rejects.toThrow('Số điện thoại liên hệ không hợp lệ');
  });

  it('should throw MISSING_SERVICE_UNIT for SERVICE_ATTITUDE without serviceUnit', async () => {
    const input = { ...validServiceInput, serviceUnit: '' };

    await expect(feedbackService.createFeedback('test-user-id', input))
      .rejects.toThrow('Vui lòng chọn đơn vị cần phản ánh');
  });

  it('should throw INVALID_SATISFACTION_SCORE for score out of range', async () => {
    const input = { ...validServiceInput, satisfactionScore: 6 };

    await expect(feedbackService.createFeedback('test-user-id', input))
      .rejects.toThrow('Mức độ hài lòng không hợp lệ');
  });
});

describe('updateFeedbackStatusByAdmin', () => {
  it('should update feedback status to PROCESSING', async () => {
    const mockFeedback = createMockFeedback();
    prismaMock.feedback.findUnique.mockResolvedValue(mockFeedback);
    prismaMock.feedback.update.mockResolvedValue({
      ...mockFeedback,
      status: 'PROCESSING',
      user: createMockUser(),
    } as any);

    const result = await feedbackService.updateFeedbackStatusByAdmin('test-feedback-id', {
      status: 'PROCESSING',
    });

    expect(result.status).toBe('PROCESSING');
  });

  it('should throw MISSING_RESPONSE when resolving without response text', async () => {
    const mockFeedback = createMockFeedback();
    prismaMock.feedback.findUnique.mockResolvedValue(mockFeedback);

    await expect(
      feedbackService.updateFeedbackStatusByAdmin('test-feedback-id', {
        status: 'RESOLVED',
        response: '',
      })
    ).rejects.toThrow('Vui lòng nhập phản hồi khi hoàn tất phản ánh');
  });

  it('should resolve feedback with response text', async () => {
    const mockFeedback = createMockFeedback();
    prismaMock.feedback.findUnique.mockResolvedValue(mockFeedback);
    prismaMock.feedback.update.mockResolvedValue({
      ...mockFeedback,
      status: 'RESOLVED',
      response: 'Đã xử lý',
      respondedAt: new Date(),
      user: createMockUser(),
    } as any);

    const result = await feedbackService.updateFeedbackStatusByAdmin('test-feedback-id', {
      status: 'RESOLVED',
      response: 'Đã xử lý',
    });

    expect(result.status).toBe('RESOLVED');
    expect(result.response).toBe('Đã xử lý');
  });

  it('should throw NOT_FOUND for nonexistent feedback', async () => {
    prismaMock.feedback.findUnique.mockResolvedValue(null);

    await expect(
      feedbackService.updateFeedbackStatusByAdmin('nonexistent', {
        status: 'PROCESSING',
      })
    ).rejects.toThrow('Không tìm thấy phản ánh');
  });
});

describe('getFeedbacksByUser', () => {
  it('should return paginated feedbacks for user', async () => {
    const mockFeedbacks = [createMockFeedback()];
    prismaMock.feedback.findMany.mockResolvedValue(mockFeedbacks);
    prismaMock.feedback.count.mockResolvedValue(1);

    const result = await feedbackService.getFeedbacksByUser('test-user-id', {
      page: 1,
      limit: 10,
    });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should filter by status when provided', async () => {
    prismaMock.feedback.findMany.mockResolvedValue([]);
    prismaMock.feedback.count.mockResolvedValue(0);

    await feedbackService.getFeedbacksByUser('test-user-id', {
      status: 'PENDING',
      page: 1,
      limit: 10,
    });

    expect(prismaMock.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'test-user-id', status: 'PENDING' }),
      })
    );
  });
});

describe('getFeedbackById', () => {
  it('should return feedback for correct user', async () => {
    const mockFeedback = createMockFeedback();
    prismaMock.feedback.findFirst.mockResolvedValue(mockFeedback);

    const result = await feedbackService.getFeedbackById('test-feedback-id', 'test-user-id');

    expect(result).toEqual(mockFeedback);
    expect(prismaMock.feedback.findFirst).toHaveBeenCalledWith({
      where: { id: 'test-feedback-id', userId: 'test-user-id' },
    });
  });

  it('should return null for wrong user', async () => {
    prismaMock.feedback.findFirst.mockResolvedValue(null);

    const result = await feedbackService.getFeedbackById('test-feedback-id', 'other-user-id');

    expect(result).toBeNull();
  });
});
