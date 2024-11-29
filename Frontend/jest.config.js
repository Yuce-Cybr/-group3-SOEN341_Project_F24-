module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'], // Include .jsx extensions
  collectCoverage: true,
  coverageDirectory: './coverage',
  reporters: ['default', ['jest-junit', { outputDirectory: './test-results' }]],
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Use Babel to transform .js and .jsx files
  },
};
