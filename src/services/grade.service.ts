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

    /**
     * Get complete grade history for a student with all related information
     * @param studentId - The student ID
     * @returns Array of grade records with subject, period, and term information, ordered by date (oldest first)
     */
    async getStudentGradeHistory(studentId: number): Promise<any[]> {
        const results = await this.gradeRepository.createQueryBuilder("grade")
            .innerJoin("enrollment_detail", "ed", `ed.id = grade."enrollmentDetailId"`)
            .innerJoin("enrollment", "e", `e.id = ed."enrollmentId"`)
            .innerJoin("period", "p", `p.id = e."periodId"`)
            .innerJoin("term", "t", `t.id = p."termId"`)
            .innerJoin("subject_group", "sg", `sg.id = ed."subjectGroupId"`)
            .innerJoin("plan_subject", "ps", `ps.id = sg."planSubjectId"`)
            .innerJoin("subject", "s", `s.id = ps."subjectId"`)
            .select([
                `ps."levelNumber" AS level`,
                `s.code AS "subjectCode"`,
                `s.name AS "subjectName"`,
                `grade.number AS grade`,
                `ps.credits AS credits`,
                `p.number AS period`,
                `t.year AS year`
            ])
            .where(`grade."studentId" = :studentId`, { studentId })
            .orderBy("grade.date", "ASC")
            .getRawMany();

        return results;
    }
}
