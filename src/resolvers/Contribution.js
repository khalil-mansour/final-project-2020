const Contribution = {

  /* GET contribution user */
  user: (parent, args, context) => context.prisma.contribution({ id: parent.id }).user(),

  /* GET contribution transaction */
  transaction: (parent, args, context) => context.prisma.contribution({ id: parent.id }).transaction(),

};

module.exports = { Contribution };
