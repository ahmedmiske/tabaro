// eslint.config.mjs (root)
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules',
      'client/build',
      'client/node_modules',
      'uploads',
      'dist',
      'build',
      '**/*.min.js'
    ],
  },

  js.configs.recommended,
  prettier,

  // إعدادات خاصة بكود الباك-إند داخل server/
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs', // مهم: CommonJS
      globals: {
        // هذه تجعل ESLint يعرف أن هذه أشياء built-in في Node
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'import/order': [
        'warn',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always'
        }
      ]
    }
  }
];
