# Governance & Timer Rules

## TDLR Compliance Requirements

| Requirement | Implementation |
|-------------|----------------|
| Minimum 50 minutes per hour | `ProgressStore.MINIMUM_MINUTES_PER_HOUR = 50` |
| Forward-only time counting | Going backward doesn't add to total |
| Block completion required | All text tabs (scenario, connection, law) must be viewed |

## Salon Mode (Auto-Progression)

**Purpose:** Hands-free learning for stylists doing hair while taking CE course.

### Timer Calculation

```javascript
// Block time = base time + 15% buffer
const totalTime = baseTime * 1.15;
```

### Base Time Rules

| Content Type | Base Time |
|--------------|-----------|
| Audio block | Audio duration |
| Video block | Video duration (or 120s default) |
| YouTube block | 120s default |
| Image block | 60s per block |
| Quiz block | 60s per question |

### Image Auto-Cycling

When Salon Mode is ON:
- Images cycle every 8 seconds
- Continues until block auto-advances

### Quiz Auto-Answer

When Salon Mode is ON:
- 60 seconds per question
- If no answer: reveal correct answer + 3s pause, then advance
- Timer continues running (time still counts)

## Video/Audio Pause Behavior

| Action | Timer Behavior |
|--------|---------------|
| User pauses video | Timer CONTINUES (reading material counts) |
| User pauses audio | Timer CONTINUES |
| Salon Mode enabled + pause | Timer CONTINUES |

**Rationale:** User may be reading the text content while media is paused.

## Progress Persistence

All progress is saved to `localStorage`:

```javascript
// Key: phoenix-lms-progress
{
    hours: {
        1: { total_seconds: 1500, blocks: {...} },
        2: { total_seconds: 0, blocks: {...} }
    }
}
```

## Block Locking (Future)

Planned implementation:
- Next block disabled until current block complete
- "Complete" = all 3 text tabs viewed + minimum time spent
- Can be bypassed in dev mode

## Last Updated
2025-12-17T16:17:00
