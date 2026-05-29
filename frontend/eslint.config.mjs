import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  prettierRecommended,
  {
    rules: {
      "prettier/prettier": "warn",
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
