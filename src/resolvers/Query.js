const Query = {

    /* GET all users */
    users: (root, args, context) => {
        return context.prisma.users()
    },

    /* GET user by ID */
    user: (root, args, context) => {
        return context.prisma.user({ id: args.id })
    },

    /* GET all groups */
    groups: (parent, args, context) => {
        return context.prisma.groups()
    },

    /* GET group by id */
    group: (root, args, context) => {
        return context.prisma.group({ id: args.id })
    },

    /* GET all addresses */
    addresses: (root, args, context) => {
        return context.prisma.addresses()
    },
    
    /* GET single address by ID */
    address: (root, args, context) => {
        return context.prisma.address({ id: args.id })
    },
}

module.exports = { Query };