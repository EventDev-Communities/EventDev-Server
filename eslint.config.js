import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'app',
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
    formatters: {
      css: true,
      html: true,
      markdown: 'prettier',
    },
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      'coverage/',
      '.git/',
      'prisma/migrations/',
      'prisma/seed/**', // Seeds podem usar imports relativos
      '*.min.js',
      'docs/**',
    ],
  },
  // Import resolution settings
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      // Import organization
      'sort-imports': ['error', {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: true,
      }],
      // Proibir imports relativos - usar apenas aliases
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../*', './*', '../../*', '../../../*'],
          message: 'Imports relativos não são permitidos. Use aliases (@/, @common/, @module/, etc) em vez disso.',
        }],
      }],
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type',
        ],
        'pathGroups': [
          {
            pattern: '@nestjs/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '@prisma/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@common/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@module/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@configs/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@decorators/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@helper/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@infrastructure/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@interface/**',
            group: 'internal',
            position: 'after',
          },
        ],
        'pathGroupsExcludedImportTypes': ['builtin'],
        'newlines-between': 'never',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      }],
    },
  },
  // NestJS specific rules - BALANCED STRICT MODE
  {
    rules: {
      // ============================================
      // Type Safety - STRICT
      // ============================================
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],

      // Boolean expressions - moderado
      '@typescript-eslint/strict-boolean-expressions': ['error', {
        allowString: true,
        allowNumber: true,
        allowNullableObject: true,
        allowNullableBoolean: true,
        allowNullableString: true,
        allowNullableNumber: true,
        allowAny: false,
      }],

      // ============================================
      // Naming Conventions
      // ============================================
      'ts/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'property',
          format: null,
        },
        {
          selector: 'objectLiteralProperty',
          format: null,
        },
      ],

      // ============================================
      // Promise & Async Handling
      // ============================================
      'ts/promise-function-async': 'error',
      'ts/no-floating-promises': 'error',
      'ts/await-thenable': 'error',
      'ts/no-misused-promises': 'error',
      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'error',
      'prefer-promise-reject-errors': 'error',

      // ============================================
      // Error Handling
      // ============================================
      'no-throw-literal': 'off',
      'ts/only-throw-error': 'error',
      'no-return-await': 'off',
      'ts/return-await': ['error', 'always'],

      // ============================================
      // Security & Best Practices
      // ============================================
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-extend-native': 'error',
      'no-iterator': 'error',
      'no-proto': 'error',
      'no-new-wrappers': 'error',
      'no-constructor-return': 'error',
      'import/no-duplicates': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration[const=true]',
          message: 'Prefer regular enum over const enum',
        },
      ],

      // ============================================
      // Performance
      // ============================================
      'no-await-in-loop': 'warn',
      'no-constant-binary-expression': 'error',
      'prefer-object-spread': 'error',
      'prefer-spread': 'error',
      'no-useless-concat': 'error',

      // ============================================
      // Code Quality
      // ============================================
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-rest-params': 'error',
      'no-param-reassign': ['error', { props: false }],
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'no-unneeded-ternary': 'error',
      'no-nested-ternary': 'error',

      // ============================================
      // Documentation (optional but recommended)
      // ============================================
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',

      // ============================================
      // NestJS Specific
      // ============================================
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-namespace': ['error', {
        allowDeclarations: true,
        allowDefinitionFiles: true,
      }],

      // ============================================
      // General Code Quality
      // ============================================
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-useless-return': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // ============================================
      // Antfu Config Overrides
      // ============================================
      'antfu/consistent-list-newline': 'off',
      'antfu/if-newline': 'off',
      'antfu/no-import-dist': 'off',
      'antfu/import-dedupe': 'error',
      'antfu/top-level-function': 'off',

      // ============================================
      // Node-specific
      // ============================================
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',

      // ============================================
      // Import Rules
      // ============================================
      'sort-imports': 'off',
      'import/order': 'off',

      // ============================================
      // Style Rules - General
      // ============================================
      'style/arrow-parens': ['error', 'always'],
      'style/array-bracket-spacing': ['error', 'never'],
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'style/linebreak-style': ['error', 'unix'],
      'style/object-curly-spacing': ['error', 'always'],
      'style/quote-props': ['error', 'consistent'],
      'style/semi': ['error', 'never'],
      'style/comma-dangle': ['error', 'never'],
      'style/no-multi-spaces': 'error',
      'style/max-statements-per-line': ['error', { max: 1 }],
      'curly': ['error', 'all'],

      // ============================================
      // Style Rules - Line Length & Formatting
      // ============================================
      'style/max-len': [
        'error',
        {
          code: 150,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],

      'style/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: 'always',
        },
      ],

      'style/indent': [
        'error',
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          MemberExpression: 1,
          FunctionDeclaration: { parameters: 1, body: 1 },
          FunctionExpression: { parameters: 1, body: 1 },
          CallExpression: { arguments: 1 },
          ArrayExpression: 1,
          ObjectExpression: 1,
          ImportDeclaration: 1,
          flatTernaryExpressions: false,
          ignoreComments: false,
          ignoredNodes: ['TemplateLiteral *'],
          offsetTernaryExpressions: true,
        },
      ],

      // ============================================
      // Style Rules - Object & Operator Formatting
      // ============================================
      'style/object-curly-newline': [
        'error',
        {
          ObjectExpression: { consistent: true },
          ObjectPattern: { consistent: true },
          ImportDeclaration: { consistent: true },
          ExportDeclaration: { consistent: true },
        },
      ],

      'style/operator-linebreak': [
        'error',
        'before',
        {
          overrides: {
            '=': 'after',
            '+=': 'after',
            '-=': 'after',
            '*=': 'after',
            '/=': 'after',
            '%=': 'after',
            '**=': 'after',
            '<<=': 'after',
            '>>=': 'after',
            '>>>=': 'after',
            '&=': 'after',
            '^=': 'after',
            '|=': 'after',
          },
        },
      ],

      // ============================================
      // Complexity Rules
      // ============================================
      'complexity': ['error', 15],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],

      // ============================================
      // File Size Limits (Best Practices for NestJS)
      // ============================================
      'max-lines': ['error', {
        max: 400,
        skipBlankLines: true,
        skipComments: true,
      }],

      // ============================================
      // Unicorn Overrides
      // ============================================
      'unicorn/prefer-at': 'off',
    },
  },
  // Regras para arquivos de teste
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off',
      'complexity': 'off',
      'max-depth': 'off',
      'max-nested-callbacks': 'off',
      'test/prefer-lowercase-title': 'off',
      'max-lines': ['error', {
        max: 500,
        skipBlankLines: true,
        skipComments: true,
      }],
    },
  },
  // Regras específicas por tipo de arquivo
  {
    files: ['**/*.controller.ts'],
    rules: {
      'max-lines': ['error', {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      }],
    },
  },
  {
    files: ['**/*.service.ts'],
    rules: {
      'max-lines': ['error', {
        max: 400,
        skipBlankLines: true,
        skipComments: true,
      }],
    },
  },
  {
    files: ['prisma/schema.prisma', 'prisma/seed/**/*.ts'],
    rules: {
      'max-lines': ['error', {
        max: 1000,
        skipBlankLines: true,
        skipComments: true,
      }],
    },
  },
)
