/**
 * PHOENIX UNIFIED - useBlock Hook
 * Fetches manifest.json from unified content structure
 * Returns block data with media type detection
 */

import { useState, useEffect } from 'react';

/**
 * Fetch and parse a block's manifest.json
 * @param {number} hour - Hour number (1-4)
 * @param {string} blockId - Block folder name (e.g., 'block_001', 'block_000_intro')
 */
export function useBlock(hour, blockId) {
    const [block, setBlock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlock = async () => {
            setLoading(true);
            setError(null);

            try {
                const manifestUrl = `/content/hour_${hour}/${blockId}/manifest.json`;
                const response = await fetch(manifestUrl);

                if (!response.ok) {
                    throw new Error(`Block not found: ${manifestUrl}`);
                }

                const data = await response.json();

                // Build full asset paths
                const basePath = `/content/hour_${hour}/${blockId}/`;

                // Convert YouTube URL to embed format
                let youtubeEmbedUrl = null;
                if (data.assets?.youtube) {
                    const ytUrl = data.assets.youtube;
                    // Handle youtu.be links
                    if (ytUrl.includes('youtu.be/')) {
                        const videoId = ytUrl.split('youtu.be/')[1].split('?')[0];
                        youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                    // Handle youtube.com/watch?v= links
                    else if (ytUrl.includes('watch?v=')) {
                        const videoId = ytUrl.split('watch?v=')[1].split('&')[0];
                        youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                }

                const processedBlock = {
                    ...data,
                    basePath,
                    // Build image URLs if images exist
                    imageUrls: data.assets?.images?.map(img => `${basePath}${img}`) || [],
                    // Build audio URL if audio exists
                    audioUrl: data.assets?.audio ? `${basePath}${data.assets.audio}` : null,
                    // Build video URL if video exists
                    videoUrl: data.assets?.video ? `${basePath}${data.assets.video}` : null,
                    // YouTube embed URL
                    youtubeUrl: youtubeEmbedUrl,
                };

                setBlock(processedBlock);
            } catch (err) {
                console.error('Failed to load block:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (hour && blockId) {
            fetchBlock();
        }
    }, [hour, blockId]);

    return { block, loading, error };
}

/**
 * Get list of block IDs for an hour
 * For now, hardcoded. Later: fetch from index.json
 */
export const HOUR_BLOCKS = {
    1: ['block_001', 'block_002', 'block_003', 'block_004', 'block_005'],
    2: ['block_000_intro', 'block_001', 'block_002'],
    3: ['block_001'],
    4: ['block_001']
};

export function getBlocksForHour(hour) {
    return HOUR_BLOCKS[hour] || [];
}

export default useBlock;

