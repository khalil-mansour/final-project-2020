const { authenticate } = require('../../utils.js');

const listLineMutation = {
  createListLines: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      const mutations = args.input.lines.map((line) => context.prisma.createListLine({
        text: line.text,
        section: { connect: { id: line.section } },
        quantity: line.quantity,
        checked: line.checked,
      }));
      return Promise.all(mutations).then(() => true).catch((error) => error.message);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
  deleteListLines: async (root, args, context) => {
    try {
      const mutations = args.input.lines.map((line) => context.prisma.deleteListLine({ id: line }));
      return Promise.all(mutations).then(() => true).catch((error) => error.message);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
  updateListLines: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      const mutations = args.input.lines.map((line) => context.prisma.updateListLine({
        data: {
          text: line.text,
          quantity: line.quantity,
          checked: line.checked,
        },
        where: {
          id: line.id,
        },
      }));
      return Promise.all(mutations).then(() => true).catch((error) => error.message);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
};
module.exports = { listLineMutation };
