import {
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isUnionType,
  printSchema,
  GraphQLArgument,
  GraphQLEnumType,
  GraphQLEnumValue,
  GraphQLField,
  GraphQLInputField,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
} from 'graphql'
import { cloneSchema, getResolversFromSchema, makeExecutableSchema } from 'graphql-tools'
import { AnnotationLocation, SqlmancerConfig } from '../types'
import { parseAnnotations } from '../utilities'
import { AnnotationMap } from '../annotations'
import { getSqlmancerConfig } from './getSqlmancerConfig'

export function transformSchema(originalSchema: GraphQLSchema): GraphQLSchema {
  const config = getSqlmancerConfig(originalSchema)
  const schema = cloneSchema(originalSchema)

  const { description, annotations } = parseAnnotations(schema.description)
  if (Object.keys(annotations).length) {
    schema.description = description || undefined
    applyAnnotations(config, annotations, 'SCHEMA', schema)
  }

  transformTypes(config, schema)

  return makeExecutableSchema({ typeDefs: printSchema(schema), resolvers: getResolversFromSchema(schema) })
}

function transformTypes(config: SqlmancerConfig, schema: GraphQLSchema) {
  const typeMap = schema.getTypeMap()
  Object.keys({ ...typeMap }).forEach((typeName) => {
    const type = typeMap[typeName]
    if (!type.name.startsWith('__')) {
      const { description, annotations } = parseAnnotations(type.description)
      if (Object.keys(annotations).length) {
        type.description = description || undefined
        const location = isObjectType(type)
          ? 'OBJECT'
          : isInterfaceType(type)
          ? 'INTERFACE'
          : isUnionType(type)
          ? 'UNION'
          : isEnumType(type)
          ? 'ENUM'
          : isInputObjectType(type)
          ? 'INPUT_OBJECT'
          : 'SCALAR'
        applyAnnotations(config, annotations, location, type as any, schema)
      }
      if (isObjectType(type) || isInterfaceType(type)) {
        transformFields(config, type, schema)
      } else if (isInputObjectType(type)) {
        transformInputFields(config, type, schema)
      } else if (isEnumType(type)) {
        transformEnumValues(config, type, schema)
      }
    }
  })
}

function transformFields(
  config: SqlmancerConfig,
  type: GraphQLObjectType | GraphQLInterfaceType,
  schema: GraphQLSchema
) {
  const fieldMap = type.getFields()
  Object.keys({ ...fieldMap }).forEach((fieldName) => {
    const field = fieldMap[fieldName]
    const { description, annotations } = parseAnnotations(field.description)
    if (Object.keys(annotations).length) {
      field.description = description || undefined
      applyAnnotations(config, annotations, 'FIELD_DEFINITION', field, type, schema)
    }
    const args = [...field.args]
    args.forEach((arg) => {
      const { description, annotations } = parseAnnotations(arg.description)
      if (Object.keys(annotations).length) {
        arg.description = description || undefined
        applyAnnotations(config, annotations, 'ARGUMENT_DEFINITION', arg, field, type, schema)
      }
    })
  })
}

function transformInputFields(config: SqlmancerConfig, type: GraphQLInputObjectType, schema: GraphQLSchema) {
  const fieldMap = type.getFields()
  Object.keys({ ...fieldMap }).forEach((fieldName) => {
    const field = fieldMap[fieldName]
    const { description, annotations } = parseAnnotations(field.description)
    if (Object.keys(annotations).length) {
      field.description = description || undefined
      applyAnnotations(config, annotations, 'INPUT_FIELD_DEFINITION', field, type, schema)
    }
  })
}

function transformEnumValues(config: SqlmancerConfig, type: GraphQLEnumType, schema: GraphQLSchema) {
  const values = [...type.getValues()]
  values.forEach((value) => {
    const { description, annotations } = parseAnnotations(value.description)
    if (Object.keys(annotations).length) {
      value.description = description || undefined
      applyAnnotations(config, annotations, 'ENUM_VALUE', value, type, schema)
    }
  })
}

function applyAnnotations<T extends AnnotationLocation>(
  config: SqlmancerConfig,
  annotations: AnnotationMap,
  location: T,
  ...params: T extends 'SCHEMA'
    ? [GraphQLSchema]
    : T extends 'OBJECT'
    ? [GraphQLObjectType, GraphQLSchema]
    : T extends 'FIELD_DEFINITION'
    ? [GraphQLField<any, any>, GraphQLObjectType | GraphQLInterfaceType, GraphQLSchema]
    : T extends 'ARGUMENT_DEFINITION'
    ? [GraphQLArgument, GraphQLField<any, any>, GraphQLObjectType | GraphQLInterfaceType, GraphQLSchema]
    : T extends 'INTERFACE'
    ? [GraphQLInterfaceType, GraphQLSchema]
    : T extends 'UNION'
    ? [GraphQLUnionType, GraphQLSchema]
    : T extends 'ENUM'
    ? [GraphQLEnumType, GraphQLSchema]
    : T extends 'ENUM_VALUE'
    ? [GraphQLEnumValue, GraphQLEnumType, GraphQLSchema]
    : T extends 'INPUT_OBJECT'
    ? [GraphQLInputObjectType, GraphQLSchema]
    : T extends 'INPUT_FIELD_DEFINITION'
    ? [GraphQLInputField, GraphQLInputObjectType, GraphQLSchema]
    : T extends 'SCALAR'
    ? [GraphQLScalarType, GraphQLSchema]
    : never
) {
  Object.keys(annotations).forEach((name: keyof AnnotationMap) => {
    const annotation = annotations[name]!

    if (!annotation.isLocationValid(location)) {
      throw new Error(
        `Invalid location for @${name}. Expected one of: ${annotation.locations.join(', ')}. Received: ${location}.`
      )
    }

    const applyFnMap: Record<AnnotationLocation, Function> = {
      SCHEMA: annotation.applyToSchema.bind(annotation),
      OBJECT: annotation.applyToObject.bind(annotation),
      FIELD_DEFINITION: annotation.applyToField.bind(annotation),
      ARGUMENT_DEFINITION: annotation.applyToArgument.bind(annotation),
      INTERFACE: annotation.applyToInterface.bind(annotation),
      UNION: annotation.applyToUnion.bind(annotation),
      ENUM: annotation.applyToEnum.bind(annotation),
      ENUM_VALUE: annotation.applyToEnumValue.bind(annotation),
      INPUT_OBJECT: annotation.applyToInputObject.bind(annotation),
      INPUT_FIELD_DEFINITION: annotation.applyToInputField.bind(annotation),
      SCALAR: annotation.applyToScalar.bind(annotation),
    }

    applyFnMap[location](config, ...params)
  })
}
