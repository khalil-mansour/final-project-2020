const { Query } = require('./Query');
const { user_mutations } = require('./Mutation/user_mutations');
const { group_mutations } = require('./Mutation/group_mutations'); 
const { address_mutations } = require('./Mutation/address_mutations'); 

const { User } = require('./User')
const { Group } = require('./Group')

module.exports = {
  Query,
  Mutation: {
    ...user_mutations,
    ...group_mutations,
    ...address_mutations,
  },
  User,
  Group,
};
