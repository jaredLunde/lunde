// Credit: Kent C. Dodds
// https://github.com/kentcdodds/eslint-config-kentcdodds
const findPkgJson = require("find-package-json");

let hasJestDom = false;
let hasTestingLibrary = false;

try {
  const pkg = findPkgJson(process.cwd()).next().value;
  const allDeps = Object.keys({
    ...pkg.peerDependencies,
    ...pkg.devDependencies,
    ...pkg.dependencies,
  });
  hasJestDom = allDeps.includes("@testing-library/jest-dom");
  hasTestingLibrary = ["@testing-library/dom", "@testing-library/react"].some(
    (dependency) => allDeps.includes(dependency)
  );
} catch (error) {
  // ignore error
}

module.exports = {
  plugins: [
    "jest",
    hasJestDom ? "jest-dom" : null,
    hasTestingLibrary ? "testing-library" : null,
  ].filter(Boolean),
  extends: ["plugin:jest/recommended"],
  rules: {
    ...(hasJestDom
      ? {
          "jest-dom/prefer-checked": "error",
          "jest-dom/prefer-empty": "error",
          "jest-dom/prefer-enabled-disabled": "error",
          "jest-dom/prefer-focus": "error",
          "jest-dom/prefer-required": "error",
          "jest-dom/prefer-to-have-attribute": "error",
          "jest-dom/prefer-to-have-text-content": "error",
        }
      : null),
    ...(hasTestingLibrary
      ? {
          "testing-library/await-async-query": "error",
          "testing-library/await-async-utils": "error",
          "testing-library/await-fire-event": "off",
          "testing-library/consistent-data-testid": "off",
          "testing-library/no-await-sync-query": "error",
          "testing-library/no-dom-import": ["error", "react"],
          "testing-library/no-manual-cleanup": "error",
          "testing-library/no-wait-for-empty-callback": "error",
          "testing-library/prefer-explicit-assert": "warn",
          "testing-library/prefer-presence-queries": "error",
          "testing-library/prefer-screen-queries": "error",
          "testing-library/prefer-wait-for": "error",
        }
      : null),
  },
  env: {
    "jest/globals": true,
  },
  overrides: [
    {
      files: [
        "**/test.ts",
        "**/*.test.ts",
        "**/test.tsx",
        "**/*.test.tsx",
        "**/test.js",
        "**/*.test.js",
        "**/test.jsx",
        "**/*.test.jsx",
      ],
      settings: {
        "import/resolver": {
          jest: {
            jestConfigFile: "./jest.config.js",
          },
        },
      },
    },
  ],
};
