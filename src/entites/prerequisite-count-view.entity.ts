import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: 'prerequisite_count_view',
  expression: `
    SELECT 
      ps.id AS "planSubjectId", 
      count(p."planSubjectId") AS "prerequisiteCount", 
      ps."studyPlanId" 
    FROM plan_subject ps
    LEFT JOIN prerequisite p ON ps.id = p."planSubjectId"
    GROUP BY ps.id, ps."studyPlanId"
  `
})
export class PrerequisiteCountView {

  @ViewColumn()
  planSubjectId: number;

  @ViewColumn()
  prerequisiteCount: number;

  @ViewColumn()
  studyPlanId: number;
}