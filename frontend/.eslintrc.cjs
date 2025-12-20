module.exports = {
parser: "@typescript-eslint/parser",
extends: [
"eslint:recommended",
"plugin:react/recommended",
"plugin:@typescript-eslint/recommended",
"plugin:jsx-a11y/recommended",
"prettier"
],
settings: {
react: {
version: "detect",
},
},
rules: {
"react/react-in-jsx-scope": "off",
},
};