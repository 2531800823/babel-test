import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as core from "@babel/core";

//源代码
const code = `const sum = (a, b) => {
    return a + b;
}`;

//需要修改为：const sum = function (a, b) {
//   return a + b;
// };

// 1. 插件
const newCode = core.transform(code, {
  plugins: [
    {
      visitor: {
        ArrowFunctionExpression: (path) => {
          (path.node as any).type = "FunctionExpression";
        },
      },
    },
  ],
});

// console.log("🚀 liu123 ~ newCode:", newCode.code);

// 2. 流程转换
const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});

traverse(ast, {
  ArrowFunctionExpression: (path) => {
    (path.node as any).type = "FunctionExpression";
  },
});

const newCode2 = generator(ast);
console.log("🚀 liu123 ~ newCode2:", newCode2.code);

export {};
