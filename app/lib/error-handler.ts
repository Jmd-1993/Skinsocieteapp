// Comprehensive error handling utility for the application

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'GENERIC_ERROR',
    status: number = 500,
    details: any = null,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  PHOREST_ERROR: 'PHOREST_ERROR',
  STRIPE_ERROR: 'STRIPE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOTIFICATION_ERROR: 'NOTIFICATION_ERROR'
} as const;

// Error handler for API routes
export function handleApiError(error: any): ApiError {
  console.error('API Error:', error);

  // Handle known errors
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    };
  }

  // Handle Phorest API errors
  if (error.response?.data) {
    const phorestError = error.response.data;
    return {
      message: phorestError.message || 'Phorest API error',
      code: ErrorTypes.PHOREST_ERROR,
      status: error.response.status,
      details: phorestError
    };
  }

  // Handle Stripe errors
  if (error.type?.includes('Stripe')) {
    return {
      message: error.message || 'Payment processing error',
      code: ErrorTypes.STRIPE_ERROR,
      status: 400,
      details: { type: error.type, code: error.code }
    };
  }

  // Handle network errors
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return {
      message: 'Network connection error. Please check your internet connection.',
      code: ErrorTypes.NETWORK_ERROR,
      status: 503,
      details: { originalError: error.message }
    };
  }

  // Default error
  return {
    message: error.message || 'An unexpected error occurred',
    code: ErrorTypes.SERVER_ERROR,
    status: 500,
    details: process.env.NODE_ENV === 'development' ? error : undefined
  };
}

// User-friendly error messages
export function getUserFriendlyMessage(error: ApiError): string {
  switch (error.code) {
    case ErrorTypes.NETWORK_ERROR:
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    case ErrorTypes.AUTH_ERROR:
      return 'Authentication failed. Please log in again.';
    case ErrorTypes.VALIDATION_ERROR:
      return 'Please check your input and try again.';
    case ErrorTypes.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorTypes.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.';
    case ErrorTypes.PHOREST_ERROR:
      return 'Unable to connect to booking system. Please try again later.';
    case ErrorTypes.STRIPE_ERROR:
      return 'Payment processing error. Please check your payment details.';
    case ErrorTypes.DATABASE_ERROR:
      return 'Database connection error. Please try again later.';
    case ErrorTypes.NOTIFICATION_ERROR:
      return 'Unable to send notification. The booking was successful but you may not receive a confirmation.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
}

// Retry logic for transient errors
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (
        error.status === 400 || // Bad request
        error.status === 401 || // Unauthorized
        error.status === 403 || // Forbidden
        error.status === 404    // Not found
      ) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Error logging
export function logError(error: any, context?: any): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    },
    context,
    environment: process.env.NODE_ENV
  };
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (e.g., Sentry, LogRocket)
    console.error('[ERROR LOG]', JSON.stringify(errorLog, null, 2));
  } else {
    console.error('[ERROR LOG]', errorLog);
  }
}

// Toast notification helper for client-side
export function showErrorToast(error: any): void {
  const apiError = handleApiError(error);
  const message = getUserFriendlyMessage(apiError);
  
  // This would integrate with your toast library
  // For now, using console and alert as fallback
  console.error('Toast Error:', message);
  
  if (typeof window !== 'undefined') {
    // You can replace this with your toast library
    // e.g., toast.error(message)
    console.error(message);
  }
}