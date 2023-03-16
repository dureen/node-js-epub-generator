const {Sequelize} = require('sequelize');

const data = {
  dialect: 'sqlite',
  storage: 'data/collection.db',
};

exports.db = new Sequelize(data);
