import { GradeHistoryDto } from './grade-history.dto';

export class StudentHistoricResponseDto {
    studentId: number;
    studentCode: number;
    studentName: string;
    career: string;
    subjects: GradeHistoryDto[];
}
