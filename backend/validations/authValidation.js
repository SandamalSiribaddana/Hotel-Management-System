const validateRegister = (data) => {
  const { name, email, password } = data;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Valid email is required");
  }

  if (!password || password.length < 6) {
    errors.push("Password is required and must be at least 6 characters");
  }

  return errors;
};

const validateLogin = (data) => {
  const { email, password } = data;
  const errors = [];

  if (!email) {
    errors.push("Email is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin,
};