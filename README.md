# 💻 Contributing to the project 💻
### 👉 Prerequisites 
- [Visual Studio Code](https://code.visualstudio.com/)
- [Latest stable version of Node (10.16+) and NPM](https://nodejs.org/en/)
- [Angular CLI latest version](https://angular.io/guide/setup-local)

### 👉 Recommended extensions (ordered by importance)

### 👉 Running the application

docker-compose up for the prisma server and your local postgres db
prisma deploy to start you prisma instance http://localhost:4646/_admin to check the db 

```shell
    docker-compose up -d 
    prisma deploy 
```
you need to deploy eveyrtime you modify the datamodel.prisma

#### Server 

Run `node src/index.js`  in the project for a dev server. Navigate to `http://localhost:4000/`. The app will automatically reload if you change any of the source files.

```shell
    node src/index.js
```

####  Usefull command 

Create the structur for your model foler and file 

```shell
    node createModel $modelName
```

# 📖 Understanding the project structure 🤔💡
The structure is pretty simple here. 
- One rule don't modify the generated code for prisma 
- src/index.js is where the you create your grapqlServer
  In this file you can import all the entity and give them to the grapgqlServer instance 
  so it could resolve and read the schema.
- src/models/ is where all our models are with the same structure 
  - index combine all the file so we can export them in the index.js <-- server
  - resolvers contains all the mutation and the query for the entity 
  - typeDefs contains the type for our graphqlschema
  
```shell
  src
    | generate
    | models
        - index.js
        - resolvers.js
        - typeDefs.js
        - {entityName}.js 
    | index.js <---- server
```

# 🧪 Building and running tests locally 🧪
#### Build


