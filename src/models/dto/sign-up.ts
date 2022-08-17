import {
    IsDefined,
    IsEmail,
    IsNotEmpty,
    Matches,
    MinLength
} from "class-validator"

export class SignUp {

    @IsDefined()
    @IsNotEmpty()
    readonly username: string

    @IsDefined()
    @IsEmail()
    readonly email: string

    @IsDefined()
    @IsNotEmpty()
    @MinLength(8, {message: 'Password too short, min length is $constraint1!'})
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password too weak!',
    })
    readonly password: string

}
