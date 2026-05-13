export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    const stackArray = err.stack ? err.stack.split("\n") : [];
    const cleanStack = stackArray
      .map((line) => {
        const trimmedLine = line.trim();
        if (
          trimmedLine.includes("node:internal") ||
          !trimmedLine.includes("/")
        ) {
          return null;
        }

        const match = trimmedLine.match(
          /([^/]+\/[^/]+\.[a-z]+:\d+:\d+)/i,
        );
        return match ? match[0] : trimmedLine;
      })
      .filter(Boolean);

    return res.status(err.statusCode).json({
      message: err.message,
      error: {
        statusCode: err.statusCode,
        status: err.status,
        isOperational: err.isOperational,
      },
      stack: cleanStack,
    });
  }

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
