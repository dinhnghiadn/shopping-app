import { IsDefined, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class SignIn {
    @IsDefined()
    @IsNotEmpty()
    readonly username: string;

    @IsDefined()
    @IsNotEmpty()
    @MinLength(8)
    readonly password: string;
}
