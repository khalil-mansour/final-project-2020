const { authenticate } = require('../../utils.js');

function getSectionsTo(sections, type) {
  let sectionArray;
  if (type === 'create') {
    sectionArray = sections.filter((section) => (section.id != null));
  } else {
    sectionArray = sections.filter((section) => (section.id == null));
  }
  return sectionArray;
}

const listMutation = {
  createList: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      return context.prisma.createList({
        title: args.input.title,
        group: { connect: { id: args.input.group } },
        description: args.input.description,
        type: args.input.type,
        isTemplate: args.input.isTemplate,
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
  deleteList: async (root, args, context) => {
    try {
      const mutations = args.input.sections.map((list) => context.prisma.deleteList({ id: list }));
      return Promise.all(mutations).then(() => true).catch((error) => error.message);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
  updateList: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      const sectionsToUpdate = getSectionsTo(args.input.sections, 'update');
      const sectionsToCreate = getSectionsTo(args.input.sections, 'create');

      return context.prisma.updateList({
        where: { id: args.input.listId },
        data: {
          title: args.input.title,
          description: args.input.description,
          type: args.input.type,
          isTemplate: args.input.isTemplate,
          sections: {
            create: sectionsToCreate.map((section) => ({
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
            update: sectionsToUpdate.map((section) => ({
              where: { id: section.id },
              data: {
                title: section.title,
                mainSection: section.mainSection,
                lines: {
                  create: section.lines.filter((line) => line.id === null).map((line) => ({
                    text: line.text,
                    quantity: line.quantity,
                    checked: line.checked,
                  })),
                  update: section.lines.filter((line) => line.id != null).map((line) => ({
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
            })),
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
};

module.exports = { listMutation };
