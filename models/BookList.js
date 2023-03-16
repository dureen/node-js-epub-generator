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
  identifier: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  creator: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coverPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  thumbnailPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  timestamps: true,
  tableName: 'bookList',
});

BookList.sync();
// Stats.hasMany(StatsGuilds);

module.exports = BookList;
