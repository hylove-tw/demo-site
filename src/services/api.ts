import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_ANALYSIS_API_BASE || 'http://localhost:3000';
const DEFAULT_TIMEOUT = 60000; // 60 seconds

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function formatError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const statusCode = axiosError.response?.status;
    const serverMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;

    if (axiosError.code === 'ECONNABORTED') {
      return new ApiError('請求超時，請稍後再試', statusCode, error);
    }

    if (!axiosError.response) {
      return new ApiError('無法連接到伺服器，請檢查網路連線', undefined, error);
    }

    const message = serverMessage || `請求失敗 (${statusCode})`;
    return new ApiError(message, statusCode, error);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, undefined, error);
  }

  return new ApiError('發生未知錯誤');
}

export async function post<T = any>(path: string, payload: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await axios.post<T>(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: DEFAULT_TIMEOUT,
    });
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
}
