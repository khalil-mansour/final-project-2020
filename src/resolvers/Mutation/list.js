const { authenticate } = require('../../utils.js');

const listMutations = {
  createList: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      return context.prisma.createList({
        title: args.input.title,
        groupId: args.input.groupId,
        description: args.input.description,
        type: args.input.type,
        sections: {
          create: args.input.sections.map((section) => ({
            title: section.title,
            mainSection: section.mainSection,
            lines: {
              create: section.lines.map((line) => ({
                text: line.text,
                quantity: line.quantity,
                checked: line.checked,
              })),
            },
          })),
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
};
module.exports = { listMutations };
