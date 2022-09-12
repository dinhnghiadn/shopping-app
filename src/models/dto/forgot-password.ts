import { IsDefined, IsNotEmpty } from 'class-validator';

export class ForgotPassword {
  @IsDefined()
  @IsNotEmpty()
  readonly email: string;
}
