import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as t from "@babel/types";
import * as core from "@babel/core";
import { PluginItem } from "@babel/core";
import * as template from "@babel/template";
/**
 *  第一步：先判断源代码中是否引入了logger库
 *  第二步：如果引入了，就找出导入的变量名，后面直接使用该变量名即可
 *  第三步：如果没有引入我们就在源代码的顶部引用一下
 *  第四步：在函数中插入引入的函数
 */
//源代码
const code = `
import logger from "logger1";
import { logger4 } from "logger3";
import * as logeer6 from "logger5";
//四种声明函数的方式
function sum(a, b) {
  return a + b;
}
const multiply = function (a, b) {
  return a * b;
};
const minus = (a, b) => a - b;
const minus2 = (a, b) =>{
return a - b
};
class Calculator {
    divide(a, b) {
      return a / b;
    }
    a=()=>{
    }
    b=c=>c
  }
`;
const MyPlugin: PluginItem = {
  visitor: {
    Program: (path, state) => {
      let loggerId;
      path.traverse({
        ImportDeclaration: (path) => {
          const { node } = path;
          if (t.isImportDeclaration(node)) {
            if (node.source.value === "logger") {
              node.specifiers.some((specifier) => {
                if (specifier.local.name === "logger") {
                  // 取出导入的变量名赋值给loggerId
                  loggerId = specifier.local.name;
                  // 结束查找
                  path.stop();
                }
              });
            }
          }
        },
      });
      // 判断是否查找到
      if (!loggerId) {
        // 创建一个全局 的变量名称
        loggerId = path.scope.generateUid("logger");
        if (t.isProgram(path.node)) {
          // 插入 import 语句
          path.node.body.unshift(
            template.statement(`import ${loggerId} from "logger"`)()
          );
        }
      }

      // 挂在一个节点
      state.myLoggerId = template.statement(`${loggerId}()`)();
    },
    "FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ClassMethod":
      (path, state) => {
        const { node } = path;
        if (
          t.isArrowFunctionExpression(node) &&
          !t.isBlockStatement(node.body)
        ) {
          // 是直接返回
          node.body = t.blockStatement([
            state.myLoggerId,
            t.returnStatement(node.body),
          ]);
        } else {
          // 直接使用上文保存的表达式
          ((node as any).body as t.BlockStatement).body.unshift(
            state.myLoggerId
          );
        }
      },
  },
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

console.log("🚀 liu123 ~ newCode:", targetSource.code);

export {};
