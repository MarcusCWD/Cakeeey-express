const knex = require('knex')({
    client: process.env.DB_DRIVER,
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT
    },
    pool: {min: 0, max: 7}
  })
  const bookshelf = require('bookshelf')(knex)
  
  module.exports = bookshelf;
  