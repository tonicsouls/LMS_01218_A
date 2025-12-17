# GOVERNANCE.md - Timer & Compliance Rules

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

---

## 2. +17% Buffer Rule

All block durations include a 17% buffer for reading/comprehension:

```javascript
const BUFFER_PERCENT = 0.17; // 17% extra time (superior timing)
const blockDuration = audioDuration * (1 + BUFFER_PERCENT);
```

### Examples

| Audio Duration | +17% Buffer | Total Block Time |
|----------------|-------------|------------------|
| 52 seconds | +9 seconds | 61 seconds |
| 100 seconds | +17 seconds | 117 seconds |
| 60 seconds | +10 seconds | 70 seconds |

---

## 3. Image Distribution

Images are distributed **proportionally** across the block duration:

```javascript
const imageInterval = blockTotalTime / imageCount;
// 60 seconds / 3 images = 20 seconds per image
```

### Examples

| Block Duration | Image Count | Time Per Image |
|----------------|-------------|----------------|
| 60s | 3 | 20s each |
| 117s | 4 | 29s each |
| 70s | 5 | 14s each |

---

## 4. TDLR Compliance

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

## 5. Salon Mode (Auto-Progression)

When enabled (scissors button):
- Audio auto-plays
- Images auto-cycle proportionally
- Auto-advances to next block when timer completes
- Still respects +17% buffer

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
    progressPercent,      // 0-100 progress
    isAlmostDone,         // True when <10s remaining
} = useSalonMode(block, audioRef, onAutoAdvance);
```

---

## Last Updated
2025-12-17T17:05:00
