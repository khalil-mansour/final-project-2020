const Query = {
  users: (context) => {
    return context.prisma.users()
  }, 
}

module.exports = { Query }