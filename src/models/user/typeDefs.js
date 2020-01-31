const typeDefs =`
type Query {
  users: [User!]!
}

type AuthPayload {
  token: String
  user: User
}

type Mutation {
 signUp(userId: String, name: String, lastName: String, email: String): AuthPayload 
 login(userId: String): AuthPayload
}

type User {
  id: ID! 
  userId: String! 
  name: String!
  lastName: String!
  email: String! 
}
`;

module.exports = {
  typeDefs
}