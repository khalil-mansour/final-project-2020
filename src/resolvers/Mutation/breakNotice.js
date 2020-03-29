const { authenticate, userBelongsToGroup } = require('../../utils.js');
const { Query } = require('../Query/Query.js');
const fs = require('fs');

// store the files in local filesystem
async function storeFS({ stream, filename }) {
  const uploadDir = 'media';
  const path = `${uploadDir}/${filename}`;
  return new Promise((resolve, reject) =>
  stream
      .on('error', error => {
        if (stream.truncated) {
          // delete truncated file
          fs.unlinkSync(path);
        }
        reject(error);
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ path }))
  );
}

const breakNoticeMutation = {
  createBreakNotice: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // check if current user belongs to group
      if (!(await userBelongsToGroup(context, res.uid, args.input.groupId))) {
        throw new Error('User does not belong in group.');
      }

      // create the notice before adding the files
      const notice = await context.prisma.createBreakNotice({
        subject: args.input.subject,
        text: args.input.text,
        group: { connect: { id: args.input.groupId } },
        urgencyLevel: args.input.urgencyLevel,
        solved: false,
      });

      // upload the sent files to fs
      for (element of args.input.files) {
        const { filename, mimetype, createReadStream } = await element;
        const stream = createReadStream();
        const pathObj = await storeFS({ stream, filename });
        const fileLocation = pathObj.path;
        await context.prisma.createFile({
          filename: filename,
          location: fileLocation,
          notice: { connect: { id: notice.id } },
        });
      }
      return notice;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  solveBreakNotice: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // add group fragment
      const fragment = `
      fragment breakNoticeWithGroup on BreakNotice {
        id
        group {
          id
        }
      }`;

      // fetch break notice
      const breakNotice = await context.prisma.breakNotice({ id: args.input.id }).$fragment(fragment);

      console.log(breakNotice);
      // check if current user belongs to group
      if (!(await userBelongsToGroup(context, res.uid, breakNotice.group.id))) {
        throw new Error('User does not belong in group.');
      }

      // check if current user has landlord role
      if (await Query.userGroupByIds(root, { input: { userId: res.uid, groupId: breakNotice.group.id } }, context).role != 'landlord') {
        throw new Error('Only a user with a role of \'landlord\' can solve a break notice.');
      }

      return context.prisma.updateBreakNotice({
        data: {
          solved: true,
        },
        where: {
          id: breakNotice.id,
        },
      });

    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { breakNoticeMutation };