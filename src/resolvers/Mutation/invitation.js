const { authenticate, userBelongsToGroup } = require('../../utils.js');

async function verifyToken(token, context) {
  return !(await context.prisma.$exists.invitation({
    code: token,
  }));
}


const invitationMutation = {
  createInvitation: async (root, args, context) => {
    try {
      // authenticate
      const res = await authenticate(context);


      // check if user is in group
      if (!(userBelongsToGroup(context, res.uid, args.input.groupId))) {
        throw new Error('User sending invite not in current group');
      }

      // random tag
      const randomize = require('randomatic');
      let unique = false;
      let uniqueToken = '';
      do {
        const code = randomize('Aa0', 5);
        unique = await verifyToken(code, context);
        if (unique) {
          uniqueToken = code;
        }
      } while (!unique);


      return context.prisma.createInvitation({
        group: { connect: { id: args.input.groupId } },
        role: { connect: { type: args.input.role } },
        code: uniqueToken,
      });
      
    } catch (error) {
      throw new Error(error.message);
    }
  },

  refreshInvitation: async (root, args, context) => {
    try {
      // authenticate
      const res = await authenticate(context);


      // check if user is in group
      if (!(userBelongsToGroup(context, res.uid, args.input.groupId))) {
        throw new Error('User sending invite not in current group');
      }

      // random tag
      const randomize = require('randomatic');
      let unique = false;
      let uniqueToken = '';
      do {
        const code = randomize('Aa0', 5);
        unique = await verifyToken(code, context);
        if (unique) {
          uniqueToken = code;
        }
      } while (!unique);

      return context.prisma.updateInvitation({
        data: {
          code: uniqueToken,
        },
        where: {
          id: args.input.invitationId,
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { invitationMutation };
