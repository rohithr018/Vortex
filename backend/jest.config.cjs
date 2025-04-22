module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        "/node_modules/(?!@octokit/rest)/", // This allows Jest to transform @octokit/rest
    ],
    testMatch: ['**/__tests__/**/*.test.js'],
};
