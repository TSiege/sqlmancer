import { BaseAnnotation } from './base'
import { AnnotationLocation } from '../types'
import { GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql'

export class DependAnnotiation extends BaseAnnotation<string[]> {
  argsType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']
}
