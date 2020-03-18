const ListLine = {
  /* GET the line section */
  section: (parent, args, context) => context.prisma.listLine({ id: parent.id }).section(),
};

module.exports = { ListLine };
