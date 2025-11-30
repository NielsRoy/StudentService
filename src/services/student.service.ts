import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SubjectToEnrollDto, GroupDto } from "../dto/responses/subject-to-enroll.response.dto";
import { Repository } from "typeorm";
import { Student } from "src/entites/student.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ClientProxy } from "@nestjs/microservices";
import { NATS_SERVICE } from "../config/services";
import { firstValueFrom } from "rxjs";
import { GradeService } from "./grade.service";

@Injectable()
export class StudentService {

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @Inject(NATS_SERVICE)
    private readonly natsClient: ClientProxy,
    private readonly gradeService: GradeService,
  ) { }

  async check(studentId: number) {
    return { message: `StudentService obtuvo: studentId = ${studentId}` }
  }

  /**
   * Get subjects that a student can enroll in based on their study plan,
   * prerequisites, and academic history
   * @param studentId - The student ID
   * @returns Array of subjects available for enrollment with groups and schedules
   */
  async getSubjectsToEnroll(studentId: number): Promise<SubjectToEnrollDto[]> {
    // Step 1: Get student and verify existence
    const student = await this.studentRepository.findOne({
      where: { id: studentId }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Step 2: Get all plan subjects for the student's study plan via NATS
    const allPlanSubjects = await firstValueFrom(
      this.natsClient.send('get_plan_subjects_by_study_plan_id', { studyPlanId: student.studyPlanId })
    );

    if (!allPlanSubjects || allPlanSubjects.length === 0) {
      return [];
    }

    // Step 3: Get plan subject IDs that the student has already approved
    const approvedPlanSubjectIds = await this.gradeService.getApprovedPlanSubjectIds(studentId);
    const approvedSet = new Set(approvedPlanSubjectIds);

    // Step 4: Filter out already approved subjects
    const unapprovedPlanSubjects = allPlanSubjects.filter(
      ps => !approvedSet.has(ps.planSubjectId)
    );

    if (unapprovedPlanSubjects.length === 0) {
      return [];
    }

    const unapprovedPlanSubjectIds = unapprovedPlanSubjects.map(ps => ps.planSubjectId);

    // Step 5: Get prerequisites for the unapproved subjects via NATS
    const prerequisites = await firstValueFrom(
      this.natsClient.send('get_prerequisites_by_plan_subject_ids', unapprovedPlanSubjectIds)
    );

    // Step 6: Get student's passed prerequisites
    const passedPrerequisiteIds = await this.gradeService.getPassedPrerequisiteIds(studentId);
    const passedSet = new Set(passedPrerequisiteIds);

    // Step 7: Build a map of planSubjectId -> array of prerequisite IDs
    const prerequisiteMap = new Map<number, number[]>();
    for (const prereq of prerequisites) {
      if (!prerequisiteMap.has(prereq.planSubjectId)) {
        prerequisiteMap.set(prereq.planSubjectId, []);
      }
      prerequisiteMap.get(prereq.planSubjectId)!.push(prereq.prerequisitePlanSubjectId);
    }

    // Step 8: Filter subjects where all prerequisites are fulfilled
    const eligiblePlanSubjectIds = unapprovedPlanSubjects
      .filter(ps => {
        const requiredPrereqs = prerequisiteMap.get(ps.planSubjectId) || [];
        // Subject is eligible if it has no prerequisites OR all prerequisites are passed
        return requiredPrereqs.length === 0 || requiredPrereqs.every(prereqId => passedSet.has(prereqId));
      })
      .map(ps => ps.planSubjectId);

    if (eligiblePlanSubjectIds.length === 0) {
      return [];
    }

    // Step 9: Get subject groups with schedules via NATS
    const subjectGroupsData = await firstValueFrom(
      this.natsClient.send('get_subject_groups_by_plan_subject_ids', eligiblePlanSubjectIds)
    );

    // Step 10: Build a map of planSubjectId -> groups
    const groupsMap = new Map<number, GroupDto[]>();
    for (const sgData of subjectGroupsData) {
      groupsMap.set(sgData.planSubjectId, sgData.groups);
    }

    // Step 11: Combine all data into final response
    const result: SubjectToEnrollDto[] = unapprovedPlanSubjects
      .filter(ps => eligiblePlanSubjectIds.includes(ps.planSubjectId))
      .map(ps => ({
        planSubjectId: ps.planSubjectId,
        code: ps.code,
        name: ps.name,
        credits: ps.credits,
        level: ps.level,
        groups: groupsMap.get(ps.planSubjectId) || []
      }));

    return result;
  }
}