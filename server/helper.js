// server/helper.js
export const createResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
  };
};
