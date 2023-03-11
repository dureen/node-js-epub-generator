const fs = require('node:fs');
// =================ZIP======================
const AdmZip = require('adm-zip');
const zip = new AdmZip();

const fileTitle = "sample.epub";
const mimetype = fs.readFileSync('sample/mimetype', 'utf8');
zip.addFile("mimetype", Buffer.from(mimetype, "utf8"));

const container = fs.readFileSync('sample/META-INF/container.xml', 'utf-8');
zip.addFile("META-INF/container.xml", Buffer.from(container, "utf8"));

// // const package = fs.readFileSync('template/OEBPS/package.opf', 'utf-8');
// // zip.addFile("OEBPS/package.opf", Buffer.from(package, "utf8"));

zip.addLocalFolder('sample/OEBPS','OEBPS');
// zip.addLocalFile('sample/content.opf');
// zip.addLocalFile('sample/cover.jpeg');
// zip.addLocalFile('sample/titlepage.xhtml');
// zip.addLocalFile('sample/toc.ncx');
// zip.addLocalFile('sample/toc.xhtml');




// Test
const output = fileTitle;
// get everything as a buffer
// const willSendthis = zip.toBuffer();
// or write everything to disk
zip.writeZip(output);



