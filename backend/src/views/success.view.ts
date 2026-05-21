/**
 * Success view — standard response formatter for successful operations
 */
export const formatSuccess = (data: unknown = null, message: string = 'Success') => {
  return {
    success: true as const,
    message,
    data,
  };
};

export const formatCreated = (data: unknown = null, message: string = 'Created successfully') => {
  return {
    success: true as const,
    message,
    data,
  };
};

export const formatList = (data: unknown[], total?: number) => {
  return {
    success: true as const,
    data,
    ...(total !== undefined && { total }),
  };
};
