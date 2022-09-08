import { IsDefined, IsNotEmpty, IsPositive } from 'class-validator'

export class EditItems {
    @IsDefined()
    @IsNotEmpty()
    @IsPositive()
    readonly productId: number

    @IsDefined()
    @IsNotEmpty()
    @IsPositive()
    readonly quantity: number
}
