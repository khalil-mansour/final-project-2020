const group_mutations  = {
  createGroup: (root, args, context) => context.prisma.createGroup({
    name: args.name,
    address: { connect: { id: args.addressId } },
    admin: { connect: { id: args.adminId } },
    members: { connect: [{ id: args.memberIds }] },
  }),
}

module.exports = { group_mutations };