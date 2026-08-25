import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  //
  // Globbed with a leading **/ so build output is ignored wherever it sits.
  // Each templates/<id>/ is its own Next app with its own .next directory, and
  // a bare ".next/**" only matches the one at the repo root: linting the rest
  // reported thousands of problems in minified React internals.
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/node_modules/**",
    "**/next-env.d.ts",
    // Local tooling, gitignored, and not this project's code to lint.
    ".claude/**",
  ]),
]);

export default eslintConfig;
