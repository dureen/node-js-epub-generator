const BookListModel = require('./models/BookList');
const BookContentModel = require('./models/BookContent');

exports.createBook = async (props={
  identifier: 'book-id',
  title: 'book-name',
  language: 'en',
  contributor: null,
  creator: null,
  date: null,
  subject: null,
  description: null,
  publisher: null,
  cover: null,
  status: null,
}) => {
  if (!props.identifier || !props.title || !props.language) return 0;
  const res = await BookListModel.create(props).catch(console.error);
  return {id: res.id};
};

exports.updateBook = async (bookId, props={
  identifier: 'book-id',
  title: 'book-name',
  language: 'en',
  contributor: null,
  creator: null,
  date: null,
  subject: null,
  description: null,
  publisher: null,
  cover: null,
  status: null,
}) => {
  const book = await BookListModel.findByPk(bookId).catch(console.error);
  if (!book) return 0;
  // Required
  if (props.identifier) book.identifier = props.identifier;
  if (props.title) book.title = props.title;
  if (props.language) book.language = props.language;
  // Optional
  if (props.contributor) book.contributor = props.contributor;
  if (props.creator) book.creator = props.creator;
  if (props.date) book.date = props.date;
  if (props.subject) book.subject = props.subject;
  if (props.description) book.description = props.description;
  if (props.publisher) book.publisher = props.publisher;
  if (props.cover) book.cover = props.cover;
  if (props.status) book.status = props.status;
  book.save();
  return 1;
};

exports.destroyBook = async (bookId) => {
  return await BookListModel.destroy({
    where: {id: bookId},
  }).catch(console.error);
};


exports.createContent= async (props={
  bookId: 'book-id',
  rawPosition: null,
  subTitle: 'subtitle',
  content: null,
  status: null,
}) => {
  if (!props.bookId || !props.subTitle) return 0;
  return await BookContentModel.create(props).catch(console.error);
};

exports.updateContent = async (contentId, props={
  bookId: 'book-id',
  rawPosition: null,
  subTitle: 'subtitle',
  content: null,
  status: null,
}) => {
  const content = await BookContentModel.findByPk(contentId)
      .catch(console.error);
  if (!content) return 0;

  if (props.bookId) content.bookId = props.bookId;
  if (props.rawPosition) content.rawPosition = props.rawPosition;
  if (props.subTitle) content.subTitle = props.subTitle;
  if (props.content) content.content = props.content;
  if (props.status) content.status = props.status;

  content.save();
  return 1;
};

exports.destroyContent = async (contentId) => {
  return await BookContentModel.destroy({
    where: {id: contentId},
  }).catch(console.error);
};
