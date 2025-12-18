/**
 * useGovernor.js - Timer Governance Hook
 * Enforces minimum time per block before allowing advancement
 * 
 * RULES:
 * 1. If block has audio: minTime = audioDuration
 * 2. If no audio: minTime = 60min / blocksInHour (e.g., 4 min for 15 blocks)
 * 3. Next button disabled until minTime reached
 * 4. Visual countdown shows time remaining
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function useGovernor(block, audioRef, blocksInHour = 15, externalDuration = 0) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [canAdvance, setCanAdvance] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [internalDuration, setInternalDuration] = useState(0); // Renamed from audioDuration
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);

    // Use external duration if provided (passed from UnifiedPlayer), otherwise internal
    const durationToUse = externalDuration > 0 ? externalDuration : internalDuration;

    // Calculate minimum required time for this block
    const calculateMinTime = useCallback(() => {
        // If audio exists, use duration + 7% BUFFER
        if (durationToUse > 0) {
            const BUFFER_PERCENT = 0.07;
            const bufferedDuration = Math.ceil(durationToUse * (1 + BUFFER_PERCENT));
            return bufferedDuration;
        }

        // Fallback: 60 minutes / blocks in hour = min per block
        // 60 min = 3600 seconds, 15 blocks = 240 seconds (4 min) per block
        const fallbackMinSeconds = Math.floor(3600 / blocksInHour);
        return fallbackMinSeconds;
    }, [durationToUse, blocksInHour]);

    const minTimeSeconds = calculateMinTime();

    // Track audio duration when loaded (Backup/Legacy support)
    useEffect(() => {
        if (!audioRef?.current) return;

        const audio = audioRef.current;

        const handleDurationChange = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                setInternalDuration(Math.ceil(audio.duration));
            }
        };

        // Check if already loaded
        if (audio.duration && !isNaN(audio.duration)) {
            setInternalDuration(Math.ceil(audio.duration));
        }

        audio.addEventListener('loadedmetadata', handleDurationChange);
        audio.addEventListener('durationchange', handleDurationChange);

        return () => {
            audio.removeEventListener('loadedmetadata', handleDurationChange);
            audio.removeEventListener('durationchange', handleDurationChange);
        };
    }, [audioRef]);

    // Start/reset timer when block changes
    useEffect(() => {
        // Reset state
        setElapsedSeconds(0);
        setCanAdvance(false);
        if (externalDuration === 0) setInternalDuration(0); // Reset internal if we might rely on it
        startTimeRef.current = Date.now();

        // Clear existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Start counting
        intervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setElapsedSeconds(elapsed);
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [block?.block_id]);

    // Update canAdvance and timeRemaining based on elapsed time
    useEffect(() => {
        const remaining = Math.max(0, minTimeSeconds - elapsedSeconds);
        setTimeRemaining(remaining);
        setCanAdvance(remaining === 0);
    }, [elapsedSeconds, minTimeSeconds]);

    // Format time as M:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Progress percentage (0-100)
    const progressPercent = minTimeSeconds > 0
        ? Math.min(100, (elapsedSeconds / minTimeSeconds) * 100)
        : 100;

    return {
        canAdvance,
        timeRemaining,
        timeRemainingDisplay: formatTime(timeRemaining),
        elapsedSeconds,
        elapsedDisplay: formatTime(elapsedSeconds),
        minTimeSeconds,
        minTimeDisplay: formatTime(minTimeSeconds),
        progressPercent,
        audioDuration: durationToUse, // Return the actual duration being used
    };
}

export default useGovernor;
