const UserGroup = {
  user: (parent, args, context) => context.prisma.userGroup({ id: parent.id }).user(),

  group: (parent, args, context) => context.prisma.userGroup({ id: parent.id }).group(),

  role: (parent, args, context) => context.prisma.userGroup({ id: parent.id }).role(),
};

module.exports = { UserGroup };
