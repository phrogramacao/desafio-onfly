import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsNotFutureDate } from '../validators/not-future-date.validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  description: string;

  @IsDateString()
  @IsNotFutureDate()
  date: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;
}
