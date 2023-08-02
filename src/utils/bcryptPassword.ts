import bcrypt from 'bcrypt';

// Function to hash the password using bcrypt
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10; // Increase this value for stronger hashing (but it will be slower)
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// Function to compare the provided password with the hashed password in the database
const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
  return isPasswordMatch;
};

export { hashPassword, comparePassword };
