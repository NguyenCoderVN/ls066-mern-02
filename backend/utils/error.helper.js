export const handleError = (res, error, ctx) => {
  console.error(`Error in ${ctx}`, error.message);
  return res.status(500).json({ error: "Internal server error" });
};
