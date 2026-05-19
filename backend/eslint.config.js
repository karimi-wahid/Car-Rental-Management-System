import globals from 'globals';

export default [
  {
    languageOptions: {
      sourceType: 'module', // Explicitly set to module
      ecmaVersion: 'latest',
      globals: { ...globals.browser },
    },
  },
];
