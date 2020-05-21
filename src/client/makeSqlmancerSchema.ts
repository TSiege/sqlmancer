import { makeExecutableSchema, IExecutableSchemaDefinition } from 'graphql-tools'
import { transformSchema } from './transformSchema'

export const makeSqlmancerSchema = (config: IExecutableSchemaDefinition) => {
  const schema = makeExecutableSchema(config)
  return transformSchema(schema)
}
