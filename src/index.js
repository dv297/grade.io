require('dotenv').config();
const path = require('path');
const { ApolloServer } = require('apollo-server');
const { loadSchemaFiles, loadResolversFiles } = require('graphql-toolkit');

const { prisma } = require('../generated/prisma-client');

const graphqlRootDir = path.join(__dirname, 'graphql');
const typeDefs = loadSchemaFiles(path.join(graphqlRootDir, 'schemas'));
const resolvers = loadResolversFiles(path.join(graphqlRootDir, 'resolvers'));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: (request) => {
    return {
      request,
      prisma,
    };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server is running at ${url}`);
});
