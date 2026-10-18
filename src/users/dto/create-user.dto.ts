import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @Length(5, 254)
  email!: string;

  @IsString()
  @Length(2, 100)
  name!: string;

  // ^ y $ delimitan el valor; \d{5,20} exige entre 5 y 20 dígitos.
  @IsOptional()
  @IsString()
  @Matches(/^\d{5,20}$/)
  document?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(130)
  age?: number;

  // +? permite el prefijo internacional; [0-9]{7,15} exige entre 7 y 15 dígitos.
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/)
  phone?: string;
}
