import { BaseAnnotation } from './base'
import { AnnotationLocation } from '../types'
import { GraphQLBoolean, GraphQLNonNull, GraphQLInputObjectType, GraphQLString, GraphQLList } from 'graphql'

export type ModelAnnotiationArgs = {
  table?: string
  cte?: string
  pk: string
  readOnly?: boolean
  include?: string[]
}

export class ModelAnnotiation extends BaseAnnotation<ModelAnnotiationArgs> {
  argsType = new GraphQLNonNull(
    new GraphQLInputObjectType({
      name: 'args',
      fields: {
        table: {
          type: GraphQLString,
        },
        cte: {
          type: GraphQLString,
        },
        pk: {
          type: new GraphQLNonNull(GraphQLString),
        },
        readOnly: {
          type: GraphQLBoolean,
        },
        include: {
          type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
        },
      },
    })
  )
  locations: AnnotationLocation[] = ['OBJECT', 'UNION', 'INTERFACE']
}
