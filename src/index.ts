import * as ts from "typescript-json-schema/node_modules/typescript";
import * as TJS from "typescript-json-schema";


import {EditorView, basicSetup} from "codemirror"
import {javascript, typescriptLanguage} from "@codemirror/lang-javascript"

const editorUpdate = EditorView.updateListener.of(function(e) {
  if(e.docChanged) {
    onchange(e.state.doc.toJSON().join("\n"));
  }
});

let editor = new EditorView({
  doc:"\n\n\n\n\n\n\n\n\n\n\n\n",
  extensions: [basicSetup, javascript({typescript:true}), editorUpdate],
  parent: document.getElementById("inputBox") as HTMLElement, 
})


let outputEditor = new EditorView({
  extensions: [basicSetup, javascript({typescript:true})],
  parent: document.getElementById("outputBox") as HTMLElement, 
  
})

function getProgramForText(text: string) {
  const dummyFilePath = "/Dummy.ts";
  const textAst = ts.createSourceFile(dummyFilePath, text, ts.ScriptTarget.Latest);

  const options: ts.CompilerOptions = {
    target:ts.ScriptTarget.ES2016, 
    module:ts.ModuleKind.CommonJS, 
  };
  const host: ts.CompilerHost = {
    fileExists: filePath => filePath === dummyFilePath,
    directoryExists: dirPath => dirPath === "/",
    getCurrentDirectory: () => "/",
    getDirectories: () => [],
    getCanonicalFileName: fileName => fileName,
    getNewLine: () => "\n",
    getDefaultLibFileName: () => "",
    getSourceFile: filePath => filePath === dummyFilePath ? textAst : undefined,
    readFile: filePath => filePath === dummyFilePath ? text : undefined,
    useCaseSensitiveFileNames: () => true,
    writeFile: () => { }, 
  };
  const program = ts.createProgram({
    options,
    rootNames: [dummyFilePath],
    host
  });

  return program;
}

function text2JsonSchema(text: string) {
  const program = getProgramForText(text);
  const settings: TJS.PartialArgs = {
    required: true,
    ignoreErrors:true
  };

  // We can either get the schema for one file and one type...

  const generator = TJS.buildGenerator(program, settings);
  let result = [] as TJS.Definition[];
  if(generator) {
    generator.getSymbols().forEach(value => {
      result.push(generator.getSchemaForSymbol(value.name));
    });
  } else {
    alert("buildGenerator fail");
    console.error("buildGenerator fail");
  }
  
  return result;
}

function onchange(text: string) {
  const result = text2JsonSchema(text + "");
  console.log(result);
  const newtext = result.map(v => JSON.stringify(v, null, "    ")).join("\n");
  outputEditor.dispatch({changes: {from:0, to: outputEditor.state.doc.toString().length, insert: newtext}});
}

editor.dispatch({
  changes: {from: 0, insert: "type Person = {\n  name:string,\n  age:number\n}"}
})

