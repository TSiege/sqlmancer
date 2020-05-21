import { BaseAnnotation } from './base'
import { AnnotationLocation, SqlmancerConfig } from '../types'
import { GraphQLField, GraphQLInt } from 'graphql'

export class OffsetAnnotiation extends BaseAnnotation<undefined> {
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']

  applyToField(_config: SqlmancerConfig, field: GraphQLField<any, any>): void {
    field.args = [
      ...field.args,
      {
        name: 'offset',
        type: GraphQLInt,
        description: '',
        defaultValue: undefined,
        extensions: undefined,
        astNode: undefined,
      },
    ]
  }
}
