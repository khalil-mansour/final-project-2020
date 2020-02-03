const User = {
  groups: ({ id }, args, context) => {
      return context.prisma.users({ id }).groups
  },
}

module.exports = { User };