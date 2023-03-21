const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/sequelize/sqlite').db;

/**
 *
 */
class BookList extends Model {}

BookList.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  identifier: DataTypes.STRING,
  title: DataTypes.STRING,
  language: DataTypes.STRING,
  contributor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  creator: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cover: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.SMALLINT,
    allowNull: true,
  },
}, {
  sequelize,
  timestamps: true,
  tableName: 'books',
});

// BookList.sync();
// Stats.hasMany(StatsGuilds);

module.exports = BookList;
