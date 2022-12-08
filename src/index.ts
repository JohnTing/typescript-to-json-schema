import { resolve } from "path";
import { ts } from "ts-json-schema-generator";

import * as TJS from "typescript-json-schema";

// optionally pass argument to schema generator
const settings: TJS.PartialArgs = {
  required: true,
};

// optionally pass ts compiler options
const compilerOptions: TJS.CompilerOptions = {
  strictNullChecks: true,
};


function getProgramForText(text: string) {
  const dummyFilePath = "/file.ts";
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

const program = getProgramForText("type Atype = {name:string}");

// We can either get the schema for one file and one type...
const schema = TJS.generateSchema(program, "Atype", settings);
console.log(schema);
// ... or a generator that lets us incrementally get more schemas
/*
const generator = TJS.buildGenerator(program, settings);
if (generator) {
  // generator can be also reused to speed up generating the schema if usecase allows:
  const schemaWithReusedGenerator = TJS.generateSchema(program, "MyType", settings, [], generator);

  
  // all symbols
  const symbols = generator.getUserSymbols();

  // Get symbols for different types from generator.
  generator.getSchemaForSymbol("MyType");
  generator.getSchemaForSymbol("AnotherType");

  

  console.log(generator.getSchemaForSymbol("a").$schema);
} else {
  console.log("no generator");
}
*/
