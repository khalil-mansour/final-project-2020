const { authenticate } = require('../../utils.js');

const listSectionMutation = {
  createListSections: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      const mutations = args.input.sections.map((section) => context.prisma.createListSection({
        title: section.title,
        list: { connect: { id: section.list } },
        mainSection: section.mainSection,
        lines: {
          create: section.lines.map((line) => ({
            text: line.text,
            quantity: line.quantity,
            checked: line.checked,
          })),
        },
      }));
      return Promise.all(mutations).then(() => true).catch((error) => error);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
  deleteListSections: async (root, args, context) => {
    try {
      const mutations = args.input.sections.map((section) => context.prisma.deleteListSection({ id: section }));
      return Promise.all(mutations).then(() => true).catch((error) => error.message);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },

  updateListSections: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      if (res) {
        const mutations = args.input.sections.map((section) => context.prisma.updateListSection({
          data: {
            title: section.title,
            mainSection: section.mainSection,
            lines: {
              update: section.lines.map((line) => ({
                data: {
                  text: line.text,
                  quantity: line.quantity,
                  checked: line.checked,
                },
                where: {
                  id: line.id,
                },
              })),
            },
          },
          where: {
            id: section.id,
          },
        }));
        return Promise.all(mutations).then(() => true).catch((error) => error);
      }
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },

};
module.exports = { listSectionMutation };
