const Canvas = require("canvas");
const assert = require("assert").strict;
const fs = require("fs");

function NodeCanvasFactory() {}
NodeCanvasFactory.prototype = {
  create: function NodeCanvasFactory_create(width, height) {
    assert(width > 0 && height > 0, "Invalid canvas size");
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext("2d");
    return {
      canvas,
      context,
    };
  },

  reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
    assert(canvasAndContext.canvas, "Canvas is not specified");
    assert(width > 0 && height > 0, "Invalid canvas size");
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  },

  destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
    assert(canvasAndContext.canvas, "Canvas is not specified");

    // Zeroing the width and height cause Firefox to release graphics
    // resources immediately, which can greatly reduce memory consumption.
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  },
};

const pdfjsLib = require("./build/generic/build/pdf.js");

const opNames = {};
for (let k of Object.keys(pdfjsLib.OPS)){
  opNames[parseInt(pdfjsLib.OPS[k])] = k;
}
//console.log("opNames = ", opNames);


// Some PDFs need external cmaps.
const CMAP_URL = "./build/generic/web/cmaps/";
const CMAP_PACKED = true;

// Where the standard fonts are located.
const STANDARD_FONT_DATA_URL = "./build/generic/web/standard_fonts/";

const canvasFactory = new NodeCanvasFactory();

// Loading file from file system into typed array.
const pdfPath = process.argv[2] || "./build/generic/web/compressed.tracemonkey-pldi-09.pdf";

const data = new Uint8Array(fs.readFileSync(pdfPath));

// Load the PDF file.
const loadingTask = pdfjsLib.getDocument({
  data,
  cMapUrl: CMAP_URL,
  cMapPacked: CMAP_PACKED,
  standardFontDataUrl: STANDARD_FONT_DATA_URL,
  canvasFactory,
});

(async function () {
  try {
    const pdfDocument = await loadingTask.promise;
    console.log("# PDF document loaded.");
    // Get the first page.
    const page = await pdfDocument.getPage(1);

    /*
    let objs = page.objs.all;
    let commonObjs = page.commonObjs.all;
    console.log("objs = ", Object.keys(objs));
    console.log("commonObjs = ", Object.keys(commonObjs));
    */
    //const opList = await page.getOperatorList();
    //console.log("opList = ", opList);
/*
    for (let i = 0; i < opList.fnArray.length; i++){
      //console.log("opList = ", opNames[opList.fnArray[i]]);
      if (opNames[opList.fnArray[i]] == "showText"){
        for (let args of opList.argsArray[i]){
          for (let k=0; k<opList.argsArray[i].length; k++){
            for (let n=0; n<opList.argsArray[i][k].length; n++){
              const arg = opList.argsArray[i][k][n];
              if (arg.fontChar){
                // console.log("arg = ", arg.fontChar, arg.unicode, arg.fontChar.charCodeAt(0));
              }
              
            }
          }
        }
      }
      //console.log("opList.fnArray = ", opList.argsArray[i]);
    }

    //console.log("opList.arg = ", opList.argsArray[4]);
    const T = opList.argsArray[4][0][0];
    const r = opList.argsArray[4][0][2];
*/
    /*
    T.originalCharCode = r.originalCharCode;
    T.fontChar = r.fontChar;
    T.unicode = r.unicode;
    T.accent = r.accent;
    T.vmetric = r.vmetric;
    T.operatorListId = r.operatorListId;
    T.isSpace = r.isSpace;
    T.isInFont = r.isInFont;

    console.log("T = ", opList.argsArray[4][0][0]);
    console.log("r = ", opList.argsArray[4][0][2]);

    */
    // Render the page on a Node canvas with 100% scale.
    const viewport = page.getViewport({ scale: 1.0 });
    const canvasAndContext = canvasFactory.create(
      viewport.width,
      viewport.height
    );
    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport,
      opFilter:(opList) => {
        for (let i = 0; i < opList.fnArray.length; i++){
          // console.log("opList = ", opNames[opList.fnArray[i]]);
          if (opNames[opList.fnArray[i]] == "showText"){
            for (let args of opList.argsArray[i]){
              for (let k=0; k<opList.argsArray[i].length; k++){
                for (let n=0; n<opList.argsArray[i][k].length; n++){
                  const arg = opList.argsArray[i][k][n];
                  if (arg.fontChar){
                    console.log("arg = ", arg.fontChar, arg.unicode, arg.fontChar.charCodeAt(0));
                    if (arg.fontChar.charCodeAt(0) == 57428) arg.fontChar = String.fromCharCode(57458);
                  }
                }
              }
            }
          }
        }
      }
    };

    const renderTask = page.render(renderContext);
    await renderTask.promise;
    // Convert the canvas to an image buffer.
    const image = canvasAndContext.canvas.toBuffer();
    fs.writeFile("output.png", image, function (error) {
      if (error) {
        console.error("Error: " + error);
      } else {
        console.log(
          "Finished converting first page of PDF file to a PNG image."
        );
      }
    });
    // Release page resources.


    let objs = page.objs.all;
    let commonObjs = page.commonObjs.all;
    //console.log("objs = ", Object.keys(objs));
    //console.log("commonObjs = ", Object.keys(commonObjs));

    page.cleanup();
  } catch (reason) {
    console.log(reason);
  }
})();
