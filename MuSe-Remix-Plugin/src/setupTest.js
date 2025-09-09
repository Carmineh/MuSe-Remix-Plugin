import '@testing-library/jest-dom';

// Helper per mock api
global.mockApiEndpoint = (url, responseData, statusCode = 200) => {
    global.fetch = global.fetch || jest.fn();
    global.fetch.mockImplementation((fetchUrl, options) => {
        if (fetchUrl.includes(url)) {
            return Promise.resolve({
                ok: statusCode >= 200 && statusCode < 300,
                status: statusCode,
                json: () => Promise.resolve(responseData),
            });
        }
        return Promise.reject(new Error(`No mock for ${fetchUrl}`));
    });
};

beforeEach(() => {
    global.fetch = jest.fn((url) => {
        console.error(`Test error: No mock defined for fetch to: ${url}`);
        return Promise.reject(new Error(`No mock for ${url}`));
    });
});

afterEach(() => {
    jest.clearAllMocks();
});