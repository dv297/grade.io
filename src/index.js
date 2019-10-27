const path = require('path');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { GraphQLModule } = require('@graphql-modules/core');
const { loadSchemaFiles, loadResolversFiles } = require('graphql-toolkit');

const graphqlRootDir = path.join(__dirname, 'graphql');
const typeDefs = loadSchemaFiles(path.join(graphqlRootDir, 'schemas'));
const resolvers = loadResolversFiles(path.join(graphqlRootDir, 'resolvers'));

const { schema } = new GraphQLModule({
  typeDefs,
  resolvers,
});

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
);

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
