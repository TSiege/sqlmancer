import _ from 'lodash'
import { BaseAnnotation } from './base'
import { AnnotationLocation, Field, Association, SqlmancerConfig } from '../types'
import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLInputFieldMap,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputType,
  GraphQLFloat,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLInputFieldConfigMap,
  GraphQLField,
  GraphQLObjectType,
} from 'graphql'
import { unwrap } from '../utilities'

export type WhereAnnotiationArgs = {
  model?: string
}

export class WhereAnnotiation extends BaseAnnotation<WhereAnnotiationArgs | undefined> {
  argsType = new GraphQLInputObjectType({ name: 'args', fields: { model: { type: GraphQLString } } })
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']

  applyToField(
    config: SqlmancerConfig,
    field: GraphQLField<any, any>,
    _object: GraphQLObjectType,
    schema: GraphQLSchema
  ) {
    const modelName = this.args?.model || unwrap(field.type).name
    const type = this.getInputType(modelName, false, schema, config)!

    field.args = [
      ...field.args,
      {
        name: 'where',
        type,
        description: '',
        defaultValue: undefined,
        extensions: undefined,
        astNode: undefined,
      },
    ]
  }

  private getInputType(
    modelName: string,
    withAggregateFields: boolean,
    schema: GraphQLSchema,
    config: SqlmancerConfig
  ): GraphQLInputObjectType | undefined {
    const typeName = this.getInputName(modelName, withAggregateFields)
    let type = schema.getType(typeName) as GraphQLInputObjectType | undefined

    if (!type) {
      type = this.createInputType(modelName, withAggregateFields, schema, config)
    }

    return type
  }

  private getInputName(modelName: string, withAggregateFields: boolean): string {
    return `${modelName}Where${withAggregateFields ? 'WithAggregateFields' : ''}`
  }

  private createInputType(
    modelName: string,
    withAggregateFields: boolean,
    schema: GraphQLSchema,
    config: SqlmancerConfig
  ): GraphQLInputObjectType | undefined {
    const { models } = config
    const model = models[modelName]

    if (!model) {
      throw new Error(`"${modelName}" isn't a valid model. Did you include the @model directive?`)
    }

    const typeName = this.getInputName(modelName, withAggregateFields)
    const inputType: GraphQLInputObjectType = new GraphQLInputObjectType({
      name: typeName,
      fields: this.getColumnFields(model.fields, schema, config),
    })
    schema.getTypeMap()[typeName] = inputType
    Object.assign(inputType.getFields(), {
      ...this.getLogicalOperatorFields(
        withAggregateFields ? this.getInputType(modelName, false, schema, config)! : inputType
      ),
      ...this.getAssociationFields(model.associations, schema, config),
      ...(withAggregateFields ? this.getAggregateFields(modelName, model.fields, schema, config) : {}),
    })

    return inputType
  }

  private getColumnFields(
    fields: Record<string, Field>,
    schema: GraphQLSchema,
    config: SqlmancerConfig
  ): GraphQLInputFieldConfigMap {
    return Object.keys(fields).reduce((acc, fieldName) => {
      const field = fields[fieldName]
      const operatorType = this.getOperatorType(field, schema, config)
      if (!field.isPrivate && operatorType) {
        acc[fieldName] = { type: operatorType }
        schema.getTypeMap()[operatorType.name] = operatorType
      }
      return acc
    }, {} as GraphQLInputFieldConfigMap)
  }

  private getOperatorType(
    { mappedType, type }: Pick<Field, 'mappedType' | 'type'>,
    schema: GraphQLSchema,
    config: SqlmancerConfig
  ): GraphQLInputObjectType | undefined {
    const { dialect } = config
    const unwrappedType = unwrap(type)
    const isList = mappedType.substring(mappedType.length - 2) === '[]'
    const typeName = `${unwrappedType.name}${isList ? 'List' : ''}Operators`

    let operatorType = schema.getType(typeName) as GraphQLInputObjectType

    if (!operatorType) {
      let fields = null

      if (isList) {
        fields = getListOperatorsTypeFields(unwrappedType as GraphQLInputType)
      } else {
        if (unwrappedType instanceof GraphQLEnumType || mappedType === 'boolean') {
          fields = {
            ...getEqualOperatorsTypeFields(unwrappedType as GraphQLInputType),
            ...getInOperatorsTypeFields(unwrappedType as GraphQLInputType),
          }
        } else if (mappedType === 'ID' || mappedType === 'number' || mappedType === 'Date') {
          fields = {
            ...getEqualOperatorsTypeFields(unwrappedType as GraphQLInputType),
            ...getInOperatorsTypeFields(unwrappedType as GraphQLInputType),
            ...getNumericOperatorsTypeFields(unwrappedType as GraphQLInputType),
          }
        } else if (mappedType === 'string') {
          fields = {
            ...getEqualOperatorsTypeFields(GraphQLString),
            ...getNumericOperatorsTypeFields(GraphQLString),
            ...getInOperatorsTypeFields(GraphQLString),
            ...getTextOperatorsTypeFields(GraphQLString),
            ...(dialect === 'postgres' ? getCaseInsensitiveTextOperatorsTypeFields(GraphQLString) : {}),
          }
        } else if (dialect !== 'sqlite' && mappedType === 'JSON') {
          fields = {
            ...getEqualOperatorsTypeFields(GraphQLString),
            contains: {
              type: GraphQLString,
            },
            containedBy: {
              type: GraphQLString,
            },
            hasKey: {
              type: GraphQLString,
            },
            hasAnyKeys: {
              type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            },
            hasAllKeys: {
              type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            },
          }
        }
      }

      if (fields) {
        operatorType = new GraphQLInputObjectType({
          name: typeName,
          fields,
        })
        schema.getTypeMap()[typeName] = operatorType
      }
    }

    return operatorType
  }

  private getAssociationFields(
    associations: Record<string, Association>,
    schema: GraphQLSchema,
    config: SqlmancerConfig
  ): GraphQLInputFieldMap {
    return Object.keys(associations).reduce((acc, associationName) => {
      const { modelName, isMany, isPrivate } = associations[associationName]

      if (!isPrivate) {
        acc[associationName] = {
          name: associationName,
          type: this.getInputType(modelName, isMany, schema, config)!,
          extensions: undefined,
        }
      }

      return acc
    }, {} as GraphQLInputFieldMap)
  }

  private getLogicalOperatorFields(inputType: GraphQLInputObjectType): GraphQLInputFieldMap {
    return {
      and: {
        name: 'and',
        type: new GraphQLList(new GraphQLNonNull(inputType)),
        description: undefined,
        defaultValue: undefined,
        extensions: undefined,
        astNode: undefined,
      },
      or: {
        name: 'or',
        type: new GraphQLList(new GraphQLNonNull(inputType)),
        description: undefined,
        defaultValue: undefined,
        extensions: undefined,
        astNode: undefined,
      },
      not: {
        name: 'not',
        type: inputType,
        description: undefined,
        defaultValue: undefined,
        extensions: undefined,
        astNode: undefined,
      },
    }
  }

  private getAggregateFields(
    modelName: string,
    fields: Record<string, Field>,
    schema: GraphQLSchema,
    config: SqlmancerConfig
  ): GraphQLInputFieldMap {
    const fieldsByAggregateFunction = Object.keys(fields).reduce(
      (acc, fieldName) => {
        const { mappedType, isPrivate } = fields[fieldName]
        if (!isPrivate) {
          if (mappedType === 'number') {
            acc.avg.push(fieldName)
            acc.sum.push(fieldName)
          }
          if (mappedType === 'number' || mappedType === 'string' || mappedType === 'Date') {
            acc.min.push(fieldName)
            acc.max.push(fieldName)
          }
        }
        return acc
      },
      { avg: [], sum: [], min: [], max: [] } as Record<string, string[]>
    )
    const aggregateFields = Object.keys(fieldsByAggregateFunction).reduce((acc, agggregateFunctionName) => {
      if (fieldsByAggregateFunction[agggregateFunctionName].length) {
        const typeName = `${modelName}Where${_.upperFirst(agggregateFunctionName.substring(1))}`
        const type = new GraphQLInputObjectType({
          name: typeName,
          fields: fieldsByAggregateFunction[agggregateFunctionName].reduce((acc, aggregateFieldName) => {
            const field = fields[aggregateFieldName]
            const type =
              aggregateFieldName === 'avg' || aggregateFieldName === 'sum'
                ? this.getOperatorType({ mappedType: 'number', type: GraphQLFloat }, schema, config)!
                : this.getOperatorType(field, schema, config)!
            schema.getTypeMap()[type.name] = type
            return {
              [aggregateFieldName]: {
                name: aggregateFieldName,
                type,
                extensions: undefined,
              },
              ...acc,
            }
          }, {} as GraphQLInputFieldMap),
        })
        schema.getTypeMap()[typeName] = type

        acc[agggregateFunctionName] = {
          name: agggregateFunctionName,
          type,
          extensions: undefined,
        }
      }
      return acc
    }, {} as GraphQLInputFieldMap)

    return {
      ...aggregateFields,
      count: {
        name: 'count',
        type: this.getOperatorType({ mappedType: 'number', type: GraphQLInt }, schema, config)!,
        extensions: undefined,
      },
    }
  }
}

function getEqualOperatorsTypeFields(type: GraphQLInputType) {
  return {
    equal: {
      type,
    },
    notEqual: {
      type,
    },
  }
}

function getInOperatorsTypeFields(type: GraphQLInputType) {
  return {
    in: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    notIn: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
  }
}

function getNumericOperatorsTypeFields(type: GraphQLInputType) {
  return {
    greaterThan: {
      type,
    },
    greaterThanOrEqual: {
      type,
    },
    lessThan: {
      type,
    },
    lessThanOrEqual: {
      type,
    },
  }
}

function getTextOperatorsTypeFields(type: GraphQLInputType) {
  return {
    like: {
      type,
    },
    notLike: {
      type,
    },
  }
}

function getCaseInsensitiveTextOperatorsTypeFields(type: GraphQLInputType) {
  return {
    iLike: {
      type,
    },
    notILike: {
      type,
    },
  }
}

function getListOperatorsTypeFields(type: GraphQLInputType) {
  return {
    equal: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    notEqual: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    contains: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    containedBy: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    overlaps: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
  }
}
