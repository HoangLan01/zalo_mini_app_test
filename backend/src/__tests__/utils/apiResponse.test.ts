/**
 * Unit tests for apiResponse.ts
 */
import { sendSuccess, sendPaginated, sendError } from '../../utils/apiResponse';

// Helper to create a mock Express Response
function createMockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('sendSuccess', () => {
  it('should return 200 with success envelope by default', () => {
    const res = createMockResponse();
    sendSuccess(res, { id: '123' });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: '123' },
    });
  });

  it('should accept custom status code', () => {
    const res = createMockResponse();
    sendSuccess(res, { created: true }, 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { created: true },
    });
  });

  it('should handle null data', () => {
    const res = createMockResponse();
    sendSuccess(res, null);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: null,
    });
  });
});

describe('sendPaginated', () => {
  it('should return paginated response', () => {
    const res = createMockResponse();
    const data = [{ id: '1' }, { id: '2' }];
    const pagination = { page: 1, limit: 10, total: 25, totalPages: 3 };

    sendPaginated(res, data, pagination);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data,
      pagination,
    });
  });

  it('should accept custom status code', () => {
    const res = createMockResponse();
    sendPaginated(res, [], { page: 1, limit: 10, total: 0, totalPages: 0 }, 201);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('sendError', () => {
  it('should return error envelope with correct structure', () => {
    const res = createMockResponse();
    sendError(res, 'NOT_FOUND', 'Không tìm thấy', 404);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Không tìm thấy',
      },
    });
  });

  it('should include details when provided', () => {
    const res = createMockResponse();
    const details = { field: 'email', issue: 'invalid' };
    sendError(res, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', 400, details);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details,
      },
    });
  });

  it('should not include details key when not provided', () => {
    const res = createMockResponse();
    sendError(res, 'UNAUTHORIZED', 'Chưa xác thực', 401);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.error).not.toHaveProperty('details');
  });

  it('should handle 500 internal server error', () => {
    const res = createMockResponse();
    sendError(res, 'INTERNAL_SERVER_ERROR', 'Lỗi hệ thống', 500);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Lỗi hệ thống',
      },
    });
  });
});
