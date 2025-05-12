import stylistic from "@stylistic/eslint-plugin";
import tailwind from "eslint-plugin-tailwindcss";
import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const config = [
  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    semi: true,
  }),
  ...fixupConfigRules(compat.config({
    extends: ["next", "next/typescript"],
  })),
  ...tailwind.configs["flat/recommended"],
  { ignores: [".next/*", "out/*"] },
];

export default config;
