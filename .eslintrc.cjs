module.exports = {
  extends: [
    '@ridi/eslint-config',
    '@ridi/eslint-config/react',
    '@ridi/eslint-config/typescript',
    '@ridi/eslint-config/prettier',
  ],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['import', 'jsx-a11y', 'react', 'simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/prefer-default-export': 'off',
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/prop-types': 'off',
    'no-underscore-dangle': 'error',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'comma-dangle': ['error', 'always-multiline'],
    'lines-around-comment': [
      'error',
      {
        beforeBlockComment: false,
        afterBlockComment: false,
        beforeLineComment: false,
        afterLineComment: false,
      },
    ],
    'no-confusing-arrow': 'off',
    'no-nested-ternary': 'error',
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state'] }],
    'prefer-promise-reject-errors': 'off',
    'react/no-unused-prop-types': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: [
    '.eslintrc.cjs',
    'vite.config.ts',
    'vite.config.types.ts',
  ],
};

