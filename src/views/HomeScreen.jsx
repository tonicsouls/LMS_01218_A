/**
 * HomeScreen.jsx - Course Welcome Screen
 * Entry point for CE Course
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Award, Clock } from 'lucide-react';

export default function HomeScreen() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-2xl text-center">
                    {/* Logo/Branding */}
                    <div className="mb-8">
                        <div className="w-24 h-24 mx-auto bg-purple-600/30 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-purple-500/30">
                            <BookOpen size={48} className="text-purple-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Texas Cosmetology
                            <span className="block text-purple-400">CE Course</span>
                        </h1>
                        <p className="text-xl text-gray-400">
                            4-Hour Continuing Education for Licensed Professionals
                        </p>
                    </div>

                    {/* Course Info Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                            <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">4</div>
                            <div className="text-sm text-gray-400">Hours</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                            <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">59</div>
                            <div className="text-sm text-gray-400">Lessons</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">TDLR</div>
                            <div className="text-sm text-gray-400">Approved</div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={() => navigate('/launch')}
                        className="group px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-xl font-semibold transition-all duration-300 flex items-center gap-3 mx-auto hover:scale-105"
                    >
                        <Play size={24} className="group-hover:translate-x-1 transition-transform" />
                        Start Course
                    </button>

                    <p className="mt-4 text-sm text-gray-500">
                        TDLR Provider #12345 • Course #CE-2025-001
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-6 border-t border-white/10">
                <p className="text-sm text-gray-500">
                    © 2025 Empowered Pro • All Rights Reserved
                </p>
            </footer>
        </div>
    );
}
