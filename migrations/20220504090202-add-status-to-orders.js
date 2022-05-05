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

exports.up =  function(db) {
  return db.addColumn('orders', 'status_id', {
      type: 'int',
      notNull : true,
      foreignKey: {
          name: 'order_status_fk',
          table: 'status',
          rules: {
              onDelete:'cascade',
              onUpdate:'restrict'
          },
          mapping: 'id'
      }
  })
}

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};