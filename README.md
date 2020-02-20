# 💻 Contributing to the project 💻
### 👉 Prerequisites 
- [Visual Studio Code](https://code.visualstudio.com/)
- [Latest stable version of Node (10.16+)](https://nodejs.org/en/)
- [Angular CLI latest version](https://angular.io/guide/setup-local)
- [Nodemon (to automatically restart the server on file change)](https://www.npmjs.com/package/nodemon)
  - `npm install -g nodemon`
- [Prisma client](https://www.npmjs.com/package/prisma)
  - `npm install -g prisma`
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

to get the seed for you dev env run
```
 prisma seed
```

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

##### To fake the firebase authentication
- Do not forget to remove any modification to the `config.json` file before doing a merge request to the master branch.
- 1. Go to `src/config.json`
- 2. Set `simulate_firebase_auth` to true
- 3. Set `simulated_firebase_uid` to the [firebase uid](https://console.firebase.google.com/u/0/project/roommate-93dcd/authentication/users) of the user you want the server to see you as.

Exemples :
```json
The server will see any request as coming from 'admin@admin.com'
{
  "simulate_firebase_auth": true,
  "simulated_firebase_uid": "G4ZaG49WfabtVgzbUYnELosxlqL2"
}
```
```json
The server will see any request as coming from 'proprio@admin.com'
{
  "simulate_firebase_auth": true,
  "simulated_firebase_uid": "tT8tv8UXt2MSJiXoO5GoWFBfU0v2"
}
```
```json
The server will see any request as coming from 'locataire@admin.com'
{
  "simulate_firebase_auth": true,
  "simulated_firebase_uid": "yaXRcIB3F5eUB94OOxfCDuCVl7O2"
}
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


