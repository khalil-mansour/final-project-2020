const Group = {
  address: ({ id }, args, context) => {
    return context.prisma.groups({ id }).address()
  },
  admin: ({ id }, args, context) => {
    return context.prisma.groups({ id }).admin()
  },
  members: ({ id }, args, context) => {
    return context.prisma.groups({ id }).members()
  },
}

module.exports = { Group };