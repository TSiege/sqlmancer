import { GraphQLJSON, GraphQLJSONObject } from 'graphql-scalars'
import { makeExecutableSchema } from 'graphql-tools'
import { transformSchema } from '../../../client'

const typeDefs = `
  scalar JSON
  scalar JSONObject

  """
  @sqlmancer {
    dialect: "POSTGRES",
    transformFieldNames: "SNAKE_CASE",
    customScalars: {
      JSON: ["JSON", "JSONObject"],
    }
  }
  """
  type Query  {
    """
    @limit
    @offset
    @orderBy { model: "Widget" }
    @where { model: "Widget" }
    """
    widgets: [Widget!]!

    """
    @orderBy
    @where
    """
    alsoWidgets: [Widget!]!

    """
    @many
    """
    someMoreWidgets: [Widget!]!

    """
    @paginate
    """
    paginatedWidgets: Widget
  }

  type Mutation {
    """
    @input { action: "CREATE" }
    """
    createWidget: Widget!

    """
    @input { action: "CREATE", list: true }
    """
    createWidgets: [Widget!]!

    """
    @input { action: "UPDATE" }
    """
    updateWidget: Widget!

    """
    @input { model: "Widget", action: "UPDATE" }
    """
    updateWidgets: [Widget!]!
  }

  """
  @model { table: "widgets", pk: "id" }
  """
  type Widget {
    """
    @hasDefault
    """
    id: ID!
    idNullable: ID
    idList: [ID!]!
    string: String!
    stringNullable: String
    stringList: [String!]!
    int: Int!
    intNullable: Int
    intList: [Int!]!
    float: Float!
    floatNullable: Float
    floatList: [Float!]!
    boolean: Boolean!
    booleanNullable: Boolean
    booleanList: [Boolean!]!
    json: JSON!
    jsonNullable: JSON
    jsonList: [JSON!]!
    jsonObject: JSONObject!
    jsonObjectNullable: JSONObject
    jsonObjectList: [JSONObject!]!
    enum: Flavor!
    enumNullable: Flavor
    enumList: [Flavor!]!
    
    """
    @col "something_else"
    """
    renamedField: String! 
    
    """
    @private
    """
    privateString: String!
    
    """
    @private
    """
    privateInt: Int!
    
    """
    @depend ["foo", "bar"]
    """
    derivedField: String
    unsupportedType: Gizmo
    unsupportedListType: [Gizmo!]!

    """
    @relate {
      on: [{from: "id", to: "widget_id"}]
    }
    """
    gizmos: [Gizmo!]!
    """
    @relate {
      on:[{from: "id", to: "gizmo_id"}, {from: "jigger_id", to: "id"}],
      through: "widget_jiggers"
    }
    """
    jiggers: [Jigger!]!

    """
    @private
    @relate {
      on:[{from: "id", to: "gizmo_id"}, {from: "jigger_id", to: "id"}],
      through: "widget_jiggers"
    }
    """
    privateRelationship: [Jigger!]!

    """
    @relate {
      on: [{from: "bauble_id", to: "id"},]
    }
    """
    bauble: Bauble

    """
    @ignore
    """
    ignoredField: String!

    """
    @relate {
      on: [{ from: "parent_id", to: "id" },]
    }
    """
    parentWidget: Widget!
  }

  enum Flavor {
    ORANGE
    GRAPE
    CHERRY
  }

  """
  @model { table: "gizmos", pk: "id" }
  """
  type Gizmo implements Whatchamacallit {
    id: ID! 
    someField: String!
    idNullable: ID
    string: String!
    stringNullable: String
    int: Int!
    intNullable: Int
    float: Float!
    floatNullable: Float
    boolean: Boolean!
    booleanNullable: Boolean
    json: JSON!
    jsonNullable: JSON
    jsonObject: JSONObject!
    jsonObjectNullable: JSONObject
    enum: Flavor!
    enumNullable: Flavor
    enumList: [Flavor!]!
  }

  """
  @model { table: "jiggers", pk: "id" }
  """
  type Jigger implements Whatchamacallit {
    id: ID! 
    someField: String!
  }

  """
  @model { table: "baubles", pk: "id" }
  """
  type Bauble implements Whatchamacallit {
    id: ID! 
    someField: String!
  }

  """
  @model { table: "secrets", pk: "id" }
  @private
  """
  type Secret implements Whatchamacallit {
    id: ID! 
    someField: String!
  }

  """
  @model { table: "all_items", pk: "id" }
  """
  union SearchResult = Widget | Gizmo | Jigger | Bauble

  """
  @model { table: "whatchamacallits", pk: "id" }
  """
  interface Whatchamacallit {
    someField: String!
  }
`

const originalSchema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: {
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
})

export const schema = transformSchema(originalSchema)
