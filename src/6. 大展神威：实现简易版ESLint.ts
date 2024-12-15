import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as t from "@babel/types";
import * as core from "@babel/core";
//源代码 有 log 就报错
const code = `var a = 1;
console.log(a);
var b = 2;
`;

//需要修改为：

const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});

const MyPlugin = ({ fix }: { fix: boolean }): core.PluginItem => {
  let errors = [];
  return {
    pre: (file) => {
      // file.ast;
      // file.metadata.set("errors", []);
      // (file as any).set("errors", []);
      // 初始化，或者挂在在 file 上，这里使用的是全局变量处理
      errors = [];
    },
    post: (file) => {
      // console.log(...file.get("errors"));
      console.log(...errors);
    },
    visitor: {
      CallExpression: (path, state) => {
        const { node } = path;
        if (t.isCallExpression(node)) {
          if (t.isMemberExpression(node.callee)) {
            if (
              t.isIdentifier(node.callee.object) &&
              node.callee.object.name === "console" &&
              t.isIdentifier(node.callee.property) &&
              node.callee.property.name === "log"
            ) {
              // 如果是 修复就直接删除
              if (fix) {
                path.parentPath.remove();
                return;
              }
              errors.push(
                path.buildCodeFrameError(`代码中不能出现console语句`, Error) //抛出一个语法错误
              );
            }
          }
        }
      },
    },
  };
};

let targetSource = core.transform(code, {
  plugins: [MyPlugin({ fix: true })], //使用插件
});

console.log("🚀 liu123 ~ newCode:", targetSource.code);

export {};
