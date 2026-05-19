import type { Config } from 'jest';

const config: Config = {
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      preset: 'ts-jest',
      roots: ['<rootDir>/__tests__'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/__tests__/components/',
        '/__tests__/hooks/',
        '/__tests__/setup\\.ts$',
        '/__tests__/setup-dom\\.ts$',
      ],
      testMatch: ['**/__tests__/**/*.test.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      transform: {
        '^.+\\.[tj]sx?$': [
          'ts-jest',
          { tsconfig: 'tsconfig.test.json' },
        ],
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(jose|@modelcontextprotocol)/)',
      ],
      setupFiles: ['<rootDir>/__tests__/setup.ts'],
      coveragePathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/components/ui/',
        '/generated/',
        '/__tests__/',
      ],
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      preset: 'ts-jest',
      roots: ['<rootDir>/__tests__'],
      testMatch: [
        '**/__tests__/components/**/*.test.tsx',
        '**/__tests__/hooks/**/*.test.ts',
        '**/__tests__/hooks/**/*.test.tsx',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      transform: {
        '^.+\\.[tj]sx?$': [
          'ts-jest',
          { tsconfig: 'tsconfig.test.json' },
        ],
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(jose|@modelcontextprotocol)/)',
      ],
      setupFiles: ['<rootDir>/__tests__/setup.ts'],
      setupFilesAfterEnv: ['<rootDir>/__tests__/setup-dom.ts'],
      coveragePathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/components/ui/',
        '/generated/',
        '/__tests__/',
      ],
    },
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/generated/',
    '<rootDir>/components/ui/',
    '<rootDir>/__tests__/',
  ],
};

export default config;
