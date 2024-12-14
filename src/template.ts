import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as t from "@babel/types";
import * as core from "@babel/core";
//源代码
const code = ``;

//需要修改为：

const MyPlugin = {
  visitor: {},
};

let targetSource = core.transform(code, {
  plugins: [MyPlugin], //使用插件
  compact: false,
  generatorOpts: {
    jsescOption: {
      minimal: true,
    },
  },
});

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
