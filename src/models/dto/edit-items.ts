import {IsDefined, IsNotEmpty, MinLength} from "class-validator";

export class EditItems {

    @IsDefined()
    @IsNotEmpty()
    readonly productId: number;

    @IsDefined()
    @IsNotEmpty()
    readonly quantity: number;


}
