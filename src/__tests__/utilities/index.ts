import { execute, parse, DocumentNode, GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { applyMiddleware } from 'graphql-middleware'

import { BaseBuilder } from '../..'
import { SqlmancerClient } from '../postgres/sqlmancer'

const dialectsToTest = process.env.DB ? process.env.DB.split(' ') : ['postgres', 'mysql', 'sqlite']

export function getRollback(client: SqlmancerClient) {
  return async function (builder: BaseBuilder, fn: (result: any) => void) {
    const error = new Error('Rolling back transaction')
    await expect(
      client.transaction(async (trx) => {
        const result = await builder.transaction(trx).execute()
        fn(result)
        throw error
      })
    ).rejects.toStrictEqual(error)
  }
}

export function withDialects(
  fn: (
    client: SqlmancerClient,
    rollback: (builder: BaseBuilder, fn: (result: any) => void) => Promise<void>,
    typeDefs: DocumentNode,
    schema: GraphQLSchema
  ) => void
) {
  dialectsToTest.forEach((name) => {
    const client = require(`../${name}/client`).client as SqlmancerClient
    const typeDefs = require(`../${name}/schema`).typeDefs as DocumentNode
    const schema = require(`../${name}/schema`).schema as GraphQLSchema

    // eslint-disable-next-line jest/valid-title
    describe(name, () => {
      fn(client, getRollback(client), typeDefs, schema)

      afterAll(async () => {
        await client.destroy()
      })
    })
  })
}

export async function mockResolveInfo(schema: GraphQLSchema, typeName: string, fieldName: string, source: string) {
  let resolveInfo: GraphQLResolveInfo | undefined = undefined

  const schemaWithMiddleware = applyMiddleware(schema, {
    [typeName]: {
      [fieldName]: async (resolve, parent, args, context, info) => {
        resolveInfo = info
        return resolve(parent, args, context, info)
      },
    },
  })

  await execute({ schema: schemaWithMiddleware, document: parse(source) })

  return resolveInfo!
}
