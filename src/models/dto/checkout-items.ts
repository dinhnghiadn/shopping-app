import {IsDefined, IsNotEmpty} from "class-validator";

export class CheckoutItems {

    @IsDefined()
    @IsNotEmpty()
    readonly productId: number;

}
