/**
 * PHOENIX UNIFIED - Progress Store (Governance)
 * Tracks time spent, locks, completion status
 * TDLR Compliance: Minimum 50 minutes per hour
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MINIMUM_MINUTES_PER_HOUR = 50;

export const useProgressStore = create(
    persist(
        (set, get) => ({
            // Student info
            studentName: '',
            studentLicense: '',
            studentEmail: '',

            // Hour progress: { hour_1: { total_seconds: 0, blocks: {...}, completed: false } }
            hours: {
                1: { total_seconds: 0, blocks: {}, completed: false, started_at: null },
                2: { total_seconds: 0, blocks: {}, completed: false, started_at: null },
                3: { total_seconds: 0, blocks: {}, completed: false, started_at: null },
                4: { total_seconds: 0, blocks: {}, completed: false, started_at: null },
            },

            // Current session tracking
            currentHour: null,
            currentBlock: null,
            blockStartTime: null,

            // Actions
            setStudentInfo: (name, license, email) => set({
                studentName: name,
                studentLicense: license,
                studentEmail: email,
            }),

            // Start tracking a block
            startBlock: (hour, blockId) => {
                const now = Date.now();
                set((state) => {
                    const hourData = state.hours[hour] || { total_seconds: 0, blocks: {}, completed: false };
                    const blockData = hourData.blocks[blockId] || {
                        time_seconds: 0,
                        tabs_viewed: [],
                        status: 'in_progress',
                        started_at: null,
                        completed_at: null
                    };

                    // If block wasn't started before, set started_at
                    if (!blockData.started_at) {
                        blockData.started_at = new Date().toISOString();
                    }

                    // If hour wasn't started before, set started_at
                    if (!hourData.started_at) {
                        hourData.started_at = new Date().toISOString();
                    }

                    return {
                        currentHour: hour,
                        currentBlock: blockId,
                        blockStartTime: now,
                        hours: {
                            ...state.hours,
                            [hour]: {
                                ...hourData,
                                blocks: {
                                    ...hourData.blocks,
                                    [blockId]: blockData
                                }
                            }
                        }
                    };
                });
            },

            // Record time when leaving a block
            recordBlockTime: () => {
                const state = get();
                if (!state.blockStartTime || !state.currentHour || !state.currentBlock) return;

                const elapsed = Math.floor((Date.now() - state.blockStartTime) / 1000);

                set((state) => {
                    const hour = state.currentHour;
                    const blockId = state.currentBlock;
                    const hourData = state.hours[hour];
                    const blockData = hourData.blocks[blockId];

                    const newBlockSeconds = (blockData.time_seconds || 0) + elapsed;
                    const newTotalSeconds = hourData.total_seconds + elapsed;

                    return {
                        blockStartTime: null,
                        hours: {
                            ...state.hours,
                            [hour]: {
                                ...hourData,
                                total_seconds: newTotalSeconds,
                                blocks: {
                                    ...hourData.blocks,
                                    [blockId]: {
                                        ...blockData,
                                        time_seconds: newBlockSeconds,
                                    }
                                }
                            }
                        }
                    };
                });
            },

            // Mark a tab as viewed
            markTabViewed: (hour, blockId, tabName) => {
                set((state) => {
                    const hourData = state.hours[hour];
                    const blockData = hourData.blocks[blockId] || { tabs_viewed: [] };

                    if (blockData.tabs_viewed.includes(tabName)) return state;

                    return {
                        hours: {
                            ...state.hours,
                            [hour]: {
                                ...hourData,
                                blocks: {
                                    ...hourData.blocks,
                                    [blockId]: {
                                        ...blockData,
                                        tabs_viewed: [...blockData.tabs_viewed, tabName]
                                    }
                                }
                            }
                        }
                    };
                });
            },

            // Complete a block
            completeBlock: (hour, blockId) => {
                set((state) => {
                    const hourData = state.hours[hour];
                    const blockData = hourData.blocks[blockId];

                    return {
                        hours: {
                            ...state.hours,
                            [hour]: {
                                ...hourData,
                                blocks: {
                                    ...hourData.blocks,
                                    [blockId]: {
                                        ...blockData,
                                        status: 'complete',
                                        completed_at: new Date().toISOString()
                                    }
                                }
                            }
                        }
                    };
                });
            },

            // Check if hour meets minimum time
            isHourTimeComplete: (hour) => {
                const hourData = get().hours[hour];
                const minSeconds = MINIMUM_MINUTES_PER_HOUR * 60;
                return hourData.total_seconds >= minSeconds;
            },

            // Get remaining time for hour (in seconds)
            getRemainingTime: (hour) => {
                const hourData = get().hours[hour];
                const minSeconds = MINIMUM_MINUTES_PER_HOUR * 60;
                return Math.max(0, minSeconds - hourData.total_seconds);
            },

            // Get formatted time for hour
            getFormattedTime: (hour) => {
                const seconds = get().hours[hour]?.total_seconds || 0;
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${mins}:${secs.toString().padStart(2, '0')}`;
            },

            // Complete an hour (only if time requirement met)
            completeHour: (hour) => {
                const state = get();
                if (!state.isHourTimeComplete(hour)) {
                    console.warn(`Hour ${hour} cannot be completed: minimum time not met`);
                    return false;
                }

                set((state) => ({
                    hours: {
                        ...state.hours,
                        [hour]: {
                            ...state.hours[hour],
                            completed: true,
                            completed_at: new Date().toISOString()
                        }
                    }
                }));
                return true;
            },

            // Check if block is locked
            isBlockLocked: (hour, blockId, allBlocks) => {
                // First block of first hour is never locked
                if (hour === 1 && blockId === allBlocks[0]) return false;

                // For now, no locking - can implement stricter logic later
                return false;
            },

            // Reset all progress (for testing)
            resetProgress: () => set({
                hours: {
                    1: { total_seconds: 0, blocks: {}, completed: false, started_at: null },
                    2: { total_seconds: 0, blocks: {}, completed: false, started_at: null },
                    3: { total_seconds: 0, blocks: {}, completed: false, started_at: null },
                    4: { total_seconds: 0, blocks: {}, completed: false, started_at: null },
                },
                currentHour: null,
                currentBlock: null,
                blockStartTime: null,
            }),
        }),
        {
            name: 'phoenix-progress', // localStorage key
        }
    )
);

export default useProgressStore;
