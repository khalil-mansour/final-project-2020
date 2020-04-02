const BreakNotice = {

  /* GET break notice group */
  group: (parent, args, context) => context.prisma.breakNotice({ id: parent.id }).group(),

  /* GET break notice files */
  files: (parent, args, context) => context.prisma.breakNotice({ id: parent.id }).files(),

  /* GET break notice owner */
  owner: (parent, args, context) => context.prisma.breakNotice({ id: parent.id }).owner(),
};

module.exports = { BreakNotice };
