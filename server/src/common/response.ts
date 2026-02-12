export class ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;

  constructor(success: boolean, data?: T, message?: string, error?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }

  static success<T>(data?: T, message = '操作成功'): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static error(message = '操作失败', error?: string): ApiResponse {
    return new ApiResponse(false, undefined, message, error);
  }
}