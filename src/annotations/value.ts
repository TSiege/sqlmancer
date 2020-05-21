import { BaseAnnotation } from './base'
import { AnnotationLocation, SqlmancerConfig } from '../types'
import { GraphQLNonNull, GraphQLString, GraphQLEnumValue } from 'graphql'

export class ValueAnnotiation extends BaseAnnotation<string> {
  argsType = new GraphQLNonNull(GraphQLString)
  locations: AnnotationLocation[] = ['ENUM_VALUE']

  applyToEnumValue(_config: SqlmancerConfig, enumValue: GraphQLEnumValue) {
    enumValue.value = this.args
  }
}
