const BreakNotice = {

    /* GET break notice group */
    group: (parent, args, context) => context.prisma.breakNotice({ id: parent.id }).group(),
    
    /* Get break notice files */
    files: (parent, args, context) => context.prisma.breakNotice({ id: parent.id }).files(),
};
  
  module.exports = { BreakNotice };
  