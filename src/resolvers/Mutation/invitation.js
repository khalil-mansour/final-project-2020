const { authenticate } = require('../../utils.js');

async function verifyToken(token, context) {
  const res = await context.prisma.$exists.invitation({
    code: token,
  });
  return !res;
}


const invitationMutation = {
  createInvitation: async (root, args, context) => {
    try {
      // authenticate
      const res = await authenticate(context);

      // check if user is in group
      const exists = await context.prisma.$exists.userGroup({
        user: { firebaseId: res.uid },
        group: { id: args.input.groupId },
      });

      if (exists) {
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


        return await context.prisma.createInvitation({
          group: { connect: { id: args.input.groupId } },
          role: { connect: { type: args.input.role } },
          code: uniqueToken,
        });
      }
      throw new Error('User sending invite not in current group');
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { invitationMutation };
