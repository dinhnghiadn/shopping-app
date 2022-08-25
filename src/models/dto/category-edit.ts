import { IsOptional, IsString} from "class-validator";


export class CategoryEdit {

    @IsOptional()
    @IsString()
    readonly name?: string;

    @IsOptional()
    @IsString()
    readonly description?: string;

}
