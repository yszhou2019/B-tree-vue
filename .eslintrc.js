module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'space-before-function-paren': 0,
    'no-tabs': 0,
    'indent': 0,
    'no-trailing-spaces': 0,
    'semi': 0,
    'prefer-const': 0,
    'arrow-spacing': 0,
    'lines-between-class-members': 0,
    'quotes': 0,
    'new-cap': 0,
    'brace-style': 0,
    'comma-dangle': 0,
    'eqeqeq': 0,
    'no-useless-return': 0,
    'no-extend-native': 0,
    'no-multi-spaces': 0,
    'no-unused-vars': 0,
    'block-spacing': 0,
    'curly': 0,
  }
}
