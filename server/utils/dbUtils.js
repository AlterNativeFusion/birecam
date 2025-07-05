export const getRows = (result) => {
  if (Array.isArray(result)) return result;
  if (result?.rows) return result.rows;
  return [];
};