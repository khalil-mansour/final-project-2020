const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const resolvers = require('./resolvers');

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: (request) => ({
    ...request,
    prisma,
  }),
});

const options = {
  bodyParserOptions: { limit: '10mb' },
};

// eslint-disable-next-line no-console
server.start(options, () => console.log('Server is running on http://localhost:4000'));
