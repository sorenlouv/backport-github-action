module.exports = {
  preset: 'ts-jest',
  testRegex: 'src/.*test.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
