// eslint.config.js
const js = require('@eslint/js');

module.exports = {
  ...js.configs.recommended,
  ignores: ['node_modules/**'],
  env: {
    node: true,
    es2021: true,
  },
  // Add your custom rules here
};
