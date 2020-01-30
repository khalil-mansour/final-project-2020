const fs = require('fs');
const rootDirectory = "../src";
const modelsDirectory = "models";

const [name] = process.argv.slice(2);
const folder = `${rootDirectory}/${modelsDirectory}/${name}`;
const resolversFolder = folder + `/resolvers`;

const indexContent = `
const { ${name} } = require("./${name}.js");
const { typeDefs } = require("./typeDefs.js");

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Subscription = require('./resolvers/Subscription')

const resolvers = {
  Query,
  Mutation,
  Subscription,
};

module.exports = {
  ${name},
  resolvers,
  typeDefs
};
`;

const nameContent = `
class ${name} {
}

module.exports = {
  ${name},
};`;

const createFolder = (folder) => {
    fs.mkdir(folder, { recursive: true }, (err) => { if (err) throw err; });
};

const createFile = (name, content) => {
    fs.appendFile(`${folder}/${name}.js`, content, function (err) {
        if (err) throw err;
        console.log('Saved!');
      }); 
};

createFolder(folder);
createFolder(resolversFolder);
createFile("index", indexContent);
createFile("Query", "const Query = { \r\n \r\n } \r\n \r\n module.exports = { Query }");
createFile("Mutation", "const Mutation = { \r\n \r\n } \r\n \r\n module.exports = { Mutation }");
createFile("Subscription", "const Subscription = { \r\n \r\n } \r\n \r\n module.exports = { Subscription }");
createFile("typeDefs", 'const typeDefs =` \r\n \r\n ` \r\n \r\n module.exports = { typeDefs }');
createFile(name, nameContent);