const fs = require('fs');
const rootDirectory = "../src";

const [name] = process.argv.slice(2);
const folder = `${rootDirectory}/${name}`

const indexContent = `
const { ${name} } = require("./${name}.js");
const { resolvers } = require("./resolvers.js");
const { typeDefs } = require("./typeDefs.js");

module.exports = {
    ${name},
    resolvers,
    typeDefs
};
`

const nameContent = `
class ${name} {
}

module.exports = {
  ${name},
};`

const createFolder = (folder) => {
    fs.mkdir(folder, { recursive: true }, (err) => { if (err) throw err; });
}

const createFile = (name, content) => {
    fs.appendFile(`${folder}/${name}.js`, content, function (err) {
        if (err) throw err;
        console.log('Saved!');
      }); 
}

createFolder(folder)
createFile("index", indexContent)
createFile("resolvers", "const resolvers = { \r\n \r\n }")
createFile("typeDefs", 'const typeDefs =` \r\n \r\n `')
createFile(name, nameContent)