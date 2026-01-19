module.exports = {
  root: true,

  env: {
    es6: true,
    node: true,
  },

  parser: "@typescript-eslint/parser",

  parserOptions: {
    project: ["./tsconfig.json", "./tsconfig.dev.json"],
    sourceType: "script",
  },

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],

  plugins: ["@typescript-eslint", "import"],

  ignorePatterns: ["lib/**/*", "generated/**/*", "node_modules/"],

  rules: {
    quotes: ["error", "double"],
    indent: ["error", 2],

    "import/no-unresolved": "off",

    // Backend-friendly rules
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],
  },
};
