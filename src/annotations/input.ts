import { BaseAnnotation } from './base'
import { AnnotationLocation, SqlmancerConfig } from '../types'
import {
  isInputType,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'
import { unwrap, makeNullable } from '../utilities'

export type InputAnnotationArgs = {
  action: 'CREATE' | 'UPDATE'
  model?: string
  list?: boolean
}

export class InputAnnotiation extends BaseAnnotation<InputAnnotationArgs> {
  argsType = new GraphQLNonNull(
    new GraphQLInputObjectType({
      name: 'args',
      fields: {
        action: {
          type: new GraphQLNonNull(new GraphQLEnumType({ name: 'action', values: { CREATE: {}, UPDATE: {} } })),
        },
        model: {
          type: GraphQLString,
        },
        list: {
          type: GraphQLBoolean,
        },
      },
    })
  )
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']

  applyToField(
    config: SqlmancerConfig,
    field: GraphQLField<any, any>,
    _object: GraphQLObjectType | GraphQLInterfaceType,
    schema: GraphQLSchema
  ): void {
    const modelName = this.args.model || unwrap(field.type).name
    const type = this.getInputType(modelName, schema, config)!

    field.args = [
      ...field.args,
      {
        name: 'input',
        type: this.args.list ? new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(type))) : new GraphQLNonNull(type),
        description: '',
        defaultValue: undefined,
        extensions: undefined,
        astNode: undefined,
      },
    ]
  }

  private getInputType(modelName: string, schema: GraphQLSchema, config: SqlmancerConfig) {
    const typeName = this.getInputName(modelName)
    let type = schema.getTypeMap()[typeName] as GraphQLInputObjectType | undefined

    if (!type) {
      type = this.createInputType(modelName, schema, config)
    }

    return type!
  }

  private getInputName(modelName: string) {
    return `${this.args.action === 'CREATE' ? 'Create' : 'Update'}${modelName}Input`
  }

  private createInputType(modelName: string, schema: GraphQLSchema, config: SqlmancerConfig): GraphQLInputObjectType {
    const { models } = config
    const model = models[modelName]

    if (!model) {
      throw new Error(`"${modelName}" isn't a valid model. Did you include the @model directive?`)
    }

    const typeName = this.getInputName(modelName)

    const inputType: GraphQLInputObjectType = new GraphQLInputObjectType({
      name: typeName,
      fields: Object.keys(model.fields).reduce((acc, fieldName) => {
        const { type, column, hasDefault, isPrivate } = model.fields[fieldName]
        const nullable = this.args.action === 'UPDATE' || hasDefault
        if (!isPrivate && isInputType(type) && (this.args.action === 'CREATE' || column !== model.primaryKey)) {
          acc[fieldName] = { type: nullable ? makeNullable(type) : type }
        }
        return acc
      }, {} as GraphQLInputFieldConfigMap),
    })
    schema.getTypeMap()[typeName] = inputType

    return inputType
  }
}
