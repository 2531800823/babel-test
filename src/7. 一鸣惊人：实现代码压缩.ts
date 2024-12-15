import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as t from "@babel/types";
import * as core from "@babel/core";
//源代码
const code = `function scopeOnce() {
    var ref = "This is a binding";
  
    ref; // 这里是该作用域下的一个引用
  
    function scopeTwo() {
      ref; // 这里是上级作用域下的一个引用
    }
  }
  `;

//需要修改为：

const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});

traverse(ast, {
  enter: (path) => {},
  //这是一个别名，用于捕获所有作用域节点：函数、类的函数、函数表达式、语句快、if else 、while、for
  Scopable: (path, state) => {
    Object.entries(path.scope.bindings).forEach(([key, binding]) => {
      const newName = path.scope.generateUid("a"); //在当前作用域内生成一个新的uid，并且不会和任何本地定义的变量冲突的标识符
      binding.path.scope.rename(key, newName); //进行🐛命名
    });
  },
});

const newCode = generator(ast);
console.log("🚀 liu123 ~ newCode:", newCode.code);

export {};
