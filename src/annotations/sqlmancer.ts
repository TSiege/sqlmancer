import { BaseAnnotation } from './base'
import { AnnotationLocation } from '../types'
import { GraphQLNonNull, GraphQLInputObjectType, GraphQLEnumType, GraphQLList, GraphQLString } from 'graphql'

export type SqlamancerAnnotiationArgs = {
  dialect: 'POSTGRES' | 'MYSQL' | 'MARIADB' | 'SQLITE'
  transformFieldNames?: 'CAMEL_CASE' | 'PASCAL_CASE' | 'SNAKE_CASE'
  customScalars?: {
    string?: string[]
    number?: string[]
    boolean?: string[]
    JSON?: string[]
    Date?: string[]
  }
}

export class SqlamancerAnnotiation extends BaseAnnotation<SqlamancerAnnotiationArgs> {
  argsType = new GraphQLNonNull(
    new GraphQLInputObjectType({
      name: 'args',
      fields: {
        dialect: {
          type: new GraphQLNonNull(
            new GraphQLEnumType({ name: 'dialect', values: { POSTGRES: {}, MYSQL: {}, MARIADB: {}, SQLITE: {} } })
          ),
        },
        transformFieldNames: {
          type: new GraphQLEnumType({
            name: 'transformFieldNames',
            values: { CAMEL_CASE: {}, PASCAL_CASE: {}, SNAKE_CASE: {} },
          }),
        },
        customScalars: {
          type: new GraphQLInputObjectType({
            name: 'customScalars',
            fields: {
              string: {
                type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
              },
              number: {
                type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
              },
              boolean: {
                type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
              },
              JSON: {
                type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
              },
              Date: {
                type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
              },
            },
          }),
        },
      },
    })
  )
  locations: AnnotationLocation[] = ['OBJECT']
}
