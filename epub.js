const fs = require('node:fs');
// ================= MODULE =================
const AdmZip = require('adm-zip');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const zip = new AdmZip();

// =============== CONFIGURATION ===============
const fileName = "sample.epub";
const outputPath = ''
const output = outputPath + fileName;

// =================== EPUB ==================
const properties= {
    identifier: 'book-ku',
    title: 'The book title',
    creator: 'the book author',
    language: 'en',
    modified: 'YYYY-MM-DD',
    description:'This is a description',
}

const data = [
    {
        id: '1',
        position: '1',
        subtitle: 'Title 1',
        content: 'Content 1',
    },
    {
        id: '2',
        position: '2',
        subtitle: 'Title 2',
        content: 'Content 2',
    },
    {
        id: '3',
        position: '3',
        subtitle: 'Title 3',
        content: 'Content 3',
    },
];

// -------------- mimetype ------------------

const mimetype = fs.readFileSync('template/mimetype', 'utf8');
zip.addFile("mimetype", Buffer.from(mimetype, "utf8"));

// ------------------ container.xml -------------------

const container = fs.readFileSync('template/META-INF/container.xml', 'utf-8');
zip.addFile("META-INF/container.xml", Buffer.from(container, "utf8"));

// ----------------- package.opf ----------------------
let pkg = fs.readFileSync('template/OEBPS/package.opf', 'utf-8');
const items = []
const itemrefs = [];
for (const i of data) {
items.push(`    <item href="pages/pg-${i.position}.xhtml" id="idx-${i.id}" media-type="application/xhtml+xml"/>`);
itemrefs.push(`    <itemref idref="idx-${i.id}"/>`)
}

pkg = pkg.replace('{{ items }}', items.join('\n'));
pkg = pkg.replace('{{ itemrefs }}', itemrefs.join('\n'));

pkg = pkg.replace('{{ identifier }}', properties.identifier);
pkg = pkg.replace('{{ title }}', properties.title);
pkg = pkg.replace('{{ creator }}', properties.creator);
pkg = pkg.replace('{{ language }}', properties.language);
pkg = pkg.replace('{{ modified }}', properties.modified);
pkg = pkg.replace('{{ description }}', properties.description);

zip.addFile("OEBPS/package.opf", Buffer.from(pkg, "utf8"));
    
// ----------------- toc.ncx ----------------------
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
zip.addFile("OEBPS/toc.ncx", Buffer.from(toc, "utf8"));

// ----------------- nav.xhtml ----------------------
let nav = fs.readFileSync('template/OEBPS/nav.xhtml', 'utf-8');
const navs = [];
for (const i of data) {
navs.push(`<li><a href="pages/pg-${i.position}.xhtml">${i.subtitle}</a></li>`);
}
nav = nav.replace('{{ navList }}', navs.join('\n'));
zip.addFile("OEBPS/nav.xhtml", Buffer.from(nav, "utf8"));

// ============================== pages ===============================
for (const i of data) {
    let page = fs.readFileSync('template/OEBPS/pages/pg-x.xhtml', 'utf-8');
    page = page.replaceAll('{{ subtitle }}', i.subtitle);
    page = page.replaceAll('{{ position }}', i.position);
    page = page.replace('{{ content }}', i.content);
    
    zip.addFile(`OEBPS/pages/pg-${i.position}.xhtml`, Buffer.from(page, "utf8"));    
}

// ============================== cover ===============================
zip.addLocalFile('template/OEBPS/cover.xhtml', 'OEBPS');
zip.addLocalFile('template/OEBPS/images/cover.jpeg', 'OEBPS/images');

// ============================== introduction ===============================
let intro = fs.readFileSync('template/OEBPS/intro.xhtml', 'utf-8');
intro = intro.replace('{{ description }}', properties.description)
zip.addFile(`OEBPS/intro.xhtml`, Buffer.from(intro, "utf8"));    

// // ====================build file.zip=======================
// // get everything as a buffer
// // const willSendthis = zip.toBuffer();
// // or write everything to disk
zip.writeZip(output);



