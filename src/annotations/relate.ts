import { BaseAnnotation } from './base'
import { AnnotationLocation, SqlmancerConfig } from '../types'
import {
  defaultFieldResolver,
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'

export type JoinOn = {
  from: string
  to: string
}

export type RelateAnnotiationArgs = {
  on: [JoinOn] | [JoinOn, JoinOn]
  through?: string
  pagination?: 'OFFSET'
}

export class RelateAnnotiation extends BaseAnnotation {
  argsType = new GraphQLNonNull(
    new GraphQLInputObjectType({
      name: 'args',
      fields: {
        on: {
          type: new GraphQLNonNull(
            new GraphQLList(
              new GraphQLNonNull(
                new GraphQLInputObjectType({
                  name: 'on',
                  fields: {
                    from: {
                      type: new GraphQLNonNull(GraphQLString),
                    },
                    to: {
                      type: new GraphQLNonNull(GraphQLString),
                    },
                  },
                })
              )
            )
          ),
        },
        through: { type: GraphQLString },
        pagination: { type: new GraphQLEnumType({ name: 'pagination', values: { OFFSET: {} } }) },
      },
    })
  )
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']

  applyToField(_config: SqlmancerConfig, field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field
    field.resolve = (source, args, ctx, info) => {
      const alias = info.path.key
      const fieldName = info.fieldName
      const modifiedSource = { ...source, [fieldName]: source[alias] }
      return resolve(modifiedSource, args, ctx, info)
    }
  }
}
