const fs = require('fs');
const { authenticate, userBelongsToGroup } = require('../../utils.js');
const { Query } = require('../Query/Query.js');

// store the files in filesystem
async function storeFS({
  stream, filename, notice,
}) {
  const uploadDir = `media/${notice.id}`;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  const path = `${uploadDir}/${filename}`;
  return new Promise((resolve, reject) => stream
    .on('error', (error) => {
      if (stream.truncated) {
        // delete truncated file
        fs.unlinkSync(path);
      }
      reject(error);
    })
    .pipe(fs.createWriteStream(path))
    .on('error', (error) => reject(error))
    .on('finish', () => resolve({ path })));
}

// delete the files from filesystem
function deleteFromFS(files) {
  files.forEach((file) => fs.unlinkSync(file.location));
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
        owner: { connect: { firebaseId: res.uid } },
        happenedAt: args.input.happenedAt,
      });

      await Promise.all(
        args.input.filesToUpload.map(async (element) => {
          const { filename, createReadStream } = await element;
          const stream = createReadStream();
          const pathObj = await storeFS({ stream, filename, notice });
          const fileLocation = pathObj.path;
          await context.prisma.createFile({
            filename,
            location: fileLocation,
            notice: { connect: { id: notice.id } },
          });
        }),
      );

      return notice;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateBreakNotice: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      const frag = `
      fragment breakNoticeWithGroupAndFiles on BreakNotice {
        id
        group {
          id
        }
        files {
          id
          location
        }
      }`;

      // fetch notice
      const notice = await context.prisma.breakNotice({ id: args.input.id }).$fragment(frag);

      // check if current user belongs to group
      if (!(await userBelongsToGroup(context, res.uid, notice.group.id))) {
        throw new Error('User does not belong in group.');
      }

      // delete files from FS
      const deletedFiles = notice.files.filter((file) => !args.input.files.find((fileToFind) => fileToFind.id === file.id));

      if (deletedFiles.length) {
        deleteFromFS(deletedFiles);
      }


      await Promise.all(
        args.input.filesToUpload.map(async (element) => {
          const { filename, createReadStream } = await element;
          const stream = createReadStream();
          const pathObj = await storeFS({ stream, filename, notice });
          const fileLocation = pathObj.path;
          return context.prisma.createFile({
            filename,
            location: fileLocation,
            notice: { connect: { id: args.input.id } },
          });
        }),
      );

      // update break notice with new data
      return context.prisma.updateBreakNotice({
        data: {
          subject: args.input.subject,
          text: args.input.text,
          urgencyLevel: args.input.urgencyLevel,
          files: {
            delete: deletedFiles.map((file) => ({ id: file.id })),
          },
          happenedAt: args.input.happenedAt,
        },
        where: {
          id: args.input.id,
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  solveBreakNotice: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // add group fragment
      const groupFrag = `
      fragment breakNoticeWithGroup on BreakNotice {
        id
        group {
          id
        }
        solved
      }`;

      // fetch break notice
      const breakNotice = await context.prisma.breakNotice({
        id: args.input.id,
      }).$fragment(groupFrag);

      // check if already solved
      if (breakNotice.solved === true) {
        throw new Error('This specific break notice has already been solved.');
      }

      // check if current user belongs to group
      if (!(await userBelongsToGroup(context, res.uid, breakNotice.group.id))) {
        throw new Error('User does not belong in group.');
      }

      const roleFrag = `
      fragment userGroupWithRole on UserGroup {
        role {
          type
        }
      }`;

      const userGroup = await Query.userGroupByIds(
        root, {
          input: {
            userId: res.uid,
            groupId: breakNotice.group.id,
          },
        },
        context,
      ).$fragment(roleFrag);

      // check if current user has landlord role
      if (userGroup[0].role.type !== 'landlord') {
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
