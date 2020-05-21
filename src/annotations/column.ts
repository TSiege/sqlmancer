import { BaseAnnotation } from './base'
import { AnnotationLocation } from '../types'
import { GraphQLNonNull, GraphQLString } from 'graphql'

export class ColumnAnnotiation extends BaseAnnotation<string> {
  argsType = new GraphQLNonNull(GraphQLString)
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']
}
