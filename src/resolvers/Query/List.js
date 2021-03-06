const { authenticate, userBelongsToGroup } = require('../../utils.js');

const listQuery = {
  listsByGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // make sure that the connected user is allowed to make query for the specified group
      if (await userBelongsToGroup(context, res.uid, args.groupId)) {
        return context.prisma.lists({ where: { group: { id: args.groupId } } });
      }
      throw new Error('The connected user is not allowed to query the lists for this group');
    } catch (error) {
      throw new Error(error.message);
    }
  },
  list: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // make sure that the connected user is allowed to make query for the specified group
      if (await userBelongsToGroup(context, res.uid, args.groupId)) {
        return context.prisma.list({ id: args.listId });
      }
      throw new Error('The connected user is not allowed to query the list');
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { listQuery };
