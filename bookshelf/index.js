const knex = require('knex')({
    client: 'mysql',
    connection: {
      user: 'marcus',
      password:'password',
      database:'cakeeey'
    }
  })
  const bookshelf = require('bookshelf')(knex)
  
  module.exports = bookshelf;
  