const List = {
  /* GET list's sections */
  sections: (parent, args, context) => context.prisma.list({ id: parent.id }).sections(),
  /* GET list's group */
  group: (parent, args, context) => context.prisma.list({ id: parent.id }).group(),
};

module.export = { List };
