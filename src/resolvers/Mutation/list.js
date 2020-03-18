const { authenticate } = require('../../utils.js');

const getLinesToDelete = (section, oldList) => {
  const currentSection = oldList.sections.find((oldSection) => oldSection.id === section.id);
  if (currentSection) {
    return currentSection.lines.filter(
      (currLine) => !section.lines.find((line) => line.id === currLine.id),
    ).map((lineToDelete) => lineToDelete.id);
  }
  return [];
};

const getSectionsToDelete = (list, oldList) => oldList.sections.filter(
  (currSection) => !list.sections.find((section) => section.id === currSection.id),
).map((sectionToDelete) => sectionToDelete.id);

const listMutation = {
  createList: async (root, args, context) => {
    try {
      await authenticate(context);
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
      throw new Error(error.message);
    }
  },
  deleteLists: async (root, args, context) => {
    try {
      await authenticate(context);
      const firstListId = (args.input.lists.length > 0) ? args.input.lists[0] : [];
      const groupFromList = await context.prisma.list({ id: firstListId }).group();

      const result = await context.prisma.updateGroup({
        where: { id: groupFromList.id },
        data: {
          lists: {
            delete: args.input.lists.map((list) => ({ id: list })),
          },
        },
      });
      return !!result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateList: async (root, args, context) => {
    try {
      await authenticate(context);
      const fragment = `
        fragment ListWithSections on List {
        sections {
          id
          lines {
            id
          }
        }
      }
      `;
      const currentList = await context.prisma.list({ id: args.input.id }).$fragment(fragment);
      const sectionsToUpdate = args.input.sections.filter((section) => (section.id !== null));
      // eslint-disable-next-line max-len
      const sectionsToCreate = args.input.sections.filter((section) => (section.id === null || section.id === undefined));

      return context.prisma.updateList({
        where: { id: args.input.id },
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
                  delete: getLinesToDelete(section, currentList).map(
                    (lineId) => ({ id: lineId }),
                  ),
                },
              },
            })),
            delete: getSectionsToDelete(args.input, currentList).map(
              (sectionId) => ({ id: sectionId }),
            ),
          },
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { listMutation };
