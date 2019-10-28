# Grade.io

> Open source tool for helping teachers run coding classes

# Running the application

The Prisma server and database need to be running for the application to work. To do this, run the following command:

```
docker-compose up -d
```

From there, the database can be initialized with the datamodels using the following command:

```
prisma deploy
```

The GraphQL endpoints can be run in development mode using the following command:

```
npm run dev
```

# Seeding the Database

Initial data can be seeded into the database using the "src/seeds/createSchool.js" script.

```
node src/seeds/createSchool.js
```

This script uses data from a "seedSampleData.js" file that is not committed. This seedSampleData.js file should export
an object that contains the properties referenced by the seed script.
