import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entites/grade.entity';

@Injectable()
export class GradeService {

    constructor(
        @InjectRepository(Grade)
        private readonly gradeRepository: Repository<Grade>,
    ) { }

    /**
     * Get plan subject IDs that the student has already approved (grade > 50)
     * @param studentId - The student ID
     * @returns Array of plan subject IDs that the student has passed
     */
    async getApprovedPlanSubjectIds(studentId: number): Promise<number[]> {
        // We need to join with enrollment_detail and subject_group to get planSubjectId
        const results = await this.gradeRepository.createQueryBuilder("grade")
            .innerJoin("enrollment_detail", "ed", `ed.id = grade."enrollmentDetailId"`)
            .innerJoin("subject_group", "sg", `sg.id = ed."subjectGroupId"`)
            .select(`DISTINCT sg."planSubjectId" AS "planSubjectId"`)
            .where(`grade."studentId" = :studentId`, { studentId })
            .andWhere("grade.number > 50")
            .getRawMany<{ planSubjectId: number }>();

        return results.map(r => r.planSubjectId);
    }

    /**
     * Get prerequisite plan subject IDs that the student has fulfilled (grade > 50)
     * This is the same as approved subjects, just semantically different usage
     * @param studentId - The student ID
     * @returns Array of prerequisite plan subject IDs that the student has passed
     */
    async getPassedPrerequisiteIds(studentId: number): Promise<number[]> {
        return this.getApprovedPlanSubjectIds(studentId);
    }
}
