import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Firebase functions use CommonJS
    "functions/**",
    // Public scripts are standalone
    "public/**/*.js",
  ]),
  // Custom rules
  {
    rules: {
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Downgrade setState-in-effect to warning (valid for animation patterns)
      "react-hooks/set-state-in-effect": "warn",
      // Downgrade static-components to warning
      "react-hooks/static-components": "warn",
    },
  },
]);

export default eslintConfig;
