import { AssetManager } from '@/lib/asset-manager';
import fs from 'fs';
import path from 'path';

// Mock fs to avoid actual disk writes
jest.mock('fs');
jest.mock('path', () => ({
    ...jest.requireActual('path'),
    join: (...args: string[]) => args.join('/'), // force posix paths for easier testing
}));

describe('AssetManager', () => {
    describe('sanitizeTopic', () => {
        it('should strip special characters and spaces', () => {
            expect(AssetManager.sanitizeTopic("The Boy's Star!")).toBe('the-boy-s-star');
            expect(AssetManager.sanitizeTopic("  Cloudy   Day  ")).toBe('cloudy-day');
        });
    });

    describe('saveAsset', () => {
        it('should write file to correct path', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false); // dir doesn't exist

            await AssetManager.saveAsset('en', 3, 'test-topic', 0, 'base64data');

            // Check mkdir called
            expect(fs.mkdirSync).toHaveBeenCalled();

            // Check write called
            const expectedPath = expect.stringContaining('private_assets/en/level-3/test-topic/images/page-01.jpg');
            expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expect.any(Buffer));
        });
    });

    describe('loadAssets', () => {
        it('should return null if directory missing', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            const result = await AssetManager.loadAssets('en', 1, 'missing', 5);
            expect(result).toBeNull();
        });

        it('should return null if file count mismatch (incomplete generation)', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readdirSync as jest.Mock).mockReturnValue(['page-01.jpg', 'page-02.jpg']); // only 2

            const result = await AssetManager.loadAssets('en', 1, 'partial', 5); // expect 5
            expect(result).toBeNull();
        });

        it('should return assets if count matches', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readdirSync as jest.Mock).mockReturnValue(['page-01.jpg', 'page-02.jpg']);
            (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('fake-image'));

            const result = await AssetManager.loadAssets('en', 1, 'full', 2);

            expect(result).toHaveLength(2);
            expect(result?.[0]).toBe('ZmFrZS1pbWFnZQ=='); // 'fake-image' in base64
        });
    });
});
