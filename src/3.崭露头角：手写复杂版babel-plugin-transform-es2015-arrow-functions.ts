import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as t from "@babel/types";

//源代码
const code = `
var bob = {
  _name: "Bob",
  _friends: ["Sally", "Tom"],
  printFriends() {
    this._friends.forEach(f =>
      console.log(this._name + " knows " + f));
  }
};
console.log(bob.printFriends());
`;

//需要修改为：

const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});

traverse(ast, {
  enter: (path) => {},
  ArrowFunctionExpression: (path) => {
    const { node } = path;

    //   更改 this 为父级的 this
    //   1. 找到第一个不是箭头函数的父级
    //   2. 创建 _this
    //   3. 替换 this 为 _this
    let parent = path.findParent((p) => {
      return p.isFunction() && !p.isArrowFunctionExpression();
    });
    if (parent) {
      parent.scope.push({
        id: t.identifier("_this"),
        init: t.thisExpression(),
      });

      path.traverse({
        ThisExpression: (p) => {
          p.replaceWith(t.identifier("_this"));
        },
      });
    }
    (node as any).type = "FunctionExpression";
    if (!t.isBlockStatement(node.body)) {
      // 不是块语句，证明是 => xxx 直接返回的，所有使用 returnStatement 创建一个 return 语句
      node.body = t.blockStatement([t.returnStatement(node.body)]);
    }
  },
});

const newCode = generator(ast);
console.log("🚀 liu123 ~ newCode:", newCode.code);

export {};
