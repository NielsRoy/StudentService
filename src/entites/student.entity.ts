import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Student {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  code: number;

  @Column({ select: false })
  password: string;

  @Column({
    unique: true,
  })
  ci: number;

  @Column()
  name: string;

  @Column({
    unique: true,
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  cellphone: number;

  @Column()
  studyPlanId: number;
}
