/**
 * PHOENIX UNIFIED - Salon Mode Hook
 * Auto-progression for hands-free CE learning
 * Block duration + 15% buffer, then auto-advance
 */

import { useState, useEffect, useCallback } from 'react';

const BUFFER_PERCENT = 0.07; // 7% extra time

export function useSalonMode(block, audioRef, onAutoAdvance) {
    const [salonModeEnabled, setSalonModeEnabled] = useState(false);
    const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
    const [blockTotalTime, setBlockTotalTime] = useState(0);
    const [isAlmostDone, setIsAlmostDone] = useState(false); // <10s remaining

    // Calculate total block time based on content type
    // PRIORITY: Audio duration > Image count > Defaults
    const calculateBlockTime = useCallback((block) => {
        if (!block) return 60; // Default 60s if no block

        let baseTime = 60; // Default minimum

        // PRIORITY 1: If block has audio, use audio duration
        if (block.audioUrl && audioRef?.current?.duration) {
            baseTime = Math.ceil(audioRef.current.duration);
        }
        // PRIORITY 2: Calculate from image count (10s per image, min 30s)
        else if (block.imageUrls?.length > 0) {
            baseTime = Math.max(30, block.imageUrls.length * 10);
        }
        // PRIORITY 3: Quiz blocks - 60s per question
        else if (block.media_type === 'quiz' && block.quiz?.length) {
            baseTime = block.quiz.length * 60;
        }
        // PRIORITY 4: Video blocks
        else if (block.videoUrl || block.youtubeUrl) {
            baseTime = 120; // 2 minutes default for video
        }
        // FALLBACK: 60s default
        else {
            baseTime = 60;
        }

        // Add 15% buffer ONLY
        return Math.ceil(baseTime * (1 + BUFFER_PERCENT));
    }, [audioRef]);

    // Initialize timer when block changes
    useEffect(() => {
        const totalTime = calculateBlockTime(block);
        setBlockTotalTime(totalTime);
        setBlockTimeRemaining(totalTime);
        setIsAlmostDone(false);
    }, [block, calculateBlockTime]);

    // Countdown timer
    useEffect(() => {
        if (!salonModeEnabled || blockTimeRemaining <= 0) return;

        const timer = setInterval(() => {
            setBlockTimeRemaining(prev => {
                const newTime = prev - 1;

                // Check if almost done (<10s)
                if (newTime <= 10 && newTime > 0) {
                    setIsAlmostDone(true);
                }

                // Auto-advance when timer hits 0
                if (newTime <= 0) {
                    clearInterval(timer);
                    onAutoAdvance?.();
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [salonModeEnabled, blockTimeRemaining, onAutoAdvance]);

    // Calculate progress percentage
    const progressPercent = blockTotalTime > 0
        ? ((blockTotalTime - blockTimeRemaining) / blockTotalTime) * 100
        : 0;

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        salonModeEnabled,
        setSalonModeEnabled,
        toggleSalonMode: () => setSalonModeEnabled(prev => !prev),
        blockTimeRemaining,
        blockTotalTime,
        progressPercent,
        isAlmostDone,
        timeDisplay: formatTime(blockTimeRemaining),
        totalDisplay: formatTime(blockTotalTime),
    };
}

export default useSalonMode;
