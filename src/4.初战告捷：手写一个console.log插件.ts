import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import * as t from "@babel/types";
import * as core from "@babel/core";
import { basename } from "path";
import git from "simple-git";
//源代码
const code = `console.log("hello world")`;

let author;
let email;

async function getGitInfo() {
  return new Promise<void>(async (resolve) => {
    const log = await git().log();
    log.all.forEach((commit) => {
      console.log(`Author: ${commit.author_name}`);
      author = commit.author_name;
      email = commit.author_email;
      console.log(`Email: ${commit.author_email}`);
      console.log("---");
    });
    resolve();
  });
}

getGitInfo().then(() => {
  const logPlugin = {
    visitor: {
      MemberExpression: (path, state) => {
        const { node, parent } = path;
        if (t.isIdentifier(node.object) && t.isIdentifier(node.property)) {
          if (
            node.object.name === "console" &&
            ["log", "warn", "info", "error"].includes(node.property.name)
          ) {
            // 在这里添加你的转换逻辑
            if (t.isCallExpression(parent)) {
              const { line } = node.loc.start;
              const filename = basename(state.file.opts.filename);
              parent.arguments.unshift(
                t.stringLiteral(`${filename}:${line}`),
                t.stringLiteral(`${author}:${email}`)
              );
            }
          }
        }
      },
    },
  };

  let targetSource = core.transform(code, {
    plugins: [logPlugin], //使用插件
    filename: "hello.js", //模拟环境
    compact: false,
    generatorOpts: {
      jsescOption: {
        minimal: true,
      },
    },
  });

  // const newCode = generator(ast);
  console.log("🚀 liu123 ~ newCode:", targetSource.code);
});

export {};
