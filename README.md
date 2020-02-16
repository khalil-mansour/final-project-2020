# 💻 Contributing to the project 💻
### 👉 Prerequisites 
- [Visual Studio Code](https://code.visualstudio.com/)
- [Latest stable version of Node (12.16+)](https://nodejs.org/en/)
- [Angular CLI latest version](https://angular.io/guide/setup-local)
- [Latest stable version of yarn](https://legacy.yarnpkg.com/en/)

### 👉 Recommended extensions (ordered by importance)

### 👉 VSCode and Git config
Run the following line to properly configure git:
```shell
    git config --global core.autocrlf true
```

In VSCode :
- Set the default end of line character setting to « \n »
- Specify the end of line used by prettier to be « lf »

### 👉 Running the application

docker-compose up for the prisma server and your local postgres db
prisma deploy to start you prisma instance http://localhost:4646/_admin to check the db 

```shell
    docker-compose up -d 
    prisma deploy 
```
you can also use the command
```shell
    yarn prisma
```
you need to deploy eveyrtime you modify the datamodel.prisma

#### Server 

Run `node src/index.js`  in the project for a dev server. Navigate to `http://localhost:4000/`. The app will automatically reload if you change any of the source files.

```shell
    node src/index.js
```
You can also use nodemon to hot-reload your server. A yarn script also exist for this
```shell
    nodemon src/index.js
    OR
    yarn server
```

#### EsLint configuration

In Visual Studio Code, add these lines in settings.json :

    "eslint.format.enable": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },

#### EsLint configuration

In Visual Studio Code, add these lines in settings.json :

    "eslint.format.enable": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },

# 📖 Understanding the project structure 🤔💡
The structure is pretty simple here. 
- One rule don't modify the generated code for prisma 
- src/index.js is where the you create your grapqlServer
  In this file you can import all the entity and give them to the grapgqlServer instance 
  so it could resolve and read the schema.
- src/schema.graphql contains the type for our graphql schema
- src/resolvers/ is where all our resolvers are
  - index combine all the file so we can export them in the index.js <-- server
  - resolvers contains all the mutation and the query for the entity
  - Query.js contains all the queries for the entity
  - Subscription.js contains all the subscriptions for the entity
  - src/Mutation is where all our mutations for the entity are
  
```shell
  src
    | generated
    | resolvers
        - index.js
        - Query.js
        - Subscription.js
        | Mutation
    - index.js <---- server
    - schema.graphql
```

# 🧪 Building and running tests locally 🧪
#### Build


