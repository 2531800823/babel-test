import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as t from "@babel/types";
import * as core from "@babel/core";
import { basename } from "path";
import git from "simple-git";
//源代码
const code = `console.log("hello world")`;

async function getGitInfo() {
  try {
    const log = await git().log();
    log.all.forEach((commit) => {
      console.log(`Author: ${commit.author_name}`);
      console.log(`Email: ${commit.author_email}`);
      console.log(`Message: ${commit.message}`);
      console.log("---");
    });
  } catch (error) {
    console.error("Error fetching git info:", error);
  }
}

getGitInfo();

const logPlugin = {
  visitor: {
    MemberExpression: (path, state) => {
      const { node, parent } = path;
      if (t.isIdentifier(node.object) && t.isIdentifier(node.property)) {
        if (node.object.name === "console" && node.property.name === "log") {
          // 在这里添加你的转换逻辑
          if (t.isCallExpression(parent)) {
            const { line } = node.loc.start;
            const filename = basename(state.file.opts.filename);
            parent.arguments.unshift(t.stringLiteral(`${filename}:${line}`));
          }
        }
      }
    },
  },
};

let targetSource = core.transform(code, {
  plugins: [logPlugin], //使用插件
  filename: "hello.js", //模拟环境
});

// const newCode = generator(ast);
console.log("🚀 liu123 ~ newCode:", targetSource.code);

export {};
