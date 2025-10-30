export class SubjectGroupResponse {
  planSubjectId: number;
  groups: {
    subjectGroupId: number;
    group: string;
    teacher: string;
    schedules: {
      day: string;
      beginTime: string;
      endTime: string;
      classroom: number;
      building: number;
    } []
  } []
}