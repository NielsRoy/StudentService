import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entites/student.entity';
import { StudentHistoricResponseDto } from '../dto/responses/student-historic-response.dto';
import { GradeHistoryDto } from '../dto/responses/grade-history.dto';
import { GradeService } from './grade.service';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../config/services';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class StudentHistoricService {

    constructor(
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
        private readonly gradeService: GradeService,
        @Inject(NATS_SERVICE)
        private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Get complete student academic history
     * @param studentId - The student ID
     * @returns Student historic with all grades ordered by date
     */
    async getStudentHistoric(studentId: number): Promise<StudentHistoricResponseDto> {
        // Step 1: Get student data
        const student = await this.studentRepository.findOne({
            where: { id: studentId }
        });

        if (!student) {
            throw new NotFoundException(`Student with ID ${studentId} not found`);
        }

        // Step 2: Get career name from study plan (lightweight query)
        const careerName = await firstValueFrom(
            this.natsClient.send('get_career_name_by_study_plan_id', { studyPlanId: student.studyPlanId })
        );

        // Step 3: Get grade history
        const gradeHistory = await this.gradeService.getStudentGradeHistory(studentId);

        // Step 4: Build and return response
        return this.buildHistoricResponse(student, careerName, gradeHistory);
    }

    /**
     * Build the complete student historic response
     * @param student - The student entity
     * @param careerName - The career name from study plan
     * @param gradeHistory - Array of grade records
     * @returns Formatted student historic response
     */
    private buildHistoricResponse(
        student: Student,
        careerName: string,
        gradeHistory: any[]
    ): StudentHistoricResponseDto {
        return {
            studentId: student.id,
            studentCode: student.code,
            studentName: student.name,
            career: careerName,
            subjects: this.mapGradesToHistory(gradeHistory),
        };
    }

    /**
     * Map raw grade data to grade history DTOs
     * @param grades - Array of raw grade records
     * @returns Array of formatted grade history DTOs
     */
    private mapGradesToHistory(grades: any[]): GradeHistoryDto[] {
        return grades.map(grade => ({
            level: grade.level,
            subjectCode: grade.subjectCode,
            subjectName: grade.subjectName,
            grade: grade.grade,
            credits: grade.credits,
            period: grade.period,
            year: grade.year,
        }));
    }
}
