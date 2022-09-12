import { IsDefined, IsNotEmpty, IsPositive } from 'class-validator';

export class CheckoutItems {
  @IsDefined()
  @IsNotEmpty()
  @IsPositive()
  readonly productId: number;
}
