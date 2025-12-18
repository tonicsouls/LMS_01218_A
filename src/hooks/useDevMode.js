/**
 * useDevMode.js - Development Mode Hook
 * Bypasses timer governors for rapid testing
 * 
 * CLEAN REMOVAL: Delete this file and remove all useDevMode imports
 */

import { useState, useEffect } from 'react';

// Toggle this constant for production deploy
const DEV_MODE_AVAILABLE = true; // Set to false to disable dev mode entirely

export function useDevMode() {
    const [devModeEnabled, setDevModeEnabled] = useState(false);

    // Keyboard shortcut: Ctrl+Shift+D to toggle
    useEffect(() => {
        if (!DEV_MODE_AVAILABLE) return;

        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                setDevModeEnabled(prev => {
                    const newState = !prev;
                    console.log(`🔧 DEV MODE: ${newState ? 'ON' : 'OFF'}`);
                    return newState;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        devModeEnabled: DEV_MODE_AVAILABLE && devModeEnabled,
        setDevModeEnabled,
        toggleDevMode: () => setDevModeEnabled(prev => !prev),
        isDevModeAvailable: DEV_MODE_AVAILABLE,
    };
}

/**
 * CLEAN REMOVAL INSTRUCTIONS:
 * 
 * 1. Set DEV_MODE_AVAILABLE = false (disables without code changes)
 * 
 * OR for full removal:
 * 
 * 2. Delete this file: src/hooks/useDevMode.js
 * 3. In UnifiedPlayer.jsx:
 *    - Remove: import { useDevMode } from '../hooks/useDevMode';
 *    - Remove: const { devModeEnabled, toggleDevMode } = useDevMode();
 *    - Remove: any {devModeEnabled && ...} JSX blocks
 *    - Remove: devModeEnabled from canAdvance logic
 */

export default useDevMode;
