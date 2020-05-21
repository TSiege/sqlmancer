import { BaseAnnotation } from './base'
import { AnnotationLocation, SqlmancerConfig } from '../types'
import {
  GraphQLField,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLSchema,
  GraphQLUnionType,
  GraphQLInputField,
  GraphQLInputObjectType,
} from 'graphql'

export class PrivateAnnotiation extends BaseAnnotation<undefined> {
  locations: AnnotationLocation[] = [
    'FIELD_DEFINITION',
    'OBJECT',
    'UNION',
    'INTERFACE',
    'INPUT_OBJECT',
    'INPUT_FIELD_DEFINITION',
  ]

  applyToField(_config: SqlmancerConfig, field: GraphQLField<any, any>, object: GraphQLObjectType): void {
    delete object.getFields()[field.name]
  }

  applyToObject(_config: SqlmancerConfig, object: GraphQLObjectType, schema: GraphQLSchema): void {
    delete schema.getTypeMap()[object.name]
  }

  applyToInterface(_config: SqlmancerConfig, iface: GraphQLInterfaceType, schema: GraphQLSchema): void {
    delete schema.getTypeMap()[iface.name]
  }

  applyToUnion(_config: SqlmancerConfig, union: GraphQLUnionType, schema: GraphQLSchema): void {
    delete schema.getTypeMap()[union.name]
  }

  applyToInputField(_config: SqlmancerConfig, field: GraphQLInputField, object: GraphQLInputObjectType): void {
    delete object.getFields()[field.name]
  }

  applyToInputObject(_config: SqlmancerConfig, object: GraphQLInputObjectType, schema: GraphQLSchema): void {
    delete schema.getTypeMap()[object.name]
  }
}
