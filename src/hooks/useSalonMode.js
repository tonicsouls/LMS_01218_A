/**
 * PHOENIX UNIFIED - Salon Mode Hook
 * Auto-progression for hands-free CE learning
 * Block duration + 17% buffer, then auto-advance
 * 
 * FIX: Added audio duration listener to recalculate when audio loads
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const BUFFER_PERCENT = 0.17; // 17% extra time (superior timing)

export function useSalonMode(block, audioRef, onAutoAdvance) {
    const [salonModeEnabled, setSalonModeEnabled] = useState(false);
    const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
    const [blockTotalTime, setBlockTotalTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [isAlmostDone, setIsAlmostDone] = useState(false); // <10s remaining
    const hasRecalculated = useRef(false);

    // Calculate total block time based on content type
    // PRIORITY: Audio duration > Image count > Defaults
    const calculateBlockTime = useCallback((block, knownAudioDuration = 0) => {
        if (!block) return 60; // Default 60s if no block

        let baseTime = 60; // Default minimum

        // PRIORITY 1: If we KNOW the audio duration from listener
        if (knownAudioDuration > 0) {
            baseTime = Math.ceil(knownAudioDuration);
            console.log(`Salon Mode: Using KNOWN audio duration: ${baseTime}s`);
        }
        // PRIORITY 1b: If block has audio and ref has duration
        else if (block.audioUrl && audioRef?.current?.duration && !isNaN(audioRef.current.duration)) {
            baseTime = Math.ceil(audioRef.current.duration);
            console.log(`Salon Mode: Using audioRef duration: ${baseTime}s`);
        }
        // PRIORITY 2: Calculate from image count (10s per image, min 30s)
        else if (block.imageUrls?.length > 0) {
            baseTime = Math.max(30, block.imageUrls.length * 10);
            console.log(`Salon Mode: Using image count (${block.imageUrls.length}): ${baseTime}s`);
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
            console.log(`Salon Mode: Using fallback: ${baseTime}s`);
        }

        // Add 17% buffer
        const totalTime = Math.ceil(baseTime * (1 + BUFFER_PERCENT));
        console.log(`Salon Mode: Total time with +17%: ${totalTime}s`);
        return totalTime;
    }, [audioRef]);

    // Listen for audio duration when it becomes available
    useEffect(() => {
        if (!audioRef?.current) return;

        const audio = audioRef.current;

        const handleLoadedMetadata = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                const duration = Math.ceil(audio.duration);
                console.log(`Audio loaded! Duration: ${duration}s`);
                setAudioDuration(duration);

                // Recalculate block time NOW that we know the real duration
                const newTotalTime = calculateBlockTime(block, duration);
                console.log(`Recalculating blockTotalTime: ${newTotalTime}s (was ${blockTotalTime}s)`);

                if (newTotalTime !== blockTotalTime) {
                    setBlockTotalTime(newTotalTime);
                    // If we haven't started counting down much, update remaining too
                    if (blockTimeRemaining >= blockTotalTime - 5 || !salonModeEnabled) {
                        setBlockTimeRemaining(newTotalTime);
                    }
                }
            }
        };

        // Check if already loaded
        if (audio.duration && !isNaN(audio.duration)) {
            handleLoadedMetadata();
        }

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('durationchange', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('durationchange', handleLoadedMetadata);
        };
    }, [audioRef, block, calculateBlockTime, blockTotalTime, blockTimeRemaining, salonModeEnabled]);

    // Reset when block changes
    useEffect(() => {
        hasRecalculated.current = false;
        setAudioDuration(0);
        const totalTime = calculateBlockTime(block, 0);
        setBlockTotalTime(totalTime);
        setBlockTimeRemaining(totalTime);
        setIsAlmostDone(false);
    }, [block?.block_id]); // Only reset on different block

    // Countdown timer
    // NOTE: Does NOT auto-advance directly. Sets salonComplete = true.
    // Parent component must check BOTH salonComplete AND governor canAdvance
    useEffect(() => {
        if (!salonModeEnabled || blockTimeRemaining <= 0) return;

        const timer = setInterval(() => {
            setBlockTimeRemaining(prev => {
                const newTime = prev - 1;

                // Check if almost done (<10s)
                if (newTime <= 10 && newTime > 0) {
                    setIsAlmostDone(true);
                }

                // Salon timer complete - but DON'T auto-advance yet
                // Let parent decide based on governor
                if (newTime <= 0) {
                    clearInterval(timer);
                    // Signal completion but don't advance
                    console.log('Salon Mode: Timer complete. Waiting for governor...');
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

    // Salon Mode is "complete" when timer hits 0 (but may still be waiting for governor)
    const salonComplete = salonModeEnabled && blockTimeRemaining === 0;

    return {
        salonModeEnabled,
        setSalonModeEnabled,
        toggleSalonMode: () => setSalonModeEnabled(prev => !prev),
        blockTimeRemaining,
        blockTotalTime,
        audioDuration,
        progressPercent,
        isAlmostDone,
        salonComplete,  // True when salon timer done (may still wait for governor)
        timeDisplay: formatTime(blockTimeRemaining),
        totalDisplay: formatTime(blockTotalTime),
    };
}

export default useSalonMode;
