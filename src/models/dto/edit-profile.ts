
import {Gender} from "../../utils/common/enum"
import {
    IsDateString,
    IsDefined,
    IsEnum,
    IsNotEmpty
} from "class-validator";
export class EditProfile {
    @IsNotEmpty()
    @IsDefined()
    fullName: string

    @IsNotEmpty()
    @IsDefined()
    phone: string

    @IsDefined()
    @IsNotEmpty()
    @IsDateString()
    birthday: string

    @IsDefined()
    @IsEnum(Gender)
    gender: Gender

    @IsDefined()
    @IsNotEmpty()
    address: string
}
