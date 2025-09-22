const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
};

const comparePassword = async (plainTextPassword, hashedPassword) => {
  const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);

  return isMatch;
};

module.exports = {
  hashPassword,
  comparePassword,
};