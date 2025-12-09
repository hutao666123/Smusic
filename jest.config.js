module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['lib/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  setupFiles: ['<rootDir>/jest.setup.js']
}
