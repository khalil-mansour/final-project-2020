const UserGroup = {
  user: (parent, args, context) => context.prisma.userGroup({ id: parent.id }).user(),

  group: (parent, args, context) => context.prisma.userGroup({ id: parent.id }).group(),

};

module.exports = { UserGroup };
