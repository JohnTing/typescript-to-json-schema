
import * as TJS from "typescript-json-schema";
import ts from "typescript"

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
    writeFile: () => { }
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
  }
  return result;
}

const inputText = document.getElementById("inputText") as HTMLTextAreaElement
const outputText = document.getElementById("outputText") as HTMLTextAreaElement

inputText.oninput = (event) => {
  const result = text2JsonSchema(inputText.value + "");
  outputText.textContent = result.map(v =>  JSON.stringify(v, null, "    ")).join("\n");
};

inputText.textContent = "type Person = {\n  name:string,\n  age:number\n}";
const result = text2JsonSchema(inputText.value + "");
outputText.textContent = result.map(v =>  JSON.stringify(v, null, "    ")).join("\n");
