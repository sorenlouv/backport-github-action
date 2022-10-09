module.exports = {
  transform: {
    '^.+\\.ts?$': ['ts-jest', { diagnostics: false }],
  },
  preset: 'ts-jest',
  testRegex: 'src/.*test.ts$',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
};
