import { Controller, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStudentRequestDto } from './dto/requests/create-student.request.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('register_student')
  async registerStudent(@Payload() createStudentRequestDto: CreateStudentRequestDto) {
    //return "Student MS Replying";
    return await this.appService.registerStudent(createStudentRequestDto);
  }

  @MessagePattern('get_subjects_for_enroll')
  getSubjectsForEnroll(@Payload('studentId', ParseIntPipe) studentId: number) {
    return this.appService.getSubjectsForEnroll(studentId);
  }
}
