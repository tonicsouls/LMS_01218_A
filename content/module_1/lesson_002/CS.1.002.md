# Lesson CS.1.002: Anatomy of a Phish: The Sender ID
**Module 1: Phishing & Social Engineering | Duration: 3 minutes | Citation: SANS Security Awareness**

---

## 📝 ATOM: AUDIO SCRIPT (Persona: Rogue AI)
**Atom ID:** `atom-CS-1-002-script`
**Target Duration:** ~2.5 Minutes

"
[Sound of digital magnifying glass scanning]

**[IMAGE 1: A magnifying glass scanning a stream of binary code]** Let’s dismantle the source. In every social engineering attack, the 'Who' is the most powerful variable. 

**[IMAGE 2: A ghost figure overlapping a CEO's profile picture]** An attacker doesn't want to be a stranger; they want to be a ghost of someone you trust. We call this The Impersonated Sender. 

**[IMAGE 3: A broken chain link with a 'TRUST' label]** Digital communication relies on trust protocols that were never designed for an adversarial environment. Look at the top of your screen. 

**[IMAGE 4: Three notification banners: "IT Support", "Your CEO", "The Security Desk"]** You see a 'Display Name.' It might say 'Microsoft Support.' It might say 'Your CEO.' But names are just metadata. They are cheap. 

**[IMAGE 5: A red "X" over a 'Display Name' and a green check over a 'Header']** The first rule of Signal Recovery: Ignore the Display Name. Verify the Header. 

**[IMAGE 6: A corporate logo next to a 'personal-gmail-address@gmail.com' label]** When we scan the raw traffic, we often find the signal doesn't match the label. An attacker will use a public domain while claiming to be corporate. 

**[IMAGE 7: The word "rnicrosoft" with the "rn" glowing red]** Or worse, they use Typosquatting. They buy a domain that is 99% identical to yours—replacing an 'm' with an 'rn'. 

**[IMAGE 8: A key turning into a snake as it enters a lock]** If you don't look closely, you are inviting the intruder into our system. Stop checking the label. Start checking the address. 

**[IMAGE 9: A green "SIGNAL VERIFIED" stamp appearing on a clean header]** Signal analysis complete.
"

---

## 📸 ATOM: VISUAL SHOT LIST (High Density)
**Midlet Density:** 1 Image per ~21 seconds

1.  **atom-CS-1-002-v1 (0s):** A futuristic magnifying glass hovering over a cascading river of data, highlighting specific "Sender" packets.
2.  **atom-CS-1-002-v2 (20s):** A translucent "ghost" silhouette mimicking the pose and suit of a corporate executive.
3.  **atom-CS-1-002-v3 (40s):** A digital diagram of a handshake where one hand is made of code and the other is a hollow wireframe.
4.  **atom-CS-1-002-v4 (60s):** A row of floating digital ID badges, all with generic titles like "Admin" and "System Account".
5.  **atom-CS-1-002-v5 (80s):** An email client interface where the "From" name is crossed out in red and the underlying email address is circled in green.
6.  **atom-CS-1-002-v6 (100s):** Two domain cards side-by-side: "corporate.com" (Clean) vs. "corporate-support-portal.net" (Suspicious).
7.  **atom-CS-1-002-v7 (120s):** Close up on the text "rnicrosoft.com" - the letters "r" and "n" are vibrating and glowing with a warning red light.
8.  **atom-CS-1-002-v8 (140s):** An overhead view of a digital office floor where a red-pixel door is slowly being opened by a skeletal hand.
9.  **atom-CS-1-002-v9 (160s):** A final, clean verification screen with a large, glowing blue checkmark and the text "ID: AUDITED".

---

## 📺 ATOM: SCROLLING TEXT
**Atom ID:** `atom-CS-1-002-scroll`

1.  Target: Impersonated Sender
2.  Protocol: Ignore Display Name, Check Header
3.  Tactic: Typosquatting (rn vs m, 0 vs o)
4.  Risk: Public domains (Gmail/Yahoo) used for corporate fraud
5.  Status: Identity Audit Active

---

## ❓ ATOM: QUIZ
**Atom ID:** `atom-CS-1-002-quiz`

**Question:** What is the most reliable way to verify the identity of an email sender?
*   A: Click the "Trust this Sender" button.
*   B: Verify the actual email address in the header, not just the display name. (Correct)
*   C: Check if the email has a professional-looking logo.

---

## 📋 METADATA
- **Lesson ID:** CS.1.002
- **Title:** Anatomy of a Phish: The Sender ID
- **Midlet Density:** 9 Visuals
- **Atom Count:** 13 (Script, Scroll, 9 Visuals, Quiz, Audio)
