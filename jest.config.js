module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  verbose: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/test/', '/utils/'],
};
