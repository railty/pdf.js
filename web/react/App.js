import { useEffect, useRef } from 'react';
import { getDocument, GlobalWorkerOptions } from "../../build/generic/build/pdf.js";

GlobalWorkerOptions.workerSrc = '/web/react/dist/pdf.worker.js';

var pdfData = atob(
  'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog' +
  'IC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAv' +
  'TWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0K' +
  'Pj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAg' +
  'L1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+' +
  'PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9u' +
  'dAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2Jq' +
  'Cgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJU' +
  'CjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVu' +
  'ZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4g' +
  'CjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAw' +
  'MDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9v' +
  'dCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G');




const App = () => {
  const refCanvas = useRef();
  let pdf = null

  const load = async()=>{
    var loadingTask = getDocument({ data: pdfData, });
    pdf = await loadingTask.promise;
    console.log(pdf);

    var page = await pdf.getPage(1);
    var scale = 1.5;
    var viewport = page.getViewport({ scale: scale, });
    var outputScale = window.devicePixelRatio || 1;

    var context = refCanvas.current.getContext('2d');

    refCanvas.current.width = Math.floor(viewport.width * outputScale);
    refCanvas.current.height = Math.floor(viewport.height * outputScale);
    refCanvas.current.style = {
      width: Math.floor(viewport.width) + "px",
      height: Math.floor(viewport.height) + "px",
    };

    var transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    var renderContext = {
      canvasContext: context,
      transform,
      viewport,
    };
    page.render(renderContext);

  }

  useEffect(() => {
    /*
    load();

    return () => { 
      if (pdf) {
        pdf.destroy();
        pdf = null;
      }
    }
    */
  }, []);

  return (
    <div>
      <canvas 
        ref={refCanvas} 
        style={{border: "1px solid black"}}
      ></canvas>
      <div>222111App</div>
      <button onClick={load}>load</button>
    </div>
  )
}

export default App;