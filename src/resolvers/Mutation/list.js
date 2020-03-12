const { authenticate } = require('../../utils.js');

function getSectionsTo(sections, type) {
  let sectionArray;
  if (type === 'create') {
    sectionArray = sections.filter((section) => (section.id === null || section.id === undefined));
  } else {
    sectionArray = sections.filter((section) => (section.id !== null));
  }
  return sectionArray;
}

function getLinesToDelete(section, oldList) {
  let linesToDelete = [];
  const currentSection = oldList.sections.find((x) => x.id === section.id);
  if (currentSection) {
    linesToDelete = currentSection.lines.filter(
      (currLine) => !section.lines.find((line) => line.id === currLine.id),
    ).map((lineToDelete) => lineToDelete.id);
  }
  return linesToDelete;
}

function getSectionsToDelete(list, oldList) {
  let sectionsToDelete = [];
  sectionsToDelete = oldList.sections.filter(
    (currSection) => !list.sections.find((section) => section.id === currSection.id),
  ).map((sectionToDelete) => sectionToDelete.id);
  return sectionsToDelete;
}

const listMutation = {
  createList: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      if (res) {
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
      }
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
  deleteList: async (root, args, context) => {
    try {
      const mutations = args.input.lists.map((listId) => context.prisma.deleteList({ id: listId }));
      return Promise.all(mutations).then(() => true).catch((error) => error.message);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
  updateList: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      if (res) {
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
        const sectionsToUpdate = getSectionsTo(args.input.sections, 'update');
        const sectionsToCreate = getSectionsTo(args.input.sections, 'create');

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
      }
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  },
};

module.exports = { listMutation };
