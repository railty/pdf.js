const pdfjsLib = require("./build/generic/build/pdf.js");

const pdfPath = process.argv[2] || "./build/generic/web/compressed.tracemonkey-pldi-09.pdf";

const getInfo = async ()=>{
  const doc = await pdfjsLib.getDocument(pdfPath).promise;
  const numPages = doc.numPages;
  console.log("# Document Loaded");
  console.log("Number of Pages: " + numPages);
  console.log();

  const data = await doc.getMetadata();
  console.log("# Metadata Is Loaded");
  console.log("## Info");
  console.log(JSON.stringify(data.info, null, 2));
  console.log();

  if (data.metadata) {
    console.log("## Metadata");
    console.log(JSON.stringify(data.metadata.getAll(), null, 2));
    console.log();
  }

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    console.log("# Page " + pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    console.log("Size: " + viewport.width + "x" + viewport.height);
    console.log();

    const  content = await page.getTextContent()
    const strings = content.items.map(function (item) {
      return item.str;
    });
    console.log("## Text Content");
    console.log(strings.join(" "));
    // Release page resources.
    page.cleanup();
  }

}

getInfo();

