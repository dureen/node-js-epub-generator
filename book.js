const x = require('./models/BookList');
const y = require('./models/BookContent');

exports.addBook = async (props={
  identifier: 'epub-doc',
  title: 'New Document',
  creator: '-',
  language: 'en',
  description: '-',
  coverPath: null,
  thumbnailPath: null,
  publisher: '-',
}) => {
  return await x.create(props).catch(console.error);
};

exports.updateBook = async (bookId, props={
  identifier: '',
  title: '',
  creator: '',
  language: '',
  description: '',
  coverPath: '',
  thumbnailPath: '',
  publisher: '',
}) => {
  const book = await x.findByPk(bookId).catch(console.error);
  if (!book) return 0;

  if (props.identifier !== '' && props.identifier !== null) {
    x.identifier = props.identifier;
  }
  if (props.title !== '' && props.title !== null) {
    x.title = props.title;
  }
  if (props.creator !== '' && props.creator !== null) {
    x.creator = props.creator;
  }
  if (props.language !== '' && props.language !== null) {
    x.language = props.language;
  }
  if (props.description !== '' && props.description !== null) {
    x.description = props.description;
  }
  if (props.coverPath !== '' && props.coverPath !== null) {
    x.coverPath = props.coverPath;
  }
  if (props.thumbnailPath !== '' && props.thumbnailPath !== null) {
    x.thumbnailPath = props.thumbnailPath;
  }
  if (props.publisher !== '' && props.publisher !== null) {
    x.publisher = props.publisher;
  }

  x.save();
  return 1;
};

exports.destroyBook = async (bookId) => {
  return await x.destroy({
    where: {id: bookId},
  }).catch(console.error);
};


exports.addContent= async (book={
  bookId: 0,
  position: 0,
  subtitle: '',
  content: '',
}) => {
  if (!book.bookId) return 0;
  if (!book.position) return 0;
  if (!book.subtitle || book.subtitle == '') return 0;
  if (!book.content || book.content == '') return 0;
  return await y.create(book).catch(console.error);
};

exports.updateContent = async (contentId, book={
  bookId: 0,
  position: 0,
  subtitle: '',
  content: '',
}) => {
  const content = await y.findByPk(contentId).catch(console.error);
  if (!content) return 0;
  if (book.bookId) {
    y.bookId = book.bookId;
  }
  if (book.position) {
    y.position = book.position;
  }
  if (book.subtitle && book.subtitle !== '') {
    y.position = book.subtitle;
  }
  if (book.content && book.content !== '') {
    y.content = book.content;
  }
  y.save();
  return 1;
};

exports.destroyContent = async (contentId) => {
  return await y.destroy({
    where: {id: contentId},
  }).catch(console.error);
};
