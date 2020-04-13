
const fs = require('fs');
const path = require('path');
const EasyGraphQLTester = require('easygraphql-tester');

const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.graphql'), 'utf8');

describe('Chat', () => {
  const tester = new EasyGraphQLTester(schema);

  describe('Mutation', () => {
    it('Create a chatroom', async () => {
      const mutation = `
      mutation CreateChatroom {
        createChatroom(
          input: {
            name: "XXXXXXXXXXX"
          }
        ) {
          name
        }
      }`;
      tester.test(true, mutation);
    });

    it('Deactivate a chatroom', async () => {
      const mutation = `
    mutation DeactivateChatroom{
      deactivateChatroom(
        input:{
          id: "XXXXXXXXXXX"
        }
      ) {
        id,
        name,
        isArchived,
      }
    }`;
      tester.test(true, mutation);
    });

    it('Activate a chatroom', async () => {
      const mutation = `
    mutation Activate{
      activateChatroom(
        input:{
          id: "XXXXXXXXXXX"
        }
      ) {
        id,
        name,
        isArchived,
      }
    }`;
      tester.test(true, mutation);
    });

    it('Join a chatroom', async () => {
      const mutation = `
      mutation JoinChatroom {
        joinChatroom (
          input: {
            chatroomId: "XXXXXXXXXXX"
          }
        ) {
          id,
          leftDate,
          chatroom {
            id,
            name,
            isArchived,
          },
          user {
            id,
            firebaseId,
            name,
            lastName,
            email,
          }
        }
      }`;
      tester.test(true, mutation);
    });

    it('Leave a chatroom', async () => {
      const mutation = `
      mutation LeaveChatroom {
        leaveChatroom (
            input: {
              chatroomId: "XXXXXXXXXXX"
            }
          ) {
            id,
            leftDate,
            chatroom {
              id,
              name,
              isArchived,
            },
            user {
              id,
              firebaseId,
              name,
              lastName,
              email,
            }
          }
        }`;
      tester.test(true, mutation);
    });

    it('send a message', async () => {
      const mutation = `
      mutation SendMessage {
        sendMessage(
          input:{
            content: "XXXXXXXXXXX",
            chatroomId: "XXXXXXXXXXX"
          }) 
        {
          id,
          content,
          chatroom {
            id,
            name,
            isArchived,
          },
          user {
            id,
            firebaseId,
            name,
            lastName,
            email,
          }
        }
      }`;
      tester.test(true, mutation);
    });

    it('Update a message', async () => {
      const mutation = `
      mutation updateMessage {
        editMessage (
          input : {
            content: "XXXXXXXXXXX",
            id: "XXXXXXXXXXX",
          }
        ) 
          {
          id,
          content,
          chatroom {
            id,
            name,
            isArchived,
          },
          user {
            id,
            firebaseId,
            name,
            lastName,
            email,
          }
        }
      }`;
      tester.test(true, mutation);
    });

    it('Delete a message', async () => {
      const mutation = `
      mutation deleteMessage {
        deleteMessage (
          input: {
            id: "XXXXXXXXXXX"
          }) 
          {
          id,
          content,
          chatroom {
            id,
            name,
            isArchived,
          },
          user {
            id,
            firebaseId,
            name,
            lastName,
            email,
          }
        }
      }`;
      tester.test(true, mutation);
    });
  });

  describe('Query', () => {
    it('Get a chatroom by id', () => {
      const query = `
      query userChatroom {
        userChatroom(userChatroomId: "ck7ituyk5007p0736z0v2um0j") {
          id
        }
      }`;
      tester.test(true, query);
    });
    it('Get all the chatroom of a user', () => {
      const query = `
      query getChatroomOfUser {
        getChatroomOfUser(
          input: {
            id: "ck7it3zmd004007363afsbf9o",
            getInactive: false
          })
        {
          id,
          leftDate,
          user {
            id,
            firebaseId,
            name,
            lastName,
            email,
          }
        }
      }`;
      tester.test(true, query);
    });
    it('Get users of a chatroom', () => {
      const query = `
        query getUserInChatroom {
          getUserInChatroom(     
            input: {
              id: "ck7hx5nkd000n0736mhn2z4zd",
              getInactive: true
            })
          {
            id,
            leftDate,
            user {
              id,
              firebaseId,
              name,
              lastName,
              email,
            }
          }
        }`;
      tester.test(true, query);
    });
    it('Get all chatroom', () => {
      const query = `
      query chatroom {
        chatroom(chatroomId: "ck7hx5nkd000n0736mhn2z4zd") {
          id
        }
      }`;
      tester.test(true, query);
    });
    it('Get a messages by id', () => {
      const query = `
      query message {
        message(messageId: "ck7iuos6u009p07360d3rubhx"){
          id
        }
      }`;
      tester.test(true, query);
    });
    it('Get messages in a chatroom', () => {
      const query = `
      query messageByChatroom {
        allMessageByChatroomId(
          input: {
            chatroomId: "ck7hx5nkd000n0736mhn2z4zd"
            numberOfMessages: 1
            skip: 0
          }
        ){
          id,
          content,
          user {
            id,
            firebaseId,
            name,
            lastName,
            email,
          }
        }
      }`;
      tester.test(true, query);
    });
  });
});
