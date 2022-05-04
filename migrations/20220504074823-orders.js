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

exports.up = function(db) {
  return db.createTable('orders',{
    id: { type: 'int', primaryKey:true, autoIncrement:true},
    date: {type: 'date', notNull: false},
    totalprice: {type: 'int', notNull:true},
    firstname: {type: 'string', length:50, notNull:true },
    lastname: {type: 'string', length:50, notNull:true},
    address: {type: 'string', length:100, notNull:true},
})
};

exports.down = function(db) {
return db.dropTable('orders');
};

exports._meta = {
  "version": 1
};
