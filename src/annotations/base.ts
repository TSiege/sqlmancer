/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  coerceInputValue,
  GraphQLObjectType,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLArgument,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLEnumValue,
  GraphQLInputObjectType,
  GraphQLInputField,
  GraphQLInputType,
  GraphQLScalarType,
  GraphQLSchema,
} from 'graphql'
import { AnnotationLocation, SqlmancerConfig } from '../types'

export abstract class BaseAnnotation<TArgs = any> {
  locations: AnnotationLocation[]
  args: TArgs
  argsType: GraphQLInputType

  constructor(args: TArgs) {
    this.args = this.argsType ? coerceInputValue(args, this.argsType) : args
  }

  isLocationValid(location: AnnotationLocation) {
    return this.locations.includes(location as AnnotationLocation)
  }

  applyToSchema(_config: SqlmancerConfig, _schema: GraphQLSchema): void {
    // Possibly implemented by subclass
  }

  applyToObject(_config: SqlmancerConfig, _object: GraphQLObjectType, _schema: GraphQLSchema): void {
    // Possibly implemented by subclass
  }

  applyToField(
    _config: SqlmancerConfig,
    _field: GraphQLField<any, any>,
    _object: GraphQLObjectType | GraphQLInterfaceType,
    _schema: GraphQLSchema
  ): void {
    // Possibly implemented by subclass
  }

  applyToArgument(
    _config: SqlmancerConfig,
    _arg: GraphQLArgument,
    _field: GraphQLField<any, any>,
    _object: GraphQLObjectType | GraphQLInterfaceType,
    _schema: GraphQLSchema
  ): void {
    // Possibly implemented by subclass
  }

  applyToInterface(_config: SqlmancerConfig, _iface: GraphQLInterfaceType, _schema: GraphQLSchema): void {
    // Possibly implemented by subclass
  }

  applyToUnion(_config: SqlmancerConfig, _union: GraphQLUnionType, _schema: GraphQLSchema): void {
    // Possibly implemented by subclass
  }

  applyToEnum(_config: SqlmancerConfig, _enum: GraphQLEnumType, _schema: GraphQLSchema): void {
    // Possibly implemented by subclass
  }

  applyToEnumValue(
    _config: SqlmancerConfig,
    _enumValue: GraphQLEnumValue,
    _enum: GraphQLEnumType,
    _schema: GraphQLSchema
  ): void {
    // Possibly implemented by subclass
  }

  applyToInputObject(_config: SqlmancerConfig, _inputObject: GraphQLInputObjectType, _schema: GraphQLSchema): void {
    // Possibly implemented by subclass
  }

  applyToInputField(
    _config: SqlmancerConfig,
    _inputField: GraphQLInputField,
    _inputObject: GraphQLInputObjectType,
    _schema: GraphQLSchema
  ): void {
    // Possibly implemented by subclass
  }

  applyToScalar(_config: SqlmancerConfig, _scalar: GraphQLScalarType): void {
    // Possibly implemented by subclass
  }
}
