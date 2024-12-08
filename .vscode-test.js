const { defineConfig } = require("@vscode/test-cli");

module.exports = defineConfig([
  {
    label: "integration",
    files: "out/test/integration/**/*.test.js",
  },
  {
    label: "unit",
    files: "out/test/unit/**/*.test.js",
  },
]);
