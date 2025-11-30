import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateStudentRequestDto } from "../dto/requests/create-student.request.dto";
import { Repository } from "typeorm";
import { Student } from "../entites/student.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginStudentRequestDto } from "../dto/requests/login-student.request.dto";
import { HASH_SERVICE } from "../common/adapters/injection-tokens";
import type { HashService } from "../common/adapters/hash/hash.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { JwtService } from "@nestjs/jwt";
import { AuthResponseDto } from "../dto/responses/auth.response.dto";
import { ErrorHandlerUtil } from "../common/utils/error-handler.util";

@Injectable()
export class AuthService {

  constructor(
    @Inject(HASH_SERVICE)
    private readonly hashService: HashService,

    private readonly jwtService: JwtService,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async registerStudent(dto: CreateStudentRequestDto): Promise<AuthResponseDto> {
    try {
      const { password, ...userData } = dto;
      const student = this.studentRepository.create({
        ...userData,
        password: this.hashService.hash(password),
      });

      const { password: p, id, ...rest } = await this.studentRepository.save(student);

      return {
        studentId: id, ...rest,
        token: this.getJwtToken({ studentId: student.id }),
      };
    } catch (error) {
      ErrorHandlerUtil.handle(error);
    }
  }

  async loginStudent(dto: LoginStudentRequestDto): Promise<AuthResponseDto> {
    const { password, code } = dto;

    const student = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.code = :code', { code })
      .addSelect('student.password') // Incluye el campo password (a pesar del select: false)
      .getOne();

    if (!student)
      throw new UnauthorizedException('Credentials are not valid');

    if (!this.hashService.compare(password, student.password))
      throw new UnauthorizedException('Credentials are not valid');

    const { password: p, id, ...rest } = student;

    return {
      studentId: id, ...rest,
      token: this.getJwtToken({ studentId: student.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

}