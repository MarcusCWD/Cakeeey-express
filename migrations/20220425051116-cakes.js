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
  return db.createTable('cakes',{
    cake_id: { type: 'int', primaryKey:true, autoIncrement:true, unsigned: true},
    cake_name: { type: 'string', length:30, notNull:false},
    wait_time: { type: 'smallint', notNull:true},
    base_price: { type: 'smallint', notNull:false},
    description:{ type: 'string', length:800, notNull:true},
})
};

exports.down = function(db) {
  return db.dropTable('cakes');
};

exports._meta = {
  "version": 1
};
