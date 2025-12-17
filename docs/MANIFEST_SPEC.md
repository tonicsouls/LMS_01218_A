# Manifest JSON Specification

## Block Manifest Schema

Each block folder contains a `manifest.json` file with this structure:

```json
{
    "block_id": "block_001",
    "hour": 1,
    "title": "Block Title",
    "duration_minutes": 4,
    "tdlr_citation": "§83.100",
    "media_type": "images | video | quiz",
    "content": {
        "scenario": "Scenario text...",
        "connection": "Connection text...",
        "law": "Law citation text..."
    },
    "assets": {
        "images": ["slide_a.jpeg", "slide_b.jpeg"],
        "audio": "audio.wav",
        "video": null
    },
    "quiz": [
        // Only for quiz blocks
    ]
}
```

## Media Types

| Type | Description | Required Assets |
|------|-------------|-----------------|
| `images` | Image slideshow | `assets.images[]` |
| `video` | Local video file | `assets.video` |
| `quiz` | Interactive quiz | `quiz[]` array |

## Quiz Question Types

### Multiple Choice
```json
{
    "type": "multiple_choice",
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correct": 2,
    "explanation": "Why C is correct..."
}
```

### True/False
```json
{
    "type": "true_false",
    "question": "Statement to evaluate",
    "correct": true,
    "explanation": "Why true/false..."
}
```

### Image Select
```json
{
    "type": "image_select",
    "question": "Which image shows X?",
    "images": [
        "/content/hour_1/block_001/slide_a.jpeg",
        "/content/hour_1/block_001/slide_b.jpeg"
    ],
    "correct": 1,
    "explanation": "Image 2 is correct because..."
}
```

## YouTube Embed

For YouTube blocks, add a `youtube_url` field to assets:

```json
{
    "assets": {
        "images": null,
        "audio": null,
        "video": null,
        "youtube_url": "https://youtu.be/VIDEO_ID"
    }
}
```

## Validation Rules

1. `block_id` must match folder name
2. `hour` must be 1-4
3. `media_type` determines which assets are required
4. Quiz blocks must have `quiz[]` array with at least 1 question
5. Image filenames must match files in the folder

## Last Updated
2025-12-17T16:17:00
