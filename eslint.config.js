// eslint.config.cjs
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    ignores: ['node_modules/**'],
    // Add your custom rules here
  },
  env: {
    node: true,
    es2021: true,
  },
  // 
];
