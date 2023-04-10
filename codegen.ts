import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'graphql/schema.graphql',
  documents: ['./graphql/*.graphql'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './generated/gql/': {
      preset: 'client',
      plugins: [],
    },
  },
};

export default config;
