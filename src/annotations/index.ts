import { ColumnAnnotiation } from './column'
import { DependAnnotiation } from './depend'
import { HasDefaultAnnotiation } from './hasDefault'
import { IgnoreAnnotiation } from './ignore'
import { InputAnnotiation } from './input'
import { LimitAnnotiation } from './limit'
import { ManyAnnotiation } from './many'
import { ModelAnnotiation } from './model'
import { OffsetAnnotiation } from './offset'
import { OrderByAnnotiation } from './orderBy'
import { PaginateAnnotiation } from './paginate'
import { PrivateAnnotiation } from './private'
import { RelateAnnotiation } from './relate'
import { SqlamancerAnnotiation } from './sqlmancer'
import { ValueAnnotiation } from './value'
import { WhereAnnotiation } from './where'

export type AnnotationMap = {
  col?: ColumnAnnotiation
  depend?: DependAnnotiation
  hasDefault?: HasDefaultAnnotiation
  ignore?: IgnoreAnnotiation
  input?: InputAnnotiation
  limit?: LimitAnnotiation
  many?: ManyAnnotiation
  model?: ModelAnnotiation
  offset?: OffsetAnnotiation
  orderBy?: OrderByAnnotiation
  paginate?: PaginateAnnotiation
  private?: PrivateAnnotiation
  relate?: RelateAnnotiation
  sqlmancer?: SqlamancerAnnotiation
  value?: ValueAnnotiation
  where?: WhereAnnotiation
}

export const annotations = {
  col: ColumnAnnotiation,
  depend: DependAnnotiation,
  hasDefault: HasDefaultAnnotiation,
  ignore: IgnoreAnnotiation,
  input: InputAnnotiation,
  limit: LimitAnnotiation,
  many: ManyAnnotiation,
  model: ModelAnnotiation,
  offset: OffsetAnnotiation,
  orderBy: OrderByAnnotiation,
  paginate: PaginateAnnotiation,
  private: PrivateAnnotiation,
  relate: RelateAnnotiation,
  sqlmancer: SqlamancerAnnotiation,
  value: ValueAnnotiation,
  where: WhereAnnotiation,
}
