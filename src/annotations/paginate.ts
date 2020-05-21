import _ from 'lodash'
import { BaseAnnotation } from './base'
import { AnnotationLocation, Model, SqlmancerConfig } from '../types'
import {
  GraphQLField,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLOutputType,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
} from 'graphql'
import { makeNullable, unwrap } from '../utilities'

export class PaginateAnnotiation extends BaseAnnotation<undefined> {
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']

  applyToField(
    config: SqlmancerConfig,
    field: GraphQLField<any, any>,
    _object: GraphQLObjectType,
    schema: GraphQLSchema
  ) {
    field.type = new GraphQLNonNull(this.getPaginateType(field, schema, config))
  }

  private getPaginateType(
    field: GraphQLField<any, any>,
    schema: GraphQLSchema,
    config: SqlmancerConfig
  ): GraphQLOutputType {
    const unwrappedType = unwrap(field.type)
    const name = `${unwrappedType.name}Page`
    const existingType = schema.getType(name)
    const { models } = config
    const model = models[unwrappedType.name]

    if (existingType) {
      return existingType as GraphQLOutputType
    }

    if (!model) {
      throw new Error(
        `Attempted to generate page type for field "${field.name}" but type ${unwrappedType.name} is not a model.`
      )
    }

    const type = new GraphQLObjectType({
      name,
      fields: {
        results: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(unwrappedType))),
        },
        aggregate: {
          type: new GraphQLNonNull(this.getAggregateType(`${unwrappedType.name}Aggregate`, model, schema)),
        },
        hasMore: {
          type: new GraphQLNonNull(GraphQLBoolean),
        },
        totalCount: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
    })

    schema.getTypeMap()[type.name] = type

    return type
  }

  private getAggregateType(name: string, model: Model, schema: GraphQLSchema): GraphQLOutputType {
    const existingType = schema.getType(name)

    if (existingType) {
      return existingType as GraphQLOutputType
    }

    const fieldsByAggregateFunction = Object.keys(model.fields).reduce(
      (acc, fieldName) => {
        const { mappedType, type, isPrivate } = model.fields[fieldName]
        if (!isPrivate) {
          if (mappedType === 'number') {
            acc.avg.push({ fieldName, type: new GraphQLNonNull(GraphQLFloat) })
            acc.sum.push({ fieldName, type: new GraphQLNonNull(GraphQLFloat) })
          }
          if (mappedType === 'number' || mappedType === 'string' || mappedType === 'ID' || mappedType === 'Date') {
            const nullableType = makeNullable(type)
            acc.min.push({ fieldName, type: nullableType })
            acc.max.push({ fieldName, type: nullableType })
          }
        }

        return acc
      },
      { avg: [], sum: [], min: [], max: [] } as Record<string, { fieldName: string; type: GraphQLOutputType }[]>
    )

    const fields = {
      count: {
        type: new GraphQLNonNull(GraphQLInt),
      },
    } as GraphQLFieldConfigMap<any, any>

    Object.keys(fieldsByAggregateFunction).forEach((fn) => {
      if (fieldsByAggregateFunction[fn].length) {
        const type = new GraphQLObjectType({
          name: `${name}${_.upperFirst(fn)}`,
          fields: fieldsByAggregateFunction[fn].reduce((acc, field) => {
            acc[field.fieldName] = {
              type: field.type,
            }
            return acc
          }, {} as GraphQLFieldConfigMap<any, any>),
        })
        schema.getTypeMap()[type.name] = type

        fields[fn] = { type }
      }
    })

    const type = new GraphQLObjectType({ name, fields })

    schema.getTypeMap()[type.name] = type

    return type
  }
}
