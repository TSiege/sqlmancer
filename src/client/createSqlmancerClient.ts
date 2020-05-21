import _ from 'lodash'
import Knex from 'knex'
import { makeExecutableSchema } from 'graphql-tools'

import { getSqlmancerConfig } from './getSqlmancerConfig'
import { GenericSqlmancerClient, ID } from '../types'
import { getTypeDefsFromGlob } from '../generate'

export function createSqlmancerClient<T extends GenericSqlmancerClient = GenericSqlmancerClient>(
  glob: string,
  knex: Knex
): T {
  const typeDefs = getTypeDefsFromGlob(glob)
  if (!typeDefs || !typeDefs.definitions.length) {
    throw new Error(`Found no files with valid type definitions using glob pattern "${glob}"`)
  }

  const schema = makeExecutableSchema({
    typeDefs,
    resolverValidationOptions: { requireResolversForResolveType: false },
  })
  const { dialect, models } = getSqlmancerConfig(schema)

  return Object.assign(knex, {
    models: _.mapValues(models, (model) => {
      const options = { knex, dialect }
      const { builders, readOnly } = model
      return {
        findById: (id: ID) => new builders.findById(options, id),
        findMany: () => new builders.findMany(options),
        findOne: () => new builders.findOne(options),
        paginate: () => new builders.paginate(options),
        createOne: readOnly ? undefined : (input: any) => new builders.createOne!(options, input),
        createMany: readOnly ? undefined : (input: Array<any>) => new builders.createMany!(options, input),
        deleteById: readOnly ? undefined : (id: ID) => new builders.deleteById!(options, id),
        deleteMany: readOnly ? undefined : () => new builders.deleteMany!(options),
        updateById: readOnly ? undefined : (id: ID, input: any) => new builders.updateById!(options, id, input),
        updateMany: readOnly ? undefined : (input: any) => new builders.updateMany!(options, input),
      }
    }),
  }) as any
}
