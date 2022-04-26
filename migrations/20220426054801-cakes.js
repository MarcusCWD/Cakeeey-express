'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('cakes',{
    id: { type: 'int', primaryKey:true, autoIncrement:true, unsigned: true},
    name: { type: 'string', length:30, notNull:true},
    waittime: { type: 'int', notNull:false},
    description: { type: 'string', length:600, notNull:false},
})

};

exports.down = function(db) {
  return db.dropTable('cakes');
};


exports._meta = {
  "version": 1
};
