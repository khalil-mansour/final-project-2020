const { authenticate, userBelongsToGroup } = require('../../utils.js');

const listQuery = {
  listsByGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // make sure that the connected user is allowed to make query for the specified group
      if (await userBelongsToGroup(context, res.uid, args.groupId)) {
        return context.prisma.lists({ where: { group: args.groupId } });
      }
      throw new Error('The connected user is not allowed to query this transaction.');
    } catch (error) {
      throw new Error(error.message);
    }
  },
  list: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      return context.prisma.list({ id: args.id });
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { listQuery };
