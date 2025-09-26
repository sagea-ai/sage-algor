import fs from 'fs/promises';
import path from 'path';

let fileIndex = [];

const shouldIgnore = (filePath) => {
    const baseName = path.basename(filePath);
    return baseName.startsWith('.') || filePath.includes('node_modules');
};

export const buildFileIndex = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (shouldIgnore(fullPath)) {
            continue;
        }

        if (entry.isDirectory()) {
            await buildFileIndex(fullPath);
        } else {
            fileIndex.push(fullPath);
        }
    }
};

export const searchFiles = (query) => {
    if (!query) {
        return [];
    }
    return fileIndex.filter(file => file.toLowerCase().includes(query.toLowerCase()));
};

export const getFileIndex = () => fileIndex;
