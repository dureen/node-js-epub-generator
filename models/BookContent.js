const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/sequelize/sqlite').db;

const BookListModel = require('./BookList');
/**
 *
 */
class BookContent extends Model {}

BookContent.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  bookId: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: {
      model: BookListModel,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  rawPosition: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  subTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: '1',
  },
}, {
  sequelize,
  timestamps: true,
  tableName: 'contents',
});

// BookContent.sync();
module.exports = BookContent;
