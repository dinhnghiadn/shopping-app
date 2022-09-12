import { Gender } from '../../utils/common/enum';
import { IsDateString, IsDefined, IsEnum, IsNotEmpty, IsString } from 'class-validator';
export class EditProfile {
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  phone: string;

  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  birthday: string;

  @IsDefined()
  @IsEnum(Gender)
  gender: Gender;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  address: string;
}
