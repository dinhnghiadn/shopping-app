import * as bcrypt from 'bcrypt';

const saltRounds = 8;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};
