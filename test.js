const x = require('./book');

(async ()=> {
  console.log(await x.createBook({
    identifier: 'none',
    title: 'God-Like Extraction',
    creator: 'Fruit of Chaos',
    language: 'en',
  }));

  //   console.log(await x.updateBook('1', {
  //     thumbPath: 'https://img.webnovel.com/bookcover/21638395105875505/180/180.jpg',
  //   }));

  // x.addContent('1',

// )
})();

