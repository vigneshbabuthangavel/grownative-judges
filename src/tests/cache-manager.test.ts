
import fs from 'fs';
import path from 'path';
import { getCache, setCache } from '../lib/cache-manager';
import { generateStoryKey } from '../lib/cache-utils';

// Mock fs
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Cache Manager', () => {
    const TEST_NAMESPACE = 'test-namespace';
    const TEST_KEY = 'test-key';
    const TEST_DATA = { foo: 'bar' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should generate a valid slug key', () => {
        const key = generateStoryKey('en', 3, 'My Story');
        expect(key).toBe('en_L3_My Story_v1');
    });

    it('should return null on cache miss', async () => {
        mockFs.existsSync.mockReturnValue(false);
        const result = await getCache(TEST_NAMESPACE, TEST_KEY);
        expect(result).toBeNull();
    });

    it('should return data on cache hit', async () => {
        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue(JSON.stringify(TEST_DATA));

        const result = await getCache(TEST_NAMESPACE, TEST_KEY);
        expect(result).toEqual(TEST_DATA);
    });

    it('should save data to cache', async () => {
        mockFs.existsSync.mockReturnValue(true); // Dir exists

        await setCache(TEST_NAMESPACE, TEST_KEY, TEST_DATA);

        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('test-key.json'),
            JSON.stringify(TEST_DATA, null, 2)
        );
    });

    it('should create directory if it does not exist when saving', async () => {
        mockFs.existsSync.mockReturnValue(false); // Dir does not exist

        await setCache(TEST_NAMESPACE, TEST_KEY, TEST_DATA);

        expect(mockFs.mkdirSync).toHaveBeenCalledWith(
            expect.stringContaining(TEST_NAMESPACE),
            { recursive: true }
        );
        expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
});
