function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL?.trim();
  if (!envUrl) return '/api/v1';
  let cleanUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  if (!cleanUrl.endsWith('/api/v1') && !cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api/v1`;
  }
  return cleanUrl;
}

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code = 'API_ERROR', status = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = localStorage.getItem('bizflow_token');
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
      credentials: 'include',
    });
  } catch (netErr: any) {
    console.error(`Network fetch failed for [${options.method || 'GET'}] ${url}:`, netErr);
    throw new ApiError(
      `Unable to reach backend at ${API_BASE_URL}. Please ensure your Vercel VITE_API_BASE_URL is saved and redeployed.`,
      'NETWORK_ERROR',
      0
    );
  }

  // Handle CSV/Blob downloads
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    if (!response.ok) {
      throw new ApiError('Failed to download CSV export', 'EXPORT_FAILED', response.status);
    }
    const blob = await response.blob();
    return blob as unknown as T;
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = { success: false, error: { message: response.statusText } };
  }

  if (!response.ok || data.success === false) {
    const errorMsg = data.error?.message || data.message || `Request failed with status ${response.status}`;
    const errorCode = data.error?.code || 'REQUEST_FAILED';
    throw new ApiError(errorMsg, errorCode, response.status, data.error?.details);
  }

  return data.data !== undefined ? data.data : data;
}
