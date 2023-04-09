const {Sequelize} = require('sequelize');

const data = {
  dialect: 'sqlite',
  storage: 'data/collection.sqlite',
};

exports.db = new Sequelize(data);
