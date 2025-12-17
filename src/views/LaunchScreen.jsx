/**
 * LaunchScreen.jsx - Hour Selection & Resume
 * Choose which hour to start or resume progress
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { useProgressStore } from '../stores/ProgressStore';

export default function LaunchScreen() {
    const navigate = useNavigate();
    const { hours, getFormattedTime } = useProgressStore();

    const hourData = [
        { hour: 1, title: 'Sanitation & Safety', blocks: 15, color: 'purple' },
        { hour: 2, title: 'Human Trafficking Awareness', blocks: 10, color: 'red' },
        { hour: 3, title: 'Ethics & Professionalism', blocks: 17, color: 'blue' },
        { hour: 4, title: 'Business Practices', blocks: 17, color: 'green' },
    ];

    const getProgress = (hour) => {
        const data = hours[hour];
        if (!data) return { percent: 0, time: '0:00', completed: false };
        const percent = Math.min(100, (data.total_seconds / 3000) * 100); // 50 min = 3000s
        return {
            percent,
            time: getFormattedTime(hour),
            completed: data.completed || false,
        };
    };

    const colorStyles = {
        purple: 'border-purple-500/40 bg-purple-600/10 hover:bg-purple-600/20',
        red: 'border-red-500/40 bg-red-600/10 hover:bg-red-600/20',
        blue: 'border-blue-500/40 bg-blue-600/10 hover:bg-blue-600/20',
        green: 'border-green-500/40 bg-green-600/10 hover:bg-green-600/20',
    };

    const handleStartHour = (hour) => {
        navigate(`/player?hour=${hour}`);
    };

    const handleResume = () => {
        // Find the first incomplete hour
        for (let i = 1; i <= 4; i++) {
            const progress = getProgress(i);
            if (!progress.completed) {
                navigate(`/player?hour=${i}`);
                return;
            }
        }
        // All complete, start from 1
        navigate('/player?hour=1');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="p-6 border-b border-white/10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Select Your Hour</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        ← Back
                    </button>
                </div>
            </header>

            {/* Hour Cards */}
            <main className="max-w-4xl mx-auto p-6">
                {/* Resume Button */}
                <button
                    onClick={handleResume}
                    className="w-full mb-6 p-4 bg-purple-600/20 border border-purple-500/40 rounded-xl flex items-center justify-between hover:bg-purple-600/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Play size={24} className="text-purple-400" />
                        <div className="text-left">
                            <div className="font-semibold">Resume Where You Left Off</div>
                            <div className="text-sm text-gray-400">Continue your progress</div>
                        </div>
                    </div>
                    <ChevronRight size={24} className="text-purple-400" />
                </button>

                {/* Hour Cards Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                    {hourData.map(({ hour, title, blocks, color }) => {
                        const progress = getProgress(hour);
                        return (
                            <button
                                key={hour}
                                onClick={() => handleStartHour(hour)}
                                className={`p-6 rounded-xl border text-left transition-all ${colorStyles[color]}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Hour {hour}</div>
                                        <h3 className="text-lg font-semibold">{title}</h3>
                                    </div>
                                    {progress.completed ? (
                                        <CheckCircle size={24} className="text-green-400" />
                                    ) : (
                                        <div className="text-sm text-gray-400 flex items-center gap-1">
                                            <Clock size={14} />
                                            {progress.time}
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full bg-${color}-500 transition-all`}
                                        style={{ width: `${progress.percent}%` }}
                                    />
                                </div>

                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>{blocks} lessons</span>
                                    <span>{Math.round(progress.percent)}% complete</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Start Fresh Option */}
                <button
                    onClick={() => {
                        if (confirm('Reset all progress? This cannot be undone.')) {
                            useProgressStore.getState().resetProgress();
                            window.location.reload();
                        }
                    }}
                    className="w-full mt-6 p-4 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
                >
                    <RotateCcw size={18} />
                    Start Fresh (Reset Progress)
                </button>
            </main>
        </div>
    );
}
