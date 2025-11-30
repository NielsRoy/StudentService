//import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateStudentRequestDto {

  // @IsNumber()
  // @Min(0)
  code: number;

  // @IsString()
  // @MinLength(6)
  password: string;

  // @IsNumber()
  // @Min(0)
  ci: number;

  // @IsString()
  // @IsNotEmpty()
  name: string;

  // @IsEmail()
  // @IsOptional()
  email?: string;

  // @IsNumber()
  // @Min(0)
  // @IsOptional()
  cellphone?: number;

  // @IsNumber()
  // @IsPositive()
  studyPlanId: number;
}
