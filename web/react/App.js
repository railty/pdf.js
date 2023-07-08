import './app.css';

import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, OPS } from "../../build/generic/build/pdf.js";

GlobalWorkerOptions.workerSrc = '/web/react/dist/pdf.worker.js';

const opNames = {};
for (let k of Object.keys(OPS)){
  opNames[parseInt(OPS[k])] = k;
}

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
  const [ops, setOps] = useState([]);
  const [page, setPage] = useState();

  let pdf = null

  const getText = async()=>{
    const texts = await page.getTextContent();
    console.log("texts = ", texts);
  }

  const getTree = async()=>{
    const tree = await page.getStructTree();
    console.log("tree = ", tree);
  }

  const getOperators = async()=>{
    const opList = await page.getOperatorList();
    console.log("opList = ", opList);
    let ops = opList.fnArray.map((fn, i)=>{
      return {
        fn: fn,
        fnName: opNames[fn],
        args: opList.argsArray[i]
      }
    });

    ops = ops.map((op)=>{
      if (op.fnName=="showText") {
        console.log(op.args);
        op.args = (
          <table>
            <tbody>
              {op.args[0].map((arg, i)=>(
                <tr key={i}>
                  <td>{JSON.stringify(arg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      return op;
    })
    setOps(ops);
    
  }

  const load = async()=>{
    var loadingTask = getDocument({ data: pdfData, });
    pdf = await loadingTask.promise;
    console.log(pdf);

    const page = await pdf.getPage(1);
    setPage(page);

    var scale = 1.5;
    var viewport = page.getViewport({ scale: scale, });
    var outputScale = window.devicePixelRatio || 1;

    var context = refCanvas.current.getContext('2d');

    refCanvas.current.width = Math.floor(viewport.width * outputScale);
    refCanvas.current.height = Math.floor(viewport.height * outputScale);
    //refCanvas.current.style = `width:${Math.floor(viewport.width)}px height:${Math.floor(viewport.height)}px`;
    //refCanvas.current.style = "1px solid black;";

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
      <h1 className='bg-red-200'>App</h1>
      <canvas 
        ref={refCanvas} 
        style={{border: "1px solid black"}}
      ></canvas>
      
      <button className="btn btn-primary m-5" onClick={load}>load</button>
      <button className="btn btn-primary m-5" onClick={getOperators}>Operators</button>
      <button className="btn btn-primary m-5" onClick={getText}>Text</button>
      <button className="btn btn-primary m-5" onClick={getTree}>Tree</button>
      <div className="overflow-x-auto">
        <table className="table table-xs table-zebra">
          <thead>
            <tr>
              <th>fn</th>
              <th>fnName</th>
              <th>args</th>
            </tr>
          </thead>
          <tbody>
            {ops.map((op, i)=>(
              <tr key={i}>
                <td>{op.fn}</td>
                <td>{op.fnName}</td>
                <td>{op.fnName=="showText" ? op.args : JSON.stringify(op.args)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App;