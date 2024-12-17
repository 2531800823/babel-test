import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as t from "@babel/types";
import * as core from "@babel/core";
import template from "@babel/template";
//源代码
const code = `
import { flatten, concat } from "lodash";
console.log(flatten, concat);
`;

//需要修改为：
/**
import flatten from "lodash/flatten";
import concat from "lodash/concat";
console.log(flatten, concat);

 */

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

// 自定义插件可以外部传入配置
const libraryName = "lodash";

traverse(ast, {
  enter: (path) => {},
  ImportDeclaration(path, state) {
    if (t.isImportDeclaration(path.node)) {
      const { specifiers } = path.node;
      if (path.node.source.value === libraryName && specifiers) {
        const names = [];
        // 遍历 import 有哪些需要引入的变量
        specifiers.forEach((element) => {
          if (t.isImportSpecifier(element)) {
            const imported = element.imported;
            if (t.isIdentifier(imported)) {
              names.push(imported.name);
            }
          }
        });
        // 插入 import
        names.forEach((element) => {
          if (t.isProgram(path.parent)) {
            path.parent.body.unshift(
              template.statement(
                `import ${element} from '${libraryName}/${element}'`
              )()
            );
          }
        });
        path.remove();
        // 删除当前的 import
      }
    }
  },
});

const newCode = generator(ast);
console.log("🚀 liu123 ~ newCode:", newCode.code);

export {};
