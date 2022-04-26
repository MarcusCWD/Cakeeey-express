"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable("cakes_ingredients", {
    id: { type: "int", primaryKey: true, autoIncrement: true },
    cake_id: {
      type: "int",
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: "cakes_ingredients_cake_fk",
        table: "cakes",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
        mapping: "id",
      },
    },
    ingredient_id: {
      type: "int",
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: "cakes_ingredients_ingredient_fk",
        table: "ingredients",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
        mapping: "id",
      },
    },
  });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
