/**
 * Error view — standard response formatter for error responses
 */
export const formatError = (message: string = 'Internal server error', errors: unknown = null) => {
  return {
    success: false as const,
    message,
    ...(errors ? { errors } : {}),
  };
};

export const formatValidationError = (errors: Array<{ field: string; message: string }>) => {
  return {
    success: false as const,
    message: 'Validation failed',
    errors,
  };
};

export const formatUnauthorized = (message: string = 'Authentication required') => {
  return {
    success: false as const,
    message,
  };
};

export const formatForbidden = (message: string = 'Access denied') => {
  return {
    success: false as const,
    message,
  };
};

export const formatNotFound = (message: string = 'Resource not found') => {
  return {
    success: false as const,
    message,
  };
};
