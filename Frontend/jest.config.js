module.exports = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'test-results', // Ensure results are saved here
  reporters: ['default', ['jest-junit', { outputDirectory: './test-results' }]],
};
