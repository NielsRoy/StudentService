import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
//@Unique
export class AcademicAdvance {

  @PrimaryColumn()
  studentId: number;

  @PrimaryColumn()
  planSubjectId: number;

  @Column()
  pendingPrerequisites: number;
}