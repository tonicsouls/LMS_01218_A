# GOVERNANCE.md - Timer & Compliance Rules
## Updated: 2025-12-17 19:38

---

## Overview

This document explains the timer governance system that enforces TDLR compliance requirements for CE course completion.

---

## 1. Timer Governor Rules

### Minimum Time Per Block

The system calculates minimum required time before allowing a student to advance:

```javascript
// Priority 1: If block has audio, use audio duration
if (audioDuration > 0) {
    minTime = audioDuration;
}

// Priority 2: Fallback formula
// 60 minutes / blocks in hour = min per block
// Example: 60min / 15 blocks = 4 minutes each
minTime = 3600 / blocksInHour; // in seconds
```

### Next Button Behavior

| State | Button Appearance | Behavior |
|-------|------------------|----------|
| `canAdvance = false` | Gray, disabled, shows countdown | Cannot click |
| `canAdvance = true` | Purple, enabled, shows "Next" | Can advance |
| `salonModeEnabled` | Purple, auto-advances | Hands-free |
| `devModeEnabled` | ⚡ Yellow, shows "SKIP" | Instant advance |

---

## 2. +7% Buffer Rule

All block durations include a **7%** buffer for reading/comprehension:

```javascript
const BUFFER_PERCENT = 0.07; // 7% extra time
const blockDuration = audioDuration * (1 + BUFFER_PERCENT);
```

### Examples

| Audio Duration | +7% Buffer | Total Block Time |
|----------------|------------|------------------|
| 53 seconds | +3.7 seconds | 56.7 seconds |
| 100 seconds | +7 seconds | 107 seconds |
| 60 seconds | +4.2 seconds | 64.2 seconds |

---

## 3. Image Distribution

Images are distributed **proportionally** across the **raw audio duration** (not buffered time):

```javascript
// Remove buffer to get raw audio time
const rawAudioTime = blockTotalTime / 1.07;

// Distribute images across raw audio
const imageInterval = rawAudioTime / imageCount;

// 53s audio / 3 images = ~17.6s per image
```

### Key Behavior

- **NO LOOPING**: Images stop on the last one
- **Buffer provides reading time** after last image
- **Only runs in Salon Mode**

### Examples

| Audio | Images | Interval | Stops At |
|-------|--------|----------|----------|
| 53s | 3 | 17.6s | Image 3 |
| 100s | 4 | 25s | Image 4 |
| 60s | 5 | 12s | Image 5 |

### Timeline Example (3 images, 53s audio)

```
0.0s  → Image 1 shown
17.6s → Image 2 shown
35.2s → Image 3 shown (STOPS HERE - no loop)
53.0s → Audio ends, 7% buffer begins
56.7s → Block timer ends, can advance
```

---

## 4. DEV MODE

For development/testing, DEV MODE bypasses all timers:

### Activation
- **Keyboard**: Ctrl+Shift+D
- **Button**: Click ⚡ Zap icon in footer

### Behavior
- Button turns yellow with pulse animation
- Shows "⚡ SKIP" instead of countdown
- Allows immediate advancement

### Production Disable

```javascript
// In src/hooks/useDevMode.js line 10:
const DEV_MODE_AVAILABLE = false; // Hides toggle entirely
```

---

## 5. TDLR Compliance

### Requirements

- **4 hours minimum** total course time
- **50 minutes minimum** per hour (with 10 min buffer for navigation)
- Student must view all content tabs (Scenario, Connection, Law)
- Quiz questions must be answered

### Tracking

The `ProgressStore` tracks:
- Total seconds per hour
- Blocks completed per hour
- Tabs viewed per block
- Quiz answers

---

## 6. Salon Mode (Auto-Progression)

When enabled (scissors button):
- Audio auto-plays
- Images auto-cycle proportionally (stops on last)
- Auto-advances to next block when timer completes
- Respects +7% buffer

---

## Hook Reference

### useGovernor.js

```javascript
const {
    canAdvance,           // Boolean: can student advance?
    timeRemaining,        // Seconds until can advance
    timeRemainingDisplay, // Formatted "M:SS"
    progressPercent,      // 0-100 progress
} = useGovernor(block, audioRef, blocksInHour);
```

### useSalonMode.js

```javascript
const {
    salonModeEnabled,     // Boolean: auto-mode on?
    toggleSalonMode,      // Function to toggle
    blockTimeRemaining,   // Seconds in current block
    blockTotalTime,       // Total seconds (with 7% buffer)
    progressPercent,      // 0-100 progress
    isAlmostDone,         // True when <10s remaining
} = useSalonMode(block, audioRef, onAutoAdvance);
```

### useDevMode.js

```javascript
const {
    devModeEnabled,       // Boolean: dev mode on?
    toggleDevMode,        // Function to toggle
    isDevModeAvailable,   // Boolean: feature available?
} = useDevMode();
```

---

## Change Log

| Date | Change |
|------|--------|
| 2025-12-17 19:38 | Updated buffer from 17% to 7%, added DEV MODE, image no-loop |
| 2025-12-17 17:05 | Initial document creation |
