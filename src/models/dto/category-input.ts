import {IsDefined, IsNotEmpty} from "class-validator";

export class CategoryInput {

    @IsDefined()
    @IsNotEmpty()
    readonly name: string;

    @IsDefined()
    @IsNotEmpty()
    readonly description: string;

}
