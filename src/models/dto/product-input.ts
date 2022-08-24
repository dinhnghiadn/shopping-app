import {IsDefined, IsNotEmpty, IsPositive} from "class-validator";

export class ProductInput {

    @IsDefined()
    @IsNotEmpty()
    readonly name: string;

    @IsDefined()
    @IsNotEmpty()
    readonly description: string;

    @IsDefined()
    @IsNotEmpty()
    @IsPositive()
    readonly price: number;

    @IsDefined()
    @IsNotEmpty()
    @IsPositive()
    readonly quantity: number;

    @IsDefined()
    @IsNotEmpty()
    @IsPositive()
    readonly categoryId: number[]



}
