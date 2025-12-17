# LMS_01218_A Sprint Plan
## Date: 2025-12-17

---

## 🎯 Sprint Overview: Complete Player Governance System

**Total Tasks: 20 points across 5 sprints**

---

## Sprint A: Timer Governors (4 points)
**Goal: Enforce minimum time per block before Next is enabled**

| # | Task | Status |
|---|------|--------|
| A.1 | Create `useGovernor.js` hook with minimum time enforcement | ⬜ |
| A.2 | Calculate minimum time based on content (audio duration OR block count) | ⬜ |
| A.3 | Disable Next button until minimum time reached | ⬜ |
| A.4 | Add visual countdown showing time remaining before Next unlocks | ⬜ |

**Logic:**
```javascript
// If block has audio: minTime = audioDuration
// If no audio: minTime = (60 min / blocksInHour) = 60/15 = 4 min per block
const minTimeSeconds = block.audioDuration || (3600 / blocksInHour);
const canAdvance = elapsedTime >= minTimeSeconds;
```

---

## Sprint B: Autoplay Timing +17% Rule (4 points)
**Goal: Block duration = audio + 17% buffer**

| # | Task | Status |
|---|------|--------|
| B.1 | Update `useSalonMode.js` to calculate +17% duration | ⬜ |
| B.2 | If audio = 100s → block timer = 117s | ⬜ |
| B.3 | Show total block time (not just audio time) in UI | ⬜ |
| B.4 | Test with Block 001 audio (currently ~52 seconds → should be 61s) | ⬜ |

**Formula:**
```javascript
const blockDuration = audioDuration * 1.17; // +17%
```

---

## Sprint C: Image Distribution (4 points)
**Goal: Images evenly distributed across audio duration**

| # | Task | Status |
|---|------|--------|
| C.1 | Calculate image interval: `audioDuration / imageCount` | ⬜ |
| C.2 | Replace fixed 8-second cycling with dynamic timing | ⬜ |
| C.3 | If 3 images over 60s → each shows for 20s | ⬜ |
| C.4 | Sync image transitions with audio progress | ⬜ |

**Formula:**
```javascript
const imageInterval = audioDuration / imageCount;
// 60s audio, 3 images → 20s each
```

---

## Sprint D: Home/Launch Screens (4 points)
**Goal: Create proper course entry point**

| # | Task | Status |
|---|------|--------|
| D.1 | Create `HomeScreen.jsx` - Course welcome/start page | ⬜ |
| D.2 | Create `LaunchScreen.jsx` - Hour selection or resume progress | ⬜ |
| D.3 | Add routes: `/` → Home, `/launch` → Launch, `/player` → Player | ⬜ |
| D.4 | Add navigation buttons (Start Course, Resume, Select Hour) | ⬜ |

---

## Sprint E: Documentation & Sync (4 points)
**Goal: Update all docs with new timing/governance rules**

| # | Task | Status |
|---|------|--------|
| E.1 | Update ARCHITECTURE.md with governor rules | ⬜ |
| E.2 | Update manifest.json schema with duration fields | ⬜ |
| E.3 | Create GOVERNANCE.md explaining timer logic | ⬜ |
| E.4 | Push to GitHub with proper commit messages | ⬜ |

---

## 📊 Execution Order

```
Sprint A (Governors) → Sprint B (+17% timing) → Sprint C (Images) → Sprint D (Screens) → Sprint E (Docs)
```

**Why this order:**
1. A & B fix the timing core (foundation)
2. C depends on A & B working (image sync)
3. D is UI (can be parallel but cleanest last)
4. E documents everything after it works

---

## 🚀 Ready to Execute

**Estimated Time: 2-3 hours**

Start with Sprint A? Type "GO" to begin.
