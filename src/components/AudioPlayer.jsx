/**
 * PHOENIX UNIFIED - Audio Player Component
 * Simple audio player with progress bar
 * Integrates with Salon Mode for auto-advance timing
 */

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const AudioPlayer = forwardRef(({ src, onEnded, onDurationChange, onPlay, onPause, onTimeUpdate, autoPlay = false }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const audioRef = React.useRef(null);

    // Expose audio element to parent
    useImperativeHandle(ref, () => ({
        get current() { return audioRef.current; },
        play: () => audioRef.current?.play(),
        pause: () => audioRef.current?.pause(),
        getDuration: () => audioRef.current?.duration || 0,
    }));

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
            onTimeUpdate?.(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            onDurationChange?.(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(100);
            onEnded?.();
        };

        const handlePlay = () => {
            setIsPlaying(true);
            onPlay?.();
        };

        const handlePause = () => {
            setIsPlaying(false);
            onPause?.();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [onEnded, onDurationChange, onTimeUpdate, onPlay, onPause]);

    // Precise Autoplay Logic - Only runs when src changes or autoPlay becomes true
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !src) return;

        if (autoPlay) {
            audio.play().catch(() => { });
        }
    }, [src, autoPlay]);

    // Reset when src changes
    useEffect(() => {
        setProgress(0);
        setCurrentTime(0);
        if (!autoPlay) setIsPlaying(false);
    }, [src, autoPlay]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => { });
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        audioRef.current.currentTime = percent * duration;
    };

    if (!src) return null;

    return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <audio ref={audioRef} src={src} preload="metadata" loop={false} />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className="flex-none w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-colors"
            >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            {/* Progress Bar */}
            <div className="flex-1">
                <div
                    className="w-full h-2 bg-white/20 rounded-full cursor-pointer group"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-purple-500 rounded-full relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume Button */}
            <button
                onClick={toggleMute}
                className="flex-none p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
        </div>
    );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
