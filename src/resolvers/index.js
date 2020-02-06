import { userMutations } from './Mutation/user.mutation';

const { Query } = require('./Query');

module.exports = {
  Query,
  Mutation: {
    ...userMutations,
  },
};
