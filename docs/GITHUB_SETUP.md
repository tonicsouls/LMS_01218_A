# GitHub Setup Instructions

## Step 1: Create Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `LMS-Phoenix-CE-Course` (or your preferred name)
3. Set to **Public** or **Private** as you prefer
4. Do NOT initialize with README (we already have one)
5. Click **Create repository**

## Step 2: Connect Local Repo to GitHub

Run these commands in the LMS_01218_A folder:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/tonicsouls/LMS-Phoenix-CE-Course.git

# Push to GitHub
git push -u origin master
```

## Step 3: Verify

After pushing, your repo will be at:
https://github.com/tonicsouls/LMS-Phoenix-CE-Course

---

## What's Already Committed (43 files):

- ✅ UnifiedPlayer.jsx (main player)
- ✅ AudioPlayer.jsx
- ✅ QuizBlock.jsx
- ✅ useSalonMode.js (auto-advance)
- ✅ useBlock.js (data loading)
- ✅ ProgressStore.js
- ✅ Hour 1: Blocks 001-005 with manifests
- ✅ Hour 2: Blocks 000-002 with video
- ✅ All documentation
