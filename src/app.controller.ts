import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStudentRequestDto } from './dto/requests/create-student.request.dto';
import { LoginStudentRequestDto } from './dto/requests/login-student.request.dto';
import { AuthService } from './services/auth.service';
import { StudentService } from './services/student.service';
import { StudentHistoricService } from './services/student-historic.service';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly studentService: StudentService,
    private readonly studentHistoricService: StudentHistoricService,
  ) { }

  @MessagePattern('register_student')
  async registerStudent(@Payload() dto: CreateStudentRequestDto) {
    return await this.authService.registerStudent(dto);
  }

  @MessagePattern('login_student')
  async loginStudent(@Payload() dto: LoginStudentRequestDto) {
    return await this.authService.loginStudent(dto);
  }

  @MessagePattern('check_auth_status')
  check(@Payload('studentId', ParseIntPipe) studentId: number) {
    return this.authService.checkAuthStatus(studentId);
  }

  @MessagePattern('get_subjects_to_enroll')
  getSubjectsToEnroll(@Payload('studentId', ParseIntPipe) studentId: number) {
    return this.studentService.getSubjectsToEnroll(studentId);
  }

  @MessagePattern('get_student_historic')
  getStudentHistoric(@Payload('studentId', ParseIntPipe) studentId: number) {
    return this.studentHistoricService.getStudentHistoric(studentId);
  }
}
