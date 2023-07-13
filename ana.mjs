/* eslint-disable sort-imports */
import fs from "fs";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
const traverse = _traverse.default;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = resolve(__dirname, "src");

function readAllFiles(dir) {
  const names = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      const subNames = readAllFiles(dir + "/" + file.name);
      for (let n of subNames) names.push(n);
    } else {
      names.push(dir + "/" + file.name);
    }
  }

  return names;
}

const ana = filePath => {
  const deps = {};
  const code = fs.readFileSync(filePath).toString();
  const ast = parse(code, { sourceType: "module" });
  traverse(ast, {
    enter: p => {
      if (p.node.type === "ImportDeclaration") {
        const symbols = p.node.specifiers.map(
          specifier => specifier.imported.name || ""
        );
        deps[p.node.source.value] = symbols;
      }
    },
  });
  return deps;
};

const data = {};
let files = readAllFiles("./src");
files = files.filter(f => f.endsWith(".js"));
files = files.filter(f => !["./src/pdf.sandbox.js"].includes(f));
for (const file of files) {
  data[file] = ana(file);
}

fs.writeFileSync("./ana.json", JSON.stringify(data, null, 2));

