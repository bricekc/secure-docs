import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: `${process.env.VITE_BACK_URL}/graphql`,
  documents: ["src/**/*.tsx"],
  ignoreNoDocuments: true,
  generates: {
    "./src/gql/": {
      preset: "client",
      config: {
        avoidOptionals: true,
      },
    },
  },
};

export default config;
