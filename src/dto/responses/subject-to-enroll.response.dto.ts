export class ScheduleDto {
  day: string;
  beginTime: string;
  endTime: string;
  classroom: number;
  building: number;
}

export class GroupDto {
  subjectGroupId: number;
  spots: number;
  group: string;
  teacher: string;
  schedules: ScheduleDto[];
}

export class SubjectToEnrollDto {
  planSubjectId: number;
  code: string;
  name: string;
  credits: number;
  level: number;
  groups: GroupDto[];
}