import { BufferWritableMock } from 'stream-mock'
import { generateClientTypeDeclarations } from '../generateClientTypeDeclarations'
import { withDialects } from '../../__tests__/utilities'

describe('generateClientTypeDeclarations', () => {
  withDialects((_client, _rollback, typeDefs) => {
    test('correct usage', async () => {
      const stream = new BufferWritableMock()
      generateClientTypeDeclarations(typeDefs, stream)
      stream.end()
      await new Promise((resolve, reject) => {
        stream.on('finish', () => {
          expect((stream.flatData as Buffer).toString()).toMatchSnapshot()
          resolve()
        })
        stream.on('error', reject)
      })
    })
  })
})
