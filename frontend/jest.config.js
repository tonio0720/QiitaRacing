module.exports = {
    roots: [
        '<rootDir>/src'
    ],
    transform: {
        '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
        '^.+\\.tsx?$': 'ts-jest',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/config/jest/assetsTransformer.js'
    },
    testPathIgnorePatterns: [
        '/node_modules/',
        '/lib/'
    ],
    testRegex: '(/__tests__/.*(test|spec))\\.(ts|tsx|js)$',
    testEnvironment: 'jsdom',
    moduleFileExtensions: [
        'ts',
        'tsx',
        'jsx',
        'js',
        'json'
    ],
    setupFiles: [
        'jest-canvas-mock'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^dnd-core$': 'dnd-core/dist/cjs',
        '^react-dnd$': 'react-dnd/dist/cjs',
        '^react-dnd-html5-backend$': 'react-dnd-html5-backend/dist/cjs',
        '^react-dnd-touch-backend$': 'react-dnd-touch-backend/dist/cjs',
        '^react-dnd-test-backend$': 'react-dnd-test-backend/dist/cjs',
        '^react-dnd-test-utils$': 'react-dnd-test-utils/dist/cjs'
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    snapshotSerializers: ['enzyme-to-json/serializer'],
    // moduleNameMapper: {
    //     '\\.(js)$': '<rootDir>/src/__mocks__/fileMock.js',
    //     '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
    //     '\\.(scss|css|less)$': '<rootDir>/src/__mocks__/styleMock.js'
    // },
    cacheDirectory: '<rootDir>/tmp'
};
