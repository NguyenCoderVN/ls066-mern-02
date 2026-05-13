export const validateSignup = (data) => {
  const { username, password, email } = data;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!username || !password || !email) {
    throw new AppError(
      "All username, password, and email are required",
      400,
    );
  }

  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }
};
