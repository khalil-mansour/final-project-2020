const typeDefs =`
type Query {
  users: [User!]!
}

type Mutation {
 signUp(userId: String, name: String, lastName: String, email: String): User
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