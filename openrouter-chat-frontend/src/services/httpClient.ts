import { API_BASE_URL } from '../config/api';

// Global logout callback for handling 401 errors
let globalLogoutCallback: (() => void) | null = null;

export function setGlobalLogoutCallback(callback: (() => void) | null) {
  globalLogoutCallback = callback;
}

// Enhanced error class for HTTP errors
export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;
  public readonly method: string;
  public readonly responseBody?: any;
  public readonly userMessage: string;
  public readonly technicalDetails: string;

  constructor(
    response: Response,
    responseBody: any,
    method: string,
    url: string
  ) {
    const message = responseBody?.error || `HTTP ${response.status}: ${response.statusText}`;
    super(message);
    
    this.name = 'HttpError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = url;
    this.method = method;
    this.responseBody = responseBody;
    this.userMessage = message || `HTTP ${response.status}: ${response.statusText}`;
    this.technicalDetails = `${method} ${url} - ${response.status} ${response.statusText}`;
  }
}

// HTTP client configuration
interface HttpClientConfig {
  timeout?: number;
}

// Default configuration
const DEFAULT_CONFIG: HttpClientConfig = {
  timeout: 30000, // 30 seconds default
};

// Timeout configurations for different operations
const TIMEOUT_CONFIGS = {
  auth: 15000,      // 15 seconds for auth operations
  chat: 60000,      // 60 seconds for chat/AI operations
  upload: 120000,   // 2 minutes for file uploads
  default: 30000    // 30 seconds for other operations
};

// Enhanced fetch with timeout and connection error handling
const fetchWithTimeout = (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    fetch(url, { ...options, signal: controller.signal })
      .then(resolve)
      .catch((error) => {
        // Enhanced error handling for different connection scenarios
        if (error.name === 'AbortError') {
          reject(new Error(`Request timeout after ${timeoutMs}ms`));
        } else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          // This usually indicates network connectivity issues
          reject(new Error('Unable to connect to server. Please check your internet connection.'));
        } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
          reject(new Error('Network error occurred. Please try again.'));
        } else {
          reject(error);
        }
      })
      .finally(() => clearTimeout(timeoutId));
  });
};

// Enhanced HTTP client class
export class HttpClient {
  private config: HttpClientConfig;
  private token?: string;

  constructor(config: HttpClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = undefined;
  }

  private getTimeoutForOperation(endpoint: string, defaultTimeout?: number): number {
    if (defaultTimeout) return defaultTimeout;
    
    // Determine timeout based on endpoint
    if (endpoint.includes('/login') || endpoint.includes('/register') || endpoint.includes('/me')) {
      return TIMEOUT_CONFIGS.auth;
    }
    if (endpoint.includes('/chat') && endpoint.includes('/messages')) {
      return TIMEOUT_CONFIGS.chat;
    }
    if (endpoint.includes('/attachments')) {
      return TIMEOUT_CONFIGS.upload;
    }
    
    return TIMEOUT_CONFIGS.default;
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: {
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const timeout = options.timeout || this.getTimeoutForOperation(endpoint);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: 'include'
    };

    if (options.body && method !== 'GET') {
      requestOptions.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body);
    }

    const response = await fetchWithTimeout(url, requestOptions, timeout);
    
    // Try to parse response body
    let responseBody: any;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType?.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
    } catch (parseError) {
      // If we can't parse the response, use status text
      responseBody = { error: response.statusText };
    }

    // Handle non-2xx responses
    if (!response.ok) {
      const httpError = new HttpError(response, responseBody, method, url);
      
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        // Call global logout callback if set
        if (globalLogoutCallback) {
          globalLogoutCallback();
        }
      }
      
      throw httpError;
    }

    // Return successful response
    return responseBody as T;
  }

  // HTTP method helpers
  async get<T>(endpoint: string, options?: { headers?: Record<string, string>; timeout?: number }): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, options);
  }

  async post<T>(endpoint: string, body?: any, options?: { headers?: Record<string, string>; timeout?: number }): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, { ...options, body });
  }

  async put<T>(endpoint: string, body?: any, options?: { headers?: Record<string, string>; timeout?: number }): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, { ...options, body });
  }

  async delete<T>(endpoint: string, options?: { headers?: Record<string, string>; timeout?: number }): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, options);
  }

  // Special method for blob responses (like file downloads)
  async getBlob(endpoint: string, options?: { headers?: Record<string, string>; timeout?: number }): Promise<Blob> {
    const url = `${API_BASE_URL}${endpoint}`;
    const timeout = options?.timeout || this.config.timeout!;
    
    const headers: Record<string, string> = {
      ...options?.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let responseBody: any = null;
        
        // Try to get error details from JSON response
        if (contentType && contentType.includes('application/json')) {
          try {
            responseBody = await response.json();
          } catch {
            // Ignore JSON parsing errors
          }
        }

        throw new HttpError(response, responseBody, 'GET', url);
      }

      // Return successful blob response
      return await response.blob();
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
}

// Global HTTP client instance
export const httpClient = new HttpClient();
