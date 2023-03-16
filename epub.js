/* eslint-disable max-len */
const fs = require('node:fs');
const AdmZip = require('adm-zip');

const x = require('./models/BookList');
const y = require('./models/BookContent');

const generate = (bookTitle, isBuffer=false) => {
  const props = x.findOne({
    where: {title: bookTitle},
  }).catch(console.error);
  if (!props) return 0;
  const data = y.findAll({
    where: {bookId: props.id},
    raw: true,
  }).catch(console.error);
  if (data.length < 1) return 0;

  const zip = new AdmZip();

  // = CONFIGURATION =
  const fileName = bookTitle ?? 'epub-doc';
  const fileExtension = 'epub';
  const output = 'output/' + fileName +'.'+ fileExtension;
  // - mimetype -
  const mimetype = fs.readFileSync('template/mimetype', 'utf8');
  zip.addFile('mimetype', Buffer.from(mimetype, 'utf8'));

  // - container.xml -
  const container = fs.readFileSync('template/META-INF/container.xml', 'utf-8');
  zip.addFile('META-INF/container.xml', Buffer.from(container, 'utf8'));

  // - package.opf -
  let pkg = fs.readFileSync('template/OEBPS/package.opf', 'utf-8');
  const items = [];
  const itemrefs = [];
  for (const i of data) {
    items.push(`    <item href="pages/pg-${i.position}.xhtml" id="idx-${i.id}" media-type="application/xhtml+xml"/>`);
    itemrefs.push(`    <itemref idref="idx-${i.id}"/>`);
  }

  pkg = pkg.replace('{{ items }}', items.join('\n'));
  pkg = pkg.replace('{{ itemrefs }}', itemrefs.join('\n'));

  pkg = pkg.replace('{{ identifier }}', props.identifier);
  pkg = pkg.replace('{{ title }}', props.title);
  pkg = pkg.replace('{{ creator }}', props.creator);
  pkg = pkg.replace('{{ language }}', props.language);
  pkg = pkg.replace('{{ modified }}', props.updatedAt);
  pkg = pkg.replace('{{ description }}', props.description);
  pkg = pkg.replace('{{ publisher }}', props.publisher);

  if (!props.thumbnailPath) {
    zip.addLocalFile('template/OEBPS/images/cover.svg', 'OEBPS/images');
    pkg = pkg.replace('{{ thumbnailPath }}', 'cover.svg');
  }

  zip.addFile('OEBPS/package.opf', Buffer.from(pkg, 'utf8'));

  // - toc.ncx -
  let toc = fs.readFileSync('template/OEBPS/toc.ncx', 'utf-8');
  const points = [];
  for (const i of data) {
    points.push(`
<navPoint>
    <navLabel>
        <text>${i.subtitle}</text>
    </navLabel>
    <content src="pages/pg-${i.position}.xhtml"/>
</navPoint>`);
  };
  toc = toc.replace('{{ navPoint }}', points.join('\n'));
  zip.addFile('OEBPS/toc.ncx', Buffer.from(toc, 'utf8'));

  // - nav.xhtml -
  let nav = fs.readFileSync('template/OEBPS/nav.xhtml', 'utf-8');
  const navs = [];
  for (const i of data) {
    navs.push(`<li><a href="pages/pg-${i.position}.xhtml">${i.subtitle}</a></li>`);
  }
  nav = nav.replace('{{ navList }}', navs.join('\n'));
  zip.addFile('OEBPS/nav.xhtml', Buffer.from(nav, 'utf8'));

  // - pages -
  for (const i of data) {
    let page = fs.readFileSync('template/OEBPS/pages/pg-x.xhtml', 'utf-8');
    page = page.replaceAll('{{ subtitle }}', i.subtitle);
    page = page.replace('{{ content }}', i.content);

    zip.addFile(`OEBPS/pages/pg-${i.position}.xhtml`, Buffer.from(page, 'utf8'));
  }

  // - cover -
  if (!props.coverPath) {
    let cover = fs.readFileSync('template/OEBPS/cover-b.xhtml', 'utf-8');
    cover = cover.replace('{{ title }}', props.title);
    zip.addFile(`OEBPS/cover.xhtml`, Buffer.from(cover, 'utf8'));
  }

  // - introduction -
  let intro = fs.readFileSync('template/OEBPS/intro.xhtml', 'utf-8');
  intro = intro.replace('{{ description }}', props.description);
  zip.addFile(`OEBPS/intro.xhtml`, Buffer.from(intro, 'utf8'));

  // - build file.zip -
  if (isBuffer) {
    // get everything as a buffer
    const willSendthis = zip.toBuffer();
    return willSendthis;
  } else {
    // or write everything to disk
    zip.writeZip(output);
    return 1;
  }
};
generate('book');
