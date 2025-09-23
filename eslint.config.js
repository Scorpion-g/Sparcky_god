// eslint.config.js
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        // Node.js global variables
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "readonly",
        require: "readonly",
        module: "readonly",
        Buffer: "readonly",
        global: "readonly",
        // Add more Node.js globals as needed
      },
    },
    ignores: ['node_modules/**'],
    rules: {
      // Your custom rules
    },
  },
];
