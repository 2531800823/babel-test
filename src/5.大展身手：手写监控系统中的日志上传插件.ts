import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as t from "@babel/types";

/**
 *  第一步：先判断源代码中是否引入了logger库
 *  第二步：如果引入了，就找出导入的变量名，后面直接使用该变量名即可
 *  第三步：如果没有引入我们就在源代码的顶部引用一下
 *  第四步：在函数中插入引入的函数
 */
//源代码
const code = `
import logger2 from "logger1";
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

//需要修改为：
/** import loggerLib from "logger"

function sum(a, b) {
  loggerLib()
  return a + b;
}
const multiply = function (a, b) {
  loggerLib()
  return a * b;
};
const minus = (a, b) =>{
  loggerLib()
  return  a - b;
}
class Calculator {
  divide(a, b) {
    loggerLib()
    return a / b;
  }
} */

const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});

let isImportDeclaration = false;

traverse(ast, {
  enter: (path) => {},
  //   import 语句
  ImportDeclaration: (path) => {
    const { node } = path;
    if (t.isImportDeclaration(node)) {
      if (node.source.value === "logger") {
        isImportDeclaration = node.specifiers.some((specifier) => {
          return specifier.local.name === "logger";
        });
      }
    }
  },
  //   默认函数
  FunctionDeclaration: (path) => {
    const { node } = path;
    if (t.isFunctionDeclaration(path.node)) {
      node.body.body.unshift(
        t.expressionStatement(t.callExpression(t.identifier("logger"), []))
      );
    }
  },
  //   函数表达式，函数赋值
  FunctionExpression: (path) => {
    const { node } = path;
    if (t.isFunctionExpression(node)) {
      node.body.body.unshift(
        t.expressionStatement(t.callExpression(t.identifier("logger"), []))
      );
    }
  },
  //   箭头函数
  ArrowFunctionExpression: (path) => {
    const { node } = path;
    if (t.isArrowFunctionExpression(node)) {
      // 不是直接返回
      if (t.isBlockStatement(node.body)) {
        node.body.body.unshift(
          t.expressionStatement(t.callExpression(t.identifier("logger"), []))
        );
      } else {
        // 是直接返回
        node.body = t.blockStatement([
          t.expressionStatement(t.callExpression(t.identifier("logger"), [])),
          t.returnStatement(node.body),
        ]);
      }
    }
  },
  // 类中的函数属性
  ClassMethod: (path) => {
    const { node } = path;
    if (t.isClassMethod(node)) {
      node.body.body.unshift(
        t.expressionStatement(t.callExpression(t.identifier("logger"), []))
      );
    }
  },
  "FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ClassMethod":
    (path) => {
      console.log(path.node);
    },
});

if (!isImportDeclaration) {
  // 添加一个 import {} form ''
  ast.program.body.unshift(
    t.importDeclaration(
      [t.importSpecifier(t.identifier("logger"), t.identifier("logger"))],
      t.stringLiteral("logger")
    )
  );
  //   添加一个 默认导入的
  ast.program.body.unshift(
    t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier("logger"))],
      t.stringLiteral("logger")
    )
  );
  // 处理

  console.log("没有 import");
}

const newCode = generator(ast);
console.log("🚀 liu123 ~ newCode:", newCode.code);

export {};
