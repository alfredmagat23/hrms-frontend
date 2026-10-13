import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/**", "components/**", "features/**", "lib/**"],
    rules: {
      // Mock service loads on mount are intentional for this front-end demo.
      "react-hooks/set-state-in-effect": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/mock", "@/lib/mock/**", "**/lib/mock", "**/lib/mock/**"],
              message:
                "Screens must not import mock fixtures. Use the typed services in @/lib/services.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["lib/mock/**", "lib/services/**", "lib/session/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
