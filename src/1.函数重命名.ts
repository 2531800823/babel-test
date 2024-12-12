import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
//源代码
const code = `const hello = () => {};
  `;
//需要修改为：
// const world = () => {};

const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});

traverse(ast, {
  enter: (path) => {
    console.log(path.node.type);
  },
  VariableDeclarator: (path) => {
    if (path.node.id.type === "Identifier") {
      if (
        path.node.id.name === "hello" &&
        path.node.init.type === "ArrowFunctionExpression"
      ) {
        path.node.id.name = "world";
      }
    }
  },
});

const newCode = generator(ast);
console.log("🚀 liu123 ~ newCode:", newCode.code);

export {};
