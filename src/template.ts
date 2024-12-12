import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";

//源代码
const code = ``;

//需要修改为：

const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});

traverse(ast, {
  enter: (path) => {},
});

const newCode = generator(ast);
console.log("🚀 liu123 ~ newCode:", newCode.code);

export {};
