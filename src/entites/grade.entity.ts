import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Grade {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @CreateDateColumn()
  date: Date;

  @Column()
  studentId: number;

  @Column()
  enrollmentDetailId: number;
}