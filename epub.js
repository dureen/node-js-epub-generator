/* eslint-disable max-len */
const fs = require('node:fs');
const path = require('node:path');

const AdmZip = require('adm-zip');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const packagePath = 'package';
const outputPath = 'output';
const fileExtension = '.epub';

const BookModel = require('./models/BookList');
const ContentModel = require('./models/BookContent');

const generate = (bookTitle, isBuffer=false) => {
  const props = BookModel.findOne({
    where: {title: {
      [Op.like]: `${bookTitle}`,
    }},
  }).catch(console.error);
  if (!props) return 0;
  const data = ContentModel.findAll({
    where: {bookId: props.id},
    raw: true,
  }).catch(console.error);
  if (data.length < 1) return [];

  // const props = {
  //   identifier: 'identifier',
  //   title: 'title',
  //   language: 'language',
  //   // Optional
  //   contributor: 'contributor',
  //   creator: 'creator',
  //   date: 'date',
  //   subject: 'subject',
  //   description: 'description',
  //   cover: 0,
  // };
  // const data = [
  //   {
  //     id: '1',
  //     rawPosition: '1',
  //     subtitle: 'Tes -1',
  //     content: 'The paragraph 1',
  //   },
  //   {
  //     id: '2',
  //     rawPosition: '2',
  //     subtitle: 'Tes -2',
  //     content: 'The paragraph 2',
  //   },
  //   {
  //     id: '3',
  //     rawPosition: '3',
  //     subtitle: 'Tes -3',
  //     content: 'The paragraph 3',
  //   },
  // ];

  // = CONFIGURATION =
  const zip = new AdmZip();
  const fileName = props.title ?? bookTitle;
  // const fileName = bookTitle;
  /**
   * -----------------------------------------------------------------------------
   * mimetype
   * -----------------------------------------------------------------------------
   */
  const mimetype = fs.readFileSync(
      path.join(packagePath, 'mimetype'),
      'utf8');
  zip.addFile('mimetype', Buffer.from(mimetype, 'utf8'));

  /**
   * -----------------------------------------------------------------------------
   * META-INF/container.xml
   * Related items: cover, cover-img
   * -----------------------------------------------------------------------------
   */
  const container = fs.readFileSync(
      path.join(packagePath, 'META-INF/container.xml'),
      'utf-8');
  zip.addFile('META-INF/container.xml', Buffer.from(container, 'utf8'));

  /**
   * -----------------------------------------------------------------------------
   * OEBPS/package.opf
   * -----------------------------------------------------------------------------
   */
  let pkgopf = fs.readFileSync(
      path.join(packagePath, 'OEBPS/package.opf'),
      'utf-8');

  const metadata = [];
  const manifest = [];
  const spine = [];

  // required
  metadata.push(`<dc:identifier id="BookId">${props.identifier}</dc:identifier>`);
  metadata.push(`<dc:title>${props.title}</dc:title>`);
  metadata.push(`<dc:language>${props.language}</dc:language>`);
  // Optional
  // Optional
  if (props.contributor) {
    metadata.push(`<dc:contributor>${props.contributor}</dc:contributor>`);
  }
  if (props.creator) {
    metadata.push(`<dc:creator>${props.creator}</dc:creator>`);
  }
  if (props.date) {
    metadata.push(`<dc:date>${props.date}</dc:date>`);
  }
  if (props.subject) {
    metadata.push(`<dc:subject id="subject01">${props.subject}</dc:subject>`);
  }
  if (props.description) {
    metadata.push(`<dc:description>${props.description}</dc:description>`);
  }
  if (props.publisher) {
    metadata.push(`<dc:publisher>${props.publisher}</dc:publisher>`);
  }
  if (props.status) {
    metadata.push(`<meta property="dcterms:modified">${props.updatedAt}</meta>`);
  }

  if (props.cover) {
    manifest.push(`<item href="${props.cover}" id="cover-img"  media-type="image/jpeg" properties="cover-image"/>`);
    // to-do cover path
    let cover = fs.readFileSync(
        path.join(packagePath, 'OEBPS/cover-a.xhtml'),
        'utf-8');
    cover = cover.replace('{{ cover }}', props.cover);
    zip.addFile(`OEBPS/cover.xhtml`, Buffer.from(cover, 'utf8'));
  } else {
    manifest.push(`<item href="images/cover.svg" id="cover-img"  media-type="image/jpeg" properties="cover-image"/>`);
    zip.addLocalFile(
        path.join(packagePath, 'OEBPS/images/cover.svg'),
        'OEBPS/images');
    let cover = fs.readFileSync(
        path.join(packagePath, 'OEBPS/cover-b.xhtml'),
        'utf-8');
    cover = cover.replace('{{ title }}', props.title);
    zip.addFile(`OEBPS/cover.xhtml`, Buffer.from(cover, 'utf8'));
  }
  manifest.push(`<item href="cover.xhtml" id="pg-cover" media-type="application/xhtml+xml" properties="svg"/>`);
  manifest.push(`<item href="intro.xhtml" id="pg-intro" media-type="application/xhtml+xml"/>`);
  manifest.push(`<item href="nav.xhtml" id="pg-toc"  media-type="application/xhtml+xml" properties="nav scripted"/>`);
  manifest.push(`<item href="toc.ncx" id="ncx"  media-type="application/x-dtbncx+xml"/>`);

  for (const i of data) {
    manifest.push(`<item href="pages/pg-${i.rawPosition}.xhtml" id="idx-${i.id}" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="idx-${i.id}"/>`);
  }

  pkgopf = pkgopf.replace('{{ metadata }}', metadata.join('\n    '));
  pkgopf = pkgopf.replace('{{ manifest }}', manifest.join('\n    '));
  pkgopf = pkgopf.replace('{{ spine }}', spine.join('\n    '));

  zip.addFile('OEBPS/package.opf', Buffer.from(pkgopf, 'utf8'));

  /**
   * -----------------------------------------------------------------------------
   * OEBPS/toc.ncx
   * -----------------------------------------------------------------------------
   */
  let tocncx = fs.readFileSync(
      path.join(packagePath, 'OEBPS/toc.ncx'),
      'utf-8');

  const navPoints = [];
  for (const i of data) {
    navPoints.push(`<navPoint>
        <navLabel>
            <text>${i.subtitle}</text>
        </navLabel>
        <content src="pages/pg-${i.rawPosition}.xhtml"/>
    </navPoint>`);
  };

  tocncx = tocncx.replace('{{ identifier }}', props.identifier ?? '-');
  tocncx = tocncx.replace('{{ title }}', props.title ?? '-');
  tocncx = tocncx.replace('{{ creator }}', props.creator ?? '-');
  tocncx = tocncx.replace('{{ navPoint }}', navPoints.join('\n    '));
  zip.addFile('OEBPS/toc.ncx', Buffer.from(tocncx, 'utf8'));

  /**
   * -----------------------------------------------------------------------------
   * OEBPS/nav.xhtml
   * -----------------------------------------------------------------------------
   */
  let nav = fs.readFileSync(
      path.join(packagePath, 'OEBPS/nav.xhtml'),
      'utf-8');
  const navs = [];
  for (const i of data) {
    navs.push(`<li><a href="pages/pg-${i.rawPosition}.xhtml">${i.subtitle}</a></li>`);
  }
  nav = nav.replace('{{ navList }}', navs.join('\n                '));
  zip.addFile('OEBPS/nav.xhtml', Buffer.from(nav, 'utf8'));

  /**
   * -----------------------------------------------------------------------------
   * OEBPS/pages/*
   * -----------------------------------------------------------------------------
   */
  const pageSample = fs.readFileSync(
      path.join(packagePath, 'OEBPS/pages/pg-x.xhtml'),
      'utf-8');
  for (const i of data) {
    let page = pageSample;
    page = page.replaceAll('{{ subtitle }}', i.subtitle);
    page = page.replace('{{ content }}', i.content);
    zip.addFile(`OEBPS/pages/pg-${i.rawPosition}.xhtml`, Buffer.from(page, 'utf8'));
  }

  /**
   * -----------------------------------------------------------------------------
   * OEBPS/intro.xhtml
   * -----------------------------------------------------------------------------
   */
  let intro = fs.readFileSync(
      path.join(packagePath, 'OEBPS/intro.xhtml'),
      'utf-8');
  intro = intro.replace('{{ description }}', props.description);
  zip.addFile(`OEBPS/intro.xhtml`, Buffer.from(intro, 'utf8'));

  // - build file.zip -
  if (isBuffer) {
    // get everything as a buffer
    const willSendthis = zip.toBuffer();
    return willSendthis;
  } else {
    // or write everything to disk
    const output = path.join(outputPath, fileName + fileExtension);
    zip.writeZip(output);
    return 1;
  }
};

generate('halo');
