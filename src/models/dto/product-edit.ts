import { IsOptional, IsPositive, IsString } from 'class-validator';

export class ProductEdit {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsPositive()
  readonly price?: number;

  @IsOptional()
  @IsPositive()
  readonly quantity?: number;

  @IsOptional()
  @IsPositive()
  readonly thumbnailId?: number;

  @IsOptional()
  @IsPositive({ each: true })
  readonly categoryId?: number[];
}
