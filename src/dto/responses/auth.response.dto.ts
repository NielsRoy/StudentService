export class AuthResponseDto {
  studentId: number;
  code: number;
  ci: number;
  name: string;
  email?: string;
  cellphone?: number;
  studyPlanId: number;
  token: string;
}