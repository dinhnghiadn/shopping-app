import * as bcrypt from 'bcrypt'

const saltRounds = 8

export const hashPassword = (password: string) => {
    return bcrypt.hash(password, saltRounds)
}
