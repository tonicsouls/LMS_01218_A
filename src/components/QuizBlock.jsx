/**
 * PHOENIX UNIFIED - Quiz Component
 * Handles multiple_choice, true_false, and image_select quiz types
 * 60-second timer per question with auto-advance
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Clock, ArrowRight } from 'lucide-react';

const QUESTION_TIME_LIMIT = 60; // seconds

export default function QuizBlock({ quiz, onComplete, onQuestionAnswered }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
    const [answers, setAnswers] = useState([]);

    const question = quiz?.[currentQuestion];
    const isLastQuestion = currentQuestion >= (quiz?.length || 0) - 1;

    // Timer countdown
    useEffect(() => {
        if (showResult) return; // Don't count while showing result

        if (timeLeft <= 0) {
            // Time's up - auto-reveal answer
            handleTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, showResult]);

    // Reset timer when question changes
    useEffect(() => {
        setTimeLeft(QUESTION_TIME_LIMIT);
        setSelectedAnswer(null);
        setShowResult(false);
    }, [currentQuestion]);

    const handleTimeUp = useCallback(() => {
        // Auto-select nothing, show correct answer
        setShowResult(true);
        setAnswers(prev => [...prev, {
            questionIndex: currentQuestion,
            answered: false,
            correct: false,
            timedOut: true
        }]);

        // Auto-advance after 3 seconds
        setTimeout(() => {
            if (!isLastQuestion) {
                setCurrentQuestion(q => q + 1);
            } else {
                onComplete?.(answers);
            }
        }, 3000);
    }, [currentQuestion, isLastQuestion, answers, onComplete]);

    const handleAnswer = (answerIndex) => {
        if (showResult) return;

        setSelectedAnswer(answerIndex);
        setShowResult(true);

        const isCorrect = answerIndex === question.correct;
        const newAnswer = {
            questionIndex: currentQuestion,
            answered: true,
            selected: answerIndex,
            correct: isCorrect,
            timedOut: false
        };

        setAnswers(prev => [...prev, newAnswer]);
        onQuestionAnswered?.(newAnswer);
    };

    const handleNext = () => {
        if (!isLastQuestion) {
            setCurrentQuestion(q => q + 1);
        } else {
            onComplete?.(answers);
        }
    };

    if (!question) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                No quiz questions available
            </div>
        );
    }

    // Render based on question type
    const renderQuestionContent = () => {
        switch (question.type) {
            case 'multiple_choice':
                return (
                    <div className="space-y-3">
                        {question.options.map((option, idx) => {
                            const isSelected = selectedAnswer === idx;
                            const isCorrect = idx === question.correct;
                            let buttonClass = "w-full text-left p-4 rounded-xl border transition-all ";

                            if (showResult) {
                                if (isCorrect) {
                                    buttonClass += "bg-green-600/30 border-green-500 text-white";
                                } else if (isSelected && !isCorrect) {
                                    buttonClass += "bg-red-600/30 border-red-500 text-white";
                                } else {
                                    buttonClass += "bg-white/5 border-white/10 text-gray-400";
                                }
                            } else {
                                buttonClass += isSelected
                                    ? "bg-purple-600/30 border-purple-500 text-white"
                                    : "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={showResult}
                                    className={buttonClass}
                                >
                                    <span className="font-medium mr-3 text-gray-400">
                                        {String.fromCharCode(65 + idx)}.
                                    </span>
                                    {option}
                                    {showResult && isCorrect && (
                                        <Check className="inline ml-2 text-green-400" size={18} />
                                    )}
                                    {showResult && isSelected && !isCorrect && (
                                        <X className="inline ml-2 text-red-400" size={18} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                );

            case 'true_false':
                return (
                    <div className="flex gap-4">
                        {[true, false].map((value) => {
                            const isSelected = selectedAnswer === value;
                            const isCorrect = value === question.correct;
                            let buttonClass = "flex-1 p-6 rounded-xl border text-xl font-bold transition-all ";

                            if (showResult) {
                                if (isCorrect) {
                                    buttonClass += "bg-green-600/30 border-green-500 text-green-400";
                                } else if (isSelected && !isCorrect) {
                                    buttonClass += "bg-red-600/30 border-red-500 text-red-400";
                                } else {
                                    buttonClass += "bg-white/5 border-white/10 text-gray-500";
                                }
                            } else {
                                buttonClass += "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30";
                            }

                            return (
                                <button
                                    key={String(value)}
                                    onClick={() => handleAnswer(value)}
                                    disabled={showResult}
                                    className={buttonClass}
                                >
                                    {value ? 'TRUE' : 'FALSE'}
                                </button>
                            );
                        })}
                    </div>
                );

            case 'image_select':
                return (
                    <div className="grid grid-cols-3 gap-4">
                        {question.images.map((imgUrl, idx) => {
                            const isSelected = selectedAnswer === idx;
                            const isCorrect = idx === question.correct;
                            let containerClass = "relative aspect-square rounded-xl overflow-hidden border-4 cursor-pointer transition-all ";

                            if (showResult) {
                                if (isCorrect) {
                                    containerClass += "border-green-500 ring-4 ring-green-500/30";
                                } else if (isSelected && !isCorrect) {
                                    containerClass += "border-red-500 ring-4 ring-red-500/30";
                                } else {
                                    containerClass += "border-transparent opacity-50";
                                }
                            } else {
                                containerClass += isSelected
                                    ? "border-purple-500 ring-4 ring-purple-500/30"
                                    : "border-transparent hover:border-white/30";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={showResult}
                                    className={containerClass}
                                >
                                    <img
                                        src={imgUrl}
                                        alt={`Option ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {showResult && isCorrect && (
                                        <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                                            <Check className="text-white" size={48} />
                                        </div>
                                    )}
                                    {showResult && isSelected && !isCorrect && (
                                        <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                                            <X className="text-white" size={48} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                );

            default:
                return <div>Unknown question type: {question.type}</div>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Timer and Progress */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-400">
                    Question {currentQuestion + 1} of {quiz.length}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${timeLeft <= 10 ? 'bg-red-600/30 text-red-400' : 'bg-purple-600/20 text-purple-400'
                    }`}>
                    <Clock size={16} />
                    <span className="font-mono font-bold">{timeLeft}s</span>
                </div>
            </div>

            {/* Question */}
            <h2 className="text-xl font-semibold mb-6 text-white">
                {question.question}
            </h2>

            {/* Answer Options */}
            {renderQuestionContent()}

            {/* Explanation (shown after answer) */}
            {showResult && question.explanation && (
                <div className="mt-6 p-4 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-200">
                    <strong>💡 Explanation:</strong> {question.explanation}
                </div>
            )}

            {/* Next Button */}
            {showResult && (
                <button
                    onClick={handleNext}
                    className="mt-6 w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                    {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
                    <ArrowRight size={20} />
                </button>
            )}
        </div>
    );
}
