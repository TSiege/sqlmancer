import { withDialects } from './__utilties__'
import { FilmAggregateBuilder, LanguageAggregateBuilder } from './__fixtures__/models'

describe('AggregateBuilder', () => {
  withDialects(options => {
    describe('basic queries', () => {
      test('count', async () => {
        const builder = new FilmAggregateBuilder(options).count()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.count).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('avg', async () => {
        const builder = new FilmAggregateBuilder(options).avg('rentalRate')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.avg.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('sum', async () => {
        const builder = new FilmAggregateBuilder(options).sum('replacementCost')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.replacementCost).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('min', async () => {
        const builder = new FilmAggregateBuilder(options).min('title')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.min.title).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('max', async () => {
        const builder = new FilmAggregateBuilder(options).max('title')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.max.title).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('multiple functions', async () => {
        const builder = new FilmAggregateBuilder(options)
          .max('title')
          .max('description')
          .count()
          .avg('rentalDuration')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.max.title).toBeDefined()
        expect(result.max.description).toBeDefined()
        expect(result.avg.rentalDuration).toBeDefined()
        expect(result.count).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('where', () => {
      test('with one field', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({ title: { equal: 'FILM' } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with two field', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          title: { equal: 'FILM' },
          description: { equal: 'description' },
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('equals null', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          title: { equal: null },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('notEqual null', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          title: { notEqual: null },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with extra operators', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          title: { equal: 'FILM', notEqual: 'MOVIE' },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with non-existent field', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          titl: { equal: 'FILM' },
        } as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with empty object', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({})
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('and', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          and: [{ title: { equal: 'FILM' } }, { description: { equal: 'description' } }],
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('or', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          or: [{ title: { equal: 'FILM' } }, { description: { equal: 'description' } }],
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('not', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          not: { title: { equal: 'FILM' } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (single)', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          language: { name: { equal: 'English' } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (multi)', async () => {
        const builder = new LanguageAggregateBuilder(options).max('name').where({
          films: { title: { equal: 'FILM' } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.max.name).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (through)', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').where({
          actors: { firstName: { equal: 'BOB' } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate)', async () => {
        const builder = new LanguageAggregateBuilder(options).max('name').where({
          films: { avg: { replacementCost: { greaterThan: 10 } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.max.name).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (count)', async () => {
        const builder = new LanguageAggregateBuilder(options).max('name').where({
          films: { count: { greaterThan: 1 } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.max.name).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (both field and aggregate)', async () => {
        const builder = new LanguageAggregateBuilder(options).max('name').where({
          films: { avg: { replacementCost: { greaterThan: 20 } }, title: { equal: 'BEAR GRACELAND' } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.max.name).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with nested association', async () => {
        const builder = new LanguageAggregateBuilder(options).max('name').where({
          films: { language: { name: { equal: 'English' } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.max.name).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('merge', async () => {
        const builder = new FilmAggregateBuilder(options)
          .sum('rentalRate')
          .where({ title: { equal: 'FILM' } })
          .mergeWhere({
            description: { equal: 'description' },
          })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('orderBy', () => {
      test('with one field', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').orderBy([{ title: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with no fields', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').orderBy([])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with multiple fields', async () => {
        const builder = new FilmAggregateBuilder(options)
          .sum('rentalRate')
          .orderBy([{ id: 'ASC' }, { lastUpdate: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (field)', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').orderBy([{ language: { name: 'ASC' } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate)', async () => {
        const builder = new LanguageAggregateBuilder(options)
          .max('name')
          .orderBy([{ films: { avg: { replacementCost: 'ASC' } } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.max.name).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate and through)', async () => {
        const builder = new FilmAggregateBuilder(options)
          .sum('rentalRate')
          .orderBy([{ actors: { min: { lastUpdate: 'ASC' } } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (count)', async () => {
        const builder = new LanguageAggregateBuilder(options).max('name').orderBy([{ films: { count: 'ASC' } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.max.name).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with empty object', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').orderBy([{}])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (missing field)', async () => {
        const builder = new FilmAggregateBuilder(options)
          .sum('rentalRate')
          .orderBy([{ originalLanguage: { nam: 'ASC' } as any }])
        expect(() => builder.toQueryBuilder()).toThrow('Invalid field name')
      })

      test('with association (missing aggregate field)', async () => {
        const builder = new LanguageAggregateBuilder(options)
          .max('name')
          .orderBy([{ films: { avg: { replacementCostt: 'ASC' } as any } }])
        expect(() => builder.toQueryBuilder()).toThrow('Invalid field name')
      })
    })

    describe('limit', () => {
      test('with number', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').limit(10)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('offset', () => {
      test('with number', async () => {
        const builder = new FilmAggregateBuilder(options).sum('rentalRate').offset(20)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})