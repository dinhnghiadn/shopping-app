import {Column} from "typeorm";
import { gender } from "../../utils/common/enum"
import {
    IsDate,
    IsDateString,
    IsDefined,
    IsEmpty,
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
    @IsEnum(gender)
    gender: gender

    @IsDefined()
    @IsNotEmpty()
    address: string
}
