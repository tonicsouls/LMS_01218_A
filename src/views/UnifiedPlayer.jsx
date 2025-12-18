/**
 * PHOENIX UNIFIED - Universal Player
 * ONE INTERFACE for all media types: images OR video
 * Same frame, same experience, same interface
 * GOVERNANCE: Tracks time for TDLR compliance (50 min/hour)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBlock, getBlocksForHour } from '../hooks/useBlock';
import { useProgressStore } from '../stores/ProgressStore';
import { useSalonMode } from '../hooks/useSalonMode';
import { useGovernor } from '../hooks/useGovernor';
import { useDevMode } from '../hooks/useDevMode';
import { ChevronLeft, ChevronRight, Play, Pause, Home, Maximize2, Minimize2, Volume2, VolumeX, Clock, Scissors, Zap } from 'lucide-react';
import QuizBlock from '../components/QuizBlock';
import AudioPlayer from '../components/AudioPlayer';

export default function UnifiedPlayer() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Read hour from URL param, default to 1
    const initialHour = parseInt(searchParams.get('hour')) || 1;

    const [currentHour, setCurrentHour] = useState(initialHour);
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
    const [textIndex, setTextIndex] = useState(0);
    const [imageIndex, setImageIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [displayTime, setDisplayTime] = useState('0:00');

    // Progress tracking
    const { startBlock, recordBlockTime, markTabViewed, getFormattedTime, getRemainingTime } = useProgressStore();

    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const blocks = getBlocksForHour(currentHour);
    const currentBlockId = blocks[currentBlockIndex];
    const { block, loading, error } = useBlock(currentHour, currentBlockId);

    // Navigation handlers - defined first for Salon Mode callback
    const goToNextBlock = useCallback(() => {
        if (currentBlockIndex < blocks.length - 1) {
            setCurrentBlockIndex(i => i + 1);
        } else if (currentHour < 4) {
            setCurrentHour(h => h + 1);
            setCurrentBlockIndex(0);
        }
    }, [currentBlockIndex, blocks.length, currentHour]);

    // Salon Mode - auto-progression
    const {
        salonModeEnabled,
        toggleSalonMode,
        blockTimeRemaining,
        blockTotalTime,      // Added - needed for image cycling
        progressPercent,
        isAlmostDone,
        timeDisplay,
        totalDisplay,
    } = useSalonMode(block, audioRef, goToNextBlock);

    // Governor - enforces minimum time before advancement
    const {
        canAdvance,
        timeRemaining: governorTimeRemaining,
        timeRemainingDisplay,
        progressPercent: governorProgress,
    } = useGovernor(block, audioRef, blocks.length);

    // DEV MODE - bypasses governor timer (Ctrl+Shift+D to toggle)
    const { devModeEnabled, toggleDevMode, isDevModeAvailable } = useDevMode();

    // Start tracking when block loads
    useEffect(() => {
        if (currentBlockId) {
            startBlock(currentHour, currentBlockId);
        }
        return () => {
            recordBlockTime(); // Save time when leaving
        };
    }, [currentHour, currentBlockId]);

    // Update time display every second (shows stored time + current session time)
    useEffect(() => {
        const interval = setInterval(() => {
            // Get stored time from progress store
            const storedSeconds = useProgressStore.getState().hours[currentHour]?.total_seconds || 0;
            // Get current session elapsed time
            const blockStart = useProgressStore.getState().blockStartTime;
            const currentElapsed = blockStart ? Math.floor((Date.now() - blockStart) / 1000) : 0;
            // Total = stored + current session
            const totalSeconds = storedSeconds + currentElapsed;
            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            setDisplayTime(`${mins}:${secs.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [currentHour]);

    // Track tab views
    useEffect(() => {
        if (currentBlockId && textIndex >= 0) {
            const tabNames = ['scenario', 'connection', 'law'];
            markTabViewed(currentHour, currentBlockId, tabNames[textIndex]);
        }
    }, [textIndex, currentHour, currentBlockId]);

    // Reset indices when block changes
    useEffect(() => {
        setTextIndex(0);
        setImageIndex(0);
        setIsPlaying(false);
        setVideoProgress(0);
    }, [currentHour, currentBlockIndex]);

    // Auto-cycle images - PROPORTIONAL to audio duration
    // 3 images over 60s = 20s each (evenly distributed)
    useEffect(() => {
        if (!salonModeEnabled || !block?.imageUrls?.length) return;
        if (block.videoUrl || block.youtubeUrl) return; // Don't cycle if video block

        const imageCount = block.imageUrls.length;
        if (imageCount <= 1) return;

        // Calculate interval: blockTotalTime (with +17%) / imageCount
        // blockTotalTime is in seconds, convert to ms
        const intervalMs = blockTotalTime > 0
            ? Math.floor((blockTotalTime * 1000) / imageCount)
            : 8000; // Fallback to 8s if no duration

        const cycleInterval = setInterval(() => {
            setImageIndex(prev => (prev + 1) % imageCount);
        }, intervalMs);

        return () => clearInterval(cycleInterval);
    }, [salonModeEnabled, block?.imageUrls?.length, block?.videoUrl, block?.youtubeUrl, blockTotalTime]);

    // Video time tracking
    useEffect(() => {
        if (!videoRef.current || !block?.videoUrl) return;

        const video = videoRef.current;
        const handleTimeUpdate = () => {
            setVideoProgress((video.currentTime / video.duration) * 100 || 0);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [block?.videoUrl]);


    const goToPrevBlock = useCallback(() => {
        if (currentBlockIndex > 0) {
            setCurrentBlockIndex(i => i - 1);
        } else if (currentHour > 1) {
            // Move to previous hour
            setCurrentHour(h => h - 1);
            const prevBlocks = getBlocksForHour(currentHour - 1);
            setCurrentBlockIndex(prevBlocks.length - 1);
        }
    }, [currentBlockIndex, currentHour]);

    // Video controls
    const togglePlayPause = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(() => { });
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Text content arrays
    const textCards = block ? [
        { label: 'Scenario', content: block.content?.scenario, color: 'purple', icon: '📖' },
        { label: 'Connection', content: block.content?.connection, color: 'blue', icon: '🔗' },
        { label: 'The Law', content: block.content?.law, color: 'cyan', icon: '⚖️' }
    ].filter(t => t.content) : [];

    const currentText = textCards[textIndex] || { label: 'Loading', content: '...', color: 'purple' };
    const colorStyles = {
        purple: 'bg-purple-600/20 border-purple-500/40',
        blue: 'bg-blue-600/20 border-blue-500/40',
        cyan: 'bg-cyan-600/20 border-cyan-500/40'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading lesson...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-purple-600 rounded-lg">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* HEADER - Same for all content types */}
            <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/launch')} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Back to menu">
                            <Home size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold">{block?.title}</h1>
                            <p className="text-sm text-gray-400">
                                Hour {currentHour} • Block {currentBlockIndex + 1}/{blocks.length}
                                <span className="ml-2 text-purple-400">
                                    ({Math.round(((currentBlockIndex + 1) / blocks.length) * 100)}%)
                                </span>
                            </p>
                        </div>
                    </div>
                    {/* TIME TRACKING - Governance */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-lg">
                            <Clock size={16} className="text-green-400" />
                            <span className="text-green-400 font-mono font-medium">{displayTime}</span>
                            <span className="text-green-400/60 text-xs">/ 50:00</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                            <span>{block?.tdlr_citation}</span>
                            {block?.media_type === 'video' && <span className="px-2 py-1 bg-purple-600/30 rounded text-purple-300">📹 Video</span>}
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
                {/* QUIZ BLOCKS - Full width, no split layout */}
                {block?.media_type === 'quiz' && block?.quiz ? (
                    <div className="max-w-2xl mx-auto">
                        <QuizBlock
                            quiz={block.quiz}
                            onComplete={() => goToNextBlock()}
                            onQuestionAnswered={(answer) => {
                                console.log('Question answered:', answer);
                            }}
                        />
                    </div>
                ) : (
                    /* MEDIA BLOCKS - Split layout for images/video/youtube */
                    <div className="grid lg:grid-cols-2 gap-8 items-start">

                        {/* LEFT PANEL: Media (Images OR Video) - SAME LOCATION */}
                        <div className="space-y-4 lg:sticky lg:top-24">
                            <div className={`aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 relative group ${isTheaterMode ? 'lg:col-span-2 aspect-[21/9]' : ''}`}>

                                {/* VIDEO CONTENT */}
                                {block?.videoUrl ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            src={block.videoUrl}
                                            className="w-full h-full object-contain"
                                            onClick={togglePlayPause}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onEnded={goToNextBlock}
                                        />

                                        {/* Video Controls Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                                                {/* Progress Bar */}
                                                <div className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer">
                                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${videoProgress}%` }} />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={togglePlayPause} className="text-white hover:text-purple-400">
                                                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                                        </button>
                                                        <button onClick={toggleMute} className="text-white hover:text-purple-400">
                                                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                                        </button>
                                                    </div>
                                                    <button onClick={() => setIsTheaterMode(!isTheaterMode)} className="text-white hover:text-purple-400" title="Theater Mode">
                                                        {isTheaterMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Center Play Button (when paused) */}
                                        {!isPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <button onClick={togglePlayPause} className="w-16 h-16 rounded-full bg-purple-600/80 flex items-center justify-center hover:bg-purple-600 transition-colors">
                                                    <Play className="w-8 h-8 text-white ml-1" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : block?.youtubeUrl ? (
                                    /* YOUTUBE EMBED */
                                    <iframe
                                        src={block.youtubeUrl}
                                        className="w-full h-full"
                                        title={block.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : block?.imageUrls?.length > 0 ? (
                                    /* IMAGE CONTENT */
                                    <>
                                        <img
                                            src={block.imageUrls[imageIndex]}
                                            alt={block.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.style.opacity = 0.3}
                                        />

                                        {/* Image Navigation Arrows */}
                                        {block.imageUrls.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setImageIndex(i => Math.max(0, i - 1))}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button
                                                    onClick={() => setImageIndex(i => Math.min(block.imageUrls.length - 1, i + 1))}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    /* NO MEDIA FALLBACK */
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        No media available
                                    </div>
                                )}

                                {/* Media Type Badge */}
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
                                    {block?.videoUrl ? '📹 Video' : block?.youtubeUrl ? '🎬 YouTube' : `🖼️ Image ${imageIndex + 1}/${block?.imageUrls?.length || 0}`}
                                </div>
                            </div>

                            {/* Image Thumbnails (for image blocks only) */}
                            {block?.imageUrls?.length > 1 && !block?.videoUrl && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {block.imageUrls.map((url, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setImageIndex(idx)}
                                            className={`flex-none w-20 aspect-video rounded-lg overflow-hidden transition-all ${idx === imageIndex ? 'ring-2 ring-purple-500' : 'opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Audio Player - Below media, minimal */}
                            {block?.audioUrl && (
                                <AudioPlayer
                                    ref={audioRef}
                                    src={block.audioUrl}
                                    autoPlay={salonModeEnabled}
                                    onDurationChange={(duration) => {
                                        console.log('Audio duration:', duration);
                                    }}
                                />
                            )}
                        </div>

                        {/* RIGHT PANEL: Text Content - SAME FOR ALL MEDIA TYPES */}
                        <div className="min-h-[400px] flex flex-col justify-center">
                            <div className={`rounded-2xl p-8 border backdrop-blur-sm ${colorStyles[currentText.color] || colorStyles.purple}`}>
                                <h3 className="text-lg font-bold uppercase mb-4 flex items-center gap-2 text-white/90">
                                    {currentText.icon} {currentText.label}
                                </h3>
                                <p className="text-lg leading-relaxed text-white">{currentText.content}</p>
                            </div>

                            {/* Text Navigation */}
                            <div className="flex items-center justify-between mt-6">
                                <button
                                    onClick={() => setTextIndex(i => Math.max(0, i - 1))}
                                    disabled={textIndex === 0}
                                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>

                                <div className="flex gap-2">
                                    {textCards.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setTextIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === textIndex ? 'bg-purple-500 w-6' : 'bg-white/30 hover:bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => setTextIndex(i => Math.min(textCards.length - 1, i + 1))}
                                    disabled={textIndex === textCards.length - 1}
                                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* FOOTER - With Salon Mode Progress Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10">
                {/* Salon Mode Progress Bar - Always Visible */}
                <div className="w-full h-2 bg-gray-800">
                    <div
                        className={`h-full transition-all duration-1000 ${isAlmostDone ? 'bg-orange-500 animate-pulse' : 'bg-purple-500'
                            }`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <button
                            onClick={goToPrevBlock}
                            disabled={currentHour === 1 && currentBlockIndex === 0}
                            className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>

                        {/* Center - Block Info + Salon Mode Toggle */}
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-sm text-gray-400">
                                    Hour {currentHour} • Block {currentBlockIndex + 1} of {blocks.length}
                                </div>
                                {salonModeEnabled && (
                                    <div className={`text-xs font-mono ${isAlmostDone ? 'text-orange-400' : 'text-purple-400'}`}>
                                        Auto-advance in {timeDisplay}
                                    </div>
                                )}
                            </div>

                            {/* Salon Mode Toggle - Scissors Button (no jumping, just color change) */}
                            <button
                                onClick={toggleSalonMode}
                                title={salonModeEnabled ? 'Salon Mode ON' : 'Salon Mode OFF'}
                                className={`p-3 rounded-xl transition-colors ${salonModeEnabled
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                <Scissors size={20} />
                            </button>

                            {/* DEV MODE Toggle - Zap Button */}
                            {isDevModeAvailable && (
                                <button
                                    onClick={toggleDevMode}
                                    title={devModeEnabled ? 'DEV MODE ON (Ctrl+Shift+D)' : 'DEV MODE OFF (Ctrl+Shift+D)'}
                                    className={`p-3 rounded-xl transition-colors ${devModeEnabled
                                        ? 'bg-yellow-500 text-black animate-pulse'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                        }`}
                                >
                                    <Zap size={20} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={goToNextBlock}
                            disabled={!canAdvance && !salonModeEnabled && !devModeEnabled}
                            title={devModeEnabled ? 'DEV MODE: Skip enabled' : (!canAdvance ? `Wait ${timeRemainingDisplay} to continue` : 'Next block')}
                            className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 ${canAdvance || salonModeEnabled || devModeEnabled
                                    ? devModeEnabled ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-purple-600 hover:bg-purple-700'
                                    : 'bg-gray-600 cursor-not-allowed opacity-60'
                                }`}
                        >
                            {devModeEnabled ? (
                                <>⚡ SKIP<ChevronRight size={20} /></>
                            ) : !canAdvance && !salonModeEnabled ? (
                                <><Clock size={16} /> {timeRemainingDisplay}</>
                            ) : (
                                <>Next <ChevronRight size={20} /></>
                            )}
                        </button>
                    </div>
                </div>
            </footer >
        </div >
    );
}
