import { ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AcademicAdvance } from './entites/academic-advance.entity';
import { ClientProxy } from '@nestjs/microservices';
import { PlanSubjectResponse } from './interfaces/plan-subject-response.interface';
import { SubjectGroupResponse } from './interfaces/subject-group-response.interface';
import { SubjectForEnrollDto } from './dto/responses/subject-for-enroll.response.dto';
import { CreateStudentRequestDto } from './dto/requests/create-student.request.dto';
import { DataSource, Repository } from 'typeorm';
import { Student } from './entites/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PrerequisiteCountView } from './entites/prerequisite-count-view.entity';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE, SCHEDULE_SERVICE, STUDY_PLAN_SERVICE } from './config/services';

@Injectable()
export class AppService {

  constructor(
    // @Inject(STUDY_PLAN_SERVICE) private studyPlanClient: ClientProxy,

    // @Inject(SCHEDULE_SERVICE) private scheduleClient: ClientProxy,

    @Inject(NATS_SERVICE) private natsClient: ClientProxy,

    private readonly dataSource: DataSource,

    @InjectRepository(AcademicAdvance)
    private readonly academicAdvanceRepository: Repository<AcademicAdvance>,
  ) {}

  async registerStudent(createStudentRequestDto: CreateStudentRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newStudent = queryRunner.manager.create(Student, createStudentRequestDto);
      const savedStudent = await queryRunner.manager.save(newStudent);
      const studentId = savedStudent.id;
      const planId = savedStudent.studyPlanId;
      const subjectsInPlan = await queryRunner.manager.find(PrerequisiteCountView, {
        where: { studyPlanId: planId }
      });
      if (!subjectsInPlan || subjectsInPlan.length === 0) {
        console.warn(`No se encontraron materias en la vista para el plan: ${planId}`);
        await queryRunner.commitTransaction();
        return savedStudent;
      }
      const newAdvances = subjectsInPlan.map(subject => {
        return {
          studentId: studentId,
          planSubjectId: subject.planSubjectId,
          pendingPrerequisites: subject.prerequisiteCount
        };
      });
      await queryRunner.manager.insert(AcademicAdvance, newAdvances);
      await queryRunner.commitTransaction();
      return savedStudent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);

      // Manejo de error de duplicados (ej. código o CI)
      if (error.code === '23505') { // Código de error de violación de unicidad en PostgreSQL
        throw new ConflictException(`Error de duplicado: ${error.detail}`);
      }
      
      // Otro error
      throw new InternalServerErrorException(`Error al registrar estudiante: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  //TODO: Considerar asynchronous endpoint (kafka)
  async getSubjectsForEnroll(studentId: number): Promise<SubjectForEnrollDto[]> {
    const list = await this.academicAdvanceRepository.find({
      select: { planSubjectId: true },
      where: { studentId, pendingPrerequisites: 0 }
    });
    if (list.length === 0) {
      return []; // No hay materias para inscribir
    }
    const planSubjectIds = list.map(e => e.planSubjectId);
    const [planSubjectsResult, subjectGroupsResult] = await Promise.all([
      firstValueFrom(
        this.natsClient.send<PlanSubjectResponse[]>(
          'get_plan_subjects_by_id_list', 
          planSubjectIds
        )
      ),
      firstValueFrom(
        this.natsClient.send<SubjectGroupResponse[]>(
          'get_subject_groups_by_plan_subject_id_list', 
          planSubjectIds
        )
      )
    ]);
    const subjectGroupsMap = new Map(subjectGroupsResult.map(item => [item.planSubjectId, item.groups]));
    const subjectsForEnroll: SubjectForEnrollDto[] = planSubjectsResult.map(planSubject => ({
      ...planSubject,
      groups: subjectGroupsMap.get(planSubject.planSubjectId) || []
    }));
    return subjectsForEnroll;
  }

  setSubjectGrade() {

  }
}
