"use strict";

const path = require("path");
const OS = require("os");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
    messages: { // https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/0450e4c8c3251b8149cfe1af6ba5d56ebf8c0e69/docs/rules/prefer-message-ids.md
      shouldBeRelativeId:
        "В рамках одного слайса все пути должны быть относительными",
    },
  },

  create(context) {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      // visitor functions for different types of nodes
      ImportDeclaration(node) {
        // example app/entities/Article
        const importTo = node.source.value;

        // example /home/user/Projects/LESSONS/production-project/src/app/entities/Article
        const fromFilename = context.filename;

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report({
            node,
            messageId: "shouldBeRelativeId",
          });
        }
      },
    };
  },
};

// хелпер проверки того, что путь является относительным
function isPathRelative(path) {
  return path === "." || path.startsWith("./") || path.startsWith("../");
}

// хелпер нормализации путей для разных ОС
function normalizePath(execPath) {
  if (!execPath) {
    return execPath;
  }

  const splitter =
    OS.type() === "Windows_NT" || execPath.includes("\\") ? "\\" : "/";
  const normalizedPath = path.normalize(execPath);
  const nameSpacedPath = normalizedPath.split(splitter);

  return nameSpacedPath.join("/"); // "/" - сделаем универсальный сепаратор для всех систем
}

// FSD layers
const layers = {
  entities: "entities",
  features: "features",
  shared: "shared",
  pages: "pages",
  widgets: "widgets",
};

// пути должны быть относительными в рамках одного модуля
function shouldBeRelative(from, to) {
  if (isPathRelative(to)) {
    return false;
  }

  // работаем с to ("import ..." в проекте)

  // example entities/Article
  const toArray = to.split("/");
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // Article

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  // работаем с from (путем файла в ОС)

  const normalizedPath = normalizePath(from); // нормализуем путь файла к общему (для всех систем) виду
  const projectFrom = normalizedPath.split("src")[1] || ""; // \entities\Article
  const fromArray = projectFrom.split("/"); // [ '', 'entities', 'Article' ]

  const fromLayer = fromArray[1]; // entities
  const fromSlice = fromArray[2]; // Article

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}

// console.log(
//   shouldBeRelative(
//     "C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article",
//     "entities/Article/fasfasfas"
//   )
// );
// console.log(
//   shouldBeRelative(
//     "C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article",
//     "entities/ASdasd/fasfasfas"
//   )
// );
// console.log(
//   shouldBeRelative(
//     "C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article",
//     "features/Article/fasfasfas"
//   )
// );
// console.log(
//   shouldBeRelative(
//     "C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\features\\Article",
//     "features/Article/fasfasfas"
//   )
// );
// console.log(
//   shouldBeRelative(
//     "C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article",
//     "app/index.tsx"
//   )
// );
// console.log(
//   shouldBeRelative(
//     "C:/Users/tim/Desktop/javascript/GOOD_COURSE_test/src/entities/Article",
//     "entities/Article/asfasf/asfasf"
//   )
// );
// console.log(
//   shouldBeRelative(
//     "C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article",
//     "../../model/selectors/getSidebarItems"
//   )
// );
