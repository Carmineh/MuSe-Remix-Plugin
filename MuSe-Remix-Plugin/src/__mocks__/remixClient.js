export function createRemixClientMock() {
    const listeners = {};

    const fileManager = {
        readdir: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn(),
    };

    const client = {
        fileManager,
        onload: (cb) => {
            setTimeout(() => cb(), 0);
        },
        on: (namespace, event, handler) => {
            listeners[`${namespace}:${event}`] = handler;
        },
        __emit(namespace, event, payload) {
            const h = listeners[`${namespace}:${event}`];
            if (h) h(payload);
        },
    };

    return client;
}