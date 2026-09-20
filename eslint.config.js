import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/**", "coverage/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
      },
    },
  },
  {
    files: ["src/cli/**/*.js"],
    rules: {
      "no-console": "off",
    },
  },
];
