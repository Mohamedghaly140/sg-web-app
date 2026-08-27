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
    // Agent/skill tooling config, not storefront app source. `.agents/skills/**/templates/**`
    // vendors full standalone example projects (e.g. clerk-nextjs-patterns' nextjs-basic-auth
    // template) whose own app/layout.tsx crashes eslint-plugin-react's react version
    // detection when linted under this repo's Next.js config.
    ".agents/**",
    ".claude/**",
    ".codex/**",
    // Generated design-handoff runtime bundle, not hand-written app source.
    "docs/design_handoff_sg_storefront/**",
  ]),
]);

export default eslintConfig;
