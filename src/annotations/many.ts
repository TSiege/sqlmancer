import { BaseAnnotation } from './base'
import { AnnotationLocation, SqlmancerConfig } from '../types'
import { GraphQLInputObjectType, GraphQLString, GraphQLField, GraphQLObjectType, GraphQLSchema } from 'graphql'
import { LimitAnnotiation } from './limit'
import { OffsetAnnotiation } from './offset'
import { WhereAnnotiation } from './where'
import { OrderByAnnotiation } from './orderBy'

export type ManyAnnotiationArgs = {
  model?: string
}

export class ManyAnnotiation extends BaseAnnotation<ManyAnnotiationArgs | undefined> {
  argsType = new GraphQLInputObjectType({ name: 'args', fields: { model: { type: GraphQLString } } })
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']

  applyToField(
    config: SqlmancerConfig,
    field: GraphQLField<any, any>,
    object: GraphQLObjectType,
    schema: GraphQLSchema
  ) {
    new LimitAnnotiation(undefined).applyToField(config, field)
    new OffsetAnnotiation(undefined).applyToField(config, field)
    new WhereAnnotiation(this.args).applyToField(config, field, object, schema)
    new OrderByAnnotiation(this.args).applyToField(config, field, object, schema)
  }
}
