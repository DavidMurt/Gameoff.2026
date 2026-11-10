# Game Off 2026 — Ideas

**Theme:** Shift

**Chosen direction:** Night Shift (working title), described below. The other ideas from brainstorming are kept further down for reference.

Constraints to keep in mind: HD resolution (1920×1080) with simple graphics, Phaser 4, roughly one month, small team.

---

## Night Shift

*A forensic puzzle game played entirely inside a broken security console.*

### Pitch

You are the IT manager of a secret government facility. You come in for the morning shift after something terrible happened overnight. The facility's computer systems are corrupted, the main security suite is down, and all you have is the **backup emergency GUI** of the facility's custom-built security solution. Your job is to dig through what's left of the logs and work out what happened on the night shift, who was involved, and how they did it.

The **video system is offline** and unlikely to be recovered. What survives is the security system's **AI transcription log**: a text record of the conversations in each room, with timestamps. The AI is imperfect, and parts of the log are corrupted, so the transcripts are the richest source of evidence and also the least reliable.

It's a **supernatural mystery**. The facility studies strange artifacts of supernatural origin, and one of them, Artifact-01, did things that night that show up in the logs and in what people did. The full story design is in [story.md](story.md).

### How it uses the theme

- **Time:** the incident happened on the *night shift*, and you're piecing it together at the start of yours. The shift handover is the framing device.
- **Shifted timestamps:** the logs have lost their timestamps. The player shifts each one back to where it belongs in the night, using events heard in more than one room (see *Working out the timestamp*).
- **Shifting blame:** the obvious evidence points at one person. Someone has shifted the blame on purpose.

### Core loop

The game is about **placing logs**. Each log is a fragment of audio transcript that has lost its room and its timestamp. The player works out where and when each one belongs.

1. **Read** an unplaced log from the current batch.
2. **Cross-reference** it with logs that are already placed, the proximity data on the map, and the badge log.
3. **Place** the log on a room timeline: move it to the right **room** and **time**.
4. **Lock** the room and the time. Once both are locked, the system checks the placement, and if both are right the log is marked **correct**.
5. When enough logs are correct, the IT department **decrypts the next batch** and sends it over.
6. When **every log** has been placed correctly, the game is complete and the mystery is solved.

### Progression: log batches

The player shouldn't be hit with everything at once, so logs arrive in **batches**.

- The game starts with a small first batch, which doubles as the tutorial.
- When the player has correctly placed a **set number** of logs from the current batch, the IT department decrypts the next batch and sends it over. The player doesn't have to finish a whole batch to move on, so one stubborn log can't block progress.
- Each batch reveals more of the night: more rooms, more people and more of what happened.
- **Batch sizes and unlock thresholds** may differ per batch. They'll be decided during the story design.
- **The timeline expands as the game goes on.** The game starts with only **hour 6** of the shift. By the end, **hours 1 to 9** are available. There is no hour 10.
- **Hour 9 is a bonus hour (decided).** Its logs (police interviews) are released **one at a time** instead of in a batch, and the **last log** ends the game. Which hours open up when is decided by the story. The timelines in every panel only show the hours unlocked so far.
- The game ends when **all logs** are placed correctly. The full timeline is then complete, and the mystery is solved.

This gives us direct control over pacing and the order in which the story is revealed: what's in each batch decides what the player learns and when.

Rough shape:

1. **Batch 1 (tutorial):** a few logs, most with obvious clues (a room named out loud, a time on a PA announcement). Teaches placing, verifying and filling in the badge log.
2. **Middle batches:** more rooms and people, and placement depends more on cross-referencing logs that are already correct.
3. **Final batches:** logs from the heart of the incident, the hardest to place, which reveal the secrets (see [story.md](story.md)).
4. **End:** every log is correct, and the night can be replayed in full.

#### What a log looks like

A **log** is made up of one or more **log entries**.

- The log has a **room** and a **timestamp**. These are what the player has to work out.
- Each entry has an **offset in minutes** relative to the log's timestamp, so the entries keep their order and spacing even though the real time is unknown.
- A speech entry has a badge ID. A sound entry, such as `[LOUD CRASH]`, has no badge ID.
- A minute can hold **several entries**, which share the same offset and keep the order they're listed in. For example, a crash and someone reacting to it.

Example of an unplaced log:

```
<1 ID#4444> I am saying some things.
<2 ID#5555> I am responding to what you are saying.
<3> [LOUD CRASH]
<3 ID#4444> What was that noise?
```

Once the player places it, for example in room `C1-02` at 02:30, the offsets turn into real times. The entries then appear in that room's viewer panel at those times, and their badge IDs show up on the map:

```
02:31  <ID#4444> I am saying some things.
02:32  <ID#5555> I am responding to what you are saying.
02:33  [LOUD CRASH]
02:33  <ID#4444> What was that noise?
```

Filled-in names still appear next to the IDs, for example `<3 ID#4444 - Bob>`.

Possible data shape for the code:

```ts
interface LogEntry {
    offset: number;     // minutes after the log's timestamp
    badgeId?: string;   // missing for sound events
    text: string;       // speech, or a sound such as "[LOUD CRASH]"
}

interface Log {
    id: string;
    batch: number;          // which batch it arrives in
    room: string;           // the correct room ID (hidden from the player)
    timestamp: number;      // the correct start time, in minutes; always a multiple of 15 (hidden from the player)
    duration: number;       // length in minutes; always a multiple of 15
    entries: LogEntry[];
}

// What the player has done with each log, saved separately from the story data.
interface LogState {
    logId: string;
    room?: string;          // the room column the log is in
    systemTime: number;     // where the log's top edge is, in minutes
    roomLocked: boolean;    // can only move vertically
    timeLocked: boolean;    // can only move horizontally
    verified: boolean;      // false until checked; "not verified" if both locks are set and this is false
    correct: boolean;       // only ever true when both locks are set; permanent once true
}
```

- **Every log arrives with no placement information.** All new logs appear in the unplaced column with no room and no time.

#### System time

**System time** is the single clock that the whole GUI is synchronised to. Scrolling the mouse wheel (or swiping) up or down moves system time, and every GUI element moves with it: the map, the viewer panels and the timelines.

#### Viewer panels and timelines

There are two **viewer panels** (1 and 2), and each one is set to a room **independently**.

- The player **selects a room** for each viewer panel.
- The viewer panel then shows **all the logs in that room**, bound to system time.
- The **timeline panel** shows a vertical timeline for each viewer panel's room, covering the whole night. Every log in that room appears on it as a **block**: its top edge is its start time, and its height is how long it lasts.
- The **room/timeline panel** shows a timeline for **every room**, side by side. This is where the player drags logs between rooms and along the night.
- Moving a block **vertically** changes its time. Moving it **horizontally** into another room's column changes its room.

#### 15-minute slots

- Logs can only be placed on **15-minute intervals** (00, 15, 30 or 45 past the hour). Blocks snap to the grid when dragged.
- Every log's total length is a **multiple of 15 minutes**.
- The entries inside a log still use **minute offsets**, so a 30-minute log has entries at offsets 0 to 29.
- This keeps dragging easy on overview-scale timelines (each 15-minute slot is about 30 pixels tall in the mockup), and gives the story clean blocks to write in.

#### Log states

Every log has a **correctness** state and **two independent locks**.

**Correctness**

- **Unknown:** the player hasn't yet put the log in the correct room at the correct time. Every log starts as unknown.
- **Correct:** the log is in the correct room at the correct system time.

**Locks**

The two locks constrain how the block can move on the timelines:

| Room lock | Time lock | How the block can move |
|---|---|---|
| Unlocked | Unlocked | Freely, in any direction |
| **Locked** | Unlocked | **Vertically only:** along its room's timeline, to change its time |
| Unlocked | **Locked** | **Horizontally only:** between rooms, keeping its time |
| **Locked** | **Locked** | Not at all. The log is **checked**. |

- Each lock can be set and released **independently**, in any order.
- The check only happens once **both** locks are set.
- If the check passes, the log is marked **correct**. Both locks then become permanent; a correct log can never be unlocked.
- If the check fails, the log shows **not verified** and stays **unknown**. The player can release either lock and keep adjusting.

#### Placing and locking a log

A typical placement:

1. The player is fairly sure which room a log belongs in, so they drag it to that room's column and **lock the room**.
2. They slide it up and down that room's timeline, lining up shared events with other logs, until the time looks right.
3. They **lock the time**. Both locks are now set, so the system runs a short **check**, lasting a second or two.
4. If both the room and the time are right, the log is marked **correct**. Otherwise it shows **not verified**. The player might release the room lock and slide the log sideways into another room at the same time, which is useful when they're sure of the time but not the room.

Other notes:

- Logs can only go in rooms with an **audio sensor**, which narrows down the options.
- A not-verified log still sits in the timeline, which can help the player work out what's wrong with it.
- **Preventing guessing:** once the player has locked both the time and the room, a short **check time** of a second or two runs before the result appears. It can be presented as the system "verifying" the log, with a small progress indicator.
- **Guessing risk with 15-minute slots:** even the full 8 hours in the game have only 32 slots per room. With 5 rooms that's 160 positions, so at 2 seconds per check, trying every one takes about 5 minutes per log. Guessing is much more practical than with minute-level placement. Options if it becomes a problem:
  - Locking the room first cuts it to 32 tries per log, so consider making the check longer.
  - Make the check time grow with each failed check on the same log, for example 2s, 4s, 8s.
  - Use more rooms, or a longer night.
  - Accept it: brute force is tedious, and most players won't do it.
- **Decision for now:** leave it as is, and revisit if playtesting shows players guessing.

#### Working out the timestamp: shared events

The main way to date a log is to find an **event that was heard in more than one room**. For example, a loud bang is transcribed in the room where it happened, and more faintly in a neighbouring room. If one of those logs is already correct, the bang in the new log must have happened at the same time.

```
CORRECT: C1-02                      LOG BEING PLACED
02:31  <ID#4553> Hand me that.      <1 ID#2210> ...
02:32  [LOUD BANG]              <-> <2> [DISTANT THUD]
02:32  <ID#4553> What was that?     <2 ID#2210> Did you hear that?
       The thud is at offset 2, so the unplaced log's timestamp is 02:30
```

**Shared events to build the night around**

- Loud sounds: bangs, crashes, breaking glass, gunshots
- Alarms, sirens and lockdown klaxons
- Facility-wide PA announcements, which are heard in every room with audio
- Power cuts or the lights failing, which people react to out loud
- A phone or radio call where each end is in a different room
- People moving: someone says "heading to the lab now", and their badge appears in the lab's proximity data a minute later

The same event should be transcribed differently depending on the room. The source room gets `[LOUD BANG]`, while a room further away might get `[DISTANT THUD]` or just someone asking "What was that?". Recognising that these are the same event is part of the puzzle.

Other ways to date a log:

- Someone mentions the time, or a scheduled event ("the 3 o'clock patrol")
- Proximity data: the badge IDs in a log must all have been in that room at that time
- Conversation order: a log that answers a question asked in a correct log comes just after it

#### Working out the room

- People name the room or what's in it ("put it back in the vault")
- Proximity data: which room had exactly these badge IDs at that time
- Room-specific sounds, such as server fans, a freezer door or a containment alarm
- Room descriptions the player has already filled in

#### The three keys

Placing logs relies on three kinds of knowledge that the player builds up as they go.

#### Key 1: People (badge IDs)

- Every member of the facility has a **badge ID**: a random set of digits that is unique to them (for example `#4553`).
- The AI identifies each speaker by their **voice** and tags the statement with that person's badge ID. Proximity sensors, on the other hand, detect the **physical badge**, which can be lost or stolen (see *Secrets* in [story.md](story.md)). The logs only show IDs, never names.
- The player fills in the **badge log** with each ID's **name** and **role**.
- As soon as a name is filled in, it appears next to that ID everywhere the ID shows up, including transcripts, proximity data and any other section. For example:

  ```
  Before:  02:14  <ID #4553> What was that noise?
  After:   02:14  <ID #4553 - Bob> What was that noise?
  ```

- This makes the logs steadily easier to read as the player makes progress, which is a reward in itself. A wrong guess also spreads everywhere, and the player may only notice it when the logs stop making sense.
- Clues come from how people talk: names used in conversation, job talk, who gives orders, and which rooms they're in.
- **Unknown voices:** when the AI hears a voice it doesn't recognise, it assigns a **random ID** that doesn't belong to any badge. That person never appears on the map. An ID that matches nobody looks like a hook for the supernatural, but it could just be someone who isn't staff, like the delivery driver (see [story.md](story.md)).

#### Key 2: Rooms (room IDs)

- The system knows rooms only by **room ID** (for example `B2-07`).
- The player adds a **description** to each room, such as "Server room", "Containment vault 3" or "Canteen".
- Clues come from what's said in the room, which people go there, and which artifacts are kept there.

#### Key 3: Sensors

Each room can have **none, one or both** of two sensor types:

| Sensor | What it records | What it can't tell you |
|--------|-----------------|------------------------|
| **Audio** | What was said. The AI transcribes it and tags each line with a badge ID. | Who was in the room but silent |
| **Proximity** | Which badge IDs were in the room, and when | What anyone said or did |

- A room with **both** sensors gives the fullest picture. With **audio only**, you know what was said but can't confirm who was there. With **proximity only**, you know who was there but not what happened. A room with **neither** is a blind spot, and you can only infer what happened there from other rooms.
- Each sensor has a state: **online**, **corrupted** (partial or garbled data) or **broken** (no data).
- Contradictions between the two sensor types are prime clues. For example, a voice transcribed in a room where proximity shows nobody, or two badge IDs present but only one ever speaks.

#### Design notes

- **Secrets:** some contradictions in the logs aren't errors. They have a cause the player has to deduce, such as radios or an artifact's effect. See *Secrets* in [story.md](story.md).

### The emergency GUI

The whole game lives on one screen: a cut-down security console at **HD resolution (1920×1080)**. The graphics are deliberately simple: flat panels, lines, boxes and text. The high resolution keeps the logs readable and leaves enough room for the map and both viewer panels side by side. The fictional product needs a name; placeholders are **WARDEN**, **SENTINEL/ER** or **BASTION Recovery Mode**.

#### Everything is tied to system time

The interface is always looking at **one moment in system time**. The player changes it with the **mouse wheel** (or by swiping), and every part of the screen updates to match (see *System time*). Scrubbing back and forth through the night is the main way the player explores.

#### Screen layout

The screen is made of named panels, from left to right:

| Panel | Width in the mockup | What it holds |
|---|---|---|
| **Map panel** or **room/timeline panel** | 874px (about 45%) | They share the left column; the player swaps between them |
| **Viewer 1 panel** | 412px | The logs in the room selected for viewer 1 |
| **Viewer 2 panel** | 412px | The logs in the room selected for viewer 2 |
| **Timeline panel** | 154px | Timelines for the rooms in viewer 1 and viewer 2 |

The viewer panels are deliberately narrow, so the left column has room for the facility map and for many room timelines.

Mockups:

- `docs/gui-mockup-map.png`: the left column showing the map panel (the default)
- `docs/gui-mockup-rooms.png`: the left column swapped to the room/timeline panel

The mockups are generated by `docs/gui-mockup.py`, based on the rough sketch in `docs/gui-mockup.webp`.

**Left column: swapping between the map panel and the room/timeline panel**

- Only one of the two is shown at a time. The game starts on the map panel.
- A swap button at the top of the column switches between them: **⇄ ALL ROOMS** on the map panel, and **⇄ MAP** on the room/timeline panel.

**Selecting rooms by clicking**

In both the map panel and the room/timeline panel:

- **Left click** a room to show it in the **viewer 1 panel**.
- **Right click** a room to show it in the **viewer 2 panel**.

Rooms can also be picked from the room selector in each viewer panel's header.

**Map panel**

- **Map** (top): a simplified geometric plan of the facility, with rooms as boxes linked by corridors.
  - **Requirement:** the facility layout is bigger than the panel, so the player must be able to **scroll** around it and **zoom** in and out.
  - At the current system time, each room with a **proximity sensor** shows the badge IDs inside it. As the player scrubs through time, IDs move from room to room as people move around the facility.
  - Rooms without a working proximity sensor show nothing, or a `??`, so the player has to infer who was there.
  - The rooms currently shown in viewer 1 and viewer 2 are marked with those viewers' colours.
  - At HD there should be room to list the IDs (and names, once filled in) directly inside each room box. Very busy rooms could fall back to a count, with the full list on hover.
- **Tabs** (bottom):
  - **Users:** the badge log, with badge ID, name and role.
  - **Rooms:** the room registry, with room ID, the player's description, and the room's sensors (audio and proximity) and their state.
  - **Symbols:** reserved for future development. Ignore it for now.

**Viewer 1 and viewer 2 panels**

- Each viewer panel has a **room selector** in its header. The two are set independently, so the player can compare any two rooms at the same moment.
- The viewer panel shows every log in the selected room, bound to system time. The current minute is always **highlighted in the centre**, and the text scrolls as system time changes.
- The header also shows the **selected log**, with its status, and **Lock room** and **Lock time** buttons for it. The selected log is whichever log in that room is at the **current system time**. If there's no log at that time, the lock buttons are disabled. An unplaced log opened in a viewer is the selected log.
- Speaker labels use the badge ID, plus the name once the player has filled it in (`<ID#4553 - Bob>`).
- A room with no audio sensor, or with a broken one, shows a "no signal" or corrupted state instead of lines.

**Timeline panel (right edge)**

- One vertical timeline for each viewer panel's room, covering the whole night.
- It's **dynamic**: when the player picks a different room in viewer 1 or 2, the matching timeline switches to that room. It shows the same as that room's column in the room/timeline panel.
- Logs appear as blocks. Logs with both locks set are drawn solid, and logs that aren't fully locked are drawn dashed.
- A horizontal line marks the current **system time**. Scrolling the mouse wheel moves it, and both viewer panels follow.
- The mouse wheel **always** moves system time, wherever the pointer is. The map pans by dragging and zooms with its **+** and **−** buttons, and the room/timeline panel scrolls sideways by dragging or with a scroll bar.

**Room/timeline panel**

- After the unplaced column, one timeline column for **every room** with an audio sensor, labelled with its room ID (and its description, once the player has filled it in).
- If there are more rooms than fit, the room columns **scroll sideways**. The unplaced column and the hour labels stay fixed on the left.
- The columns for the rooms shown in viewer 1 and viewer 2 are marked with those viewers' colours.
- The player **drags logs** here: up and down to change the time, and across to another room's column to change the room, within whatever the locks allow (see *Log states*).
- Blocks snap to the **15-minute grid**.
- **Logs can't overlap.** A block can't be dropped where it would overlap another log in the same room.

**Unplaced column**

- The room/timeline panel's first column is **UNPLACED**. New logs from a batch arrive here.
- Logs in it have no room or time yet. They're stacked in arrival order, and their position in the column doesn't mean anything.
- The player drags a log out of the unplaced column into a room's column to start placing it.
- A log can be dragged **back** into the unplaced column if neither of its locks is set.
- **Reading an unplaced log:** left-click it to open it in the viewer 1 panel, or right-click it to open it in the viewer 2 panel, the same as clicking a room.

#### Data sources

Each section of the GUI is a data source:

- **AI room transcripts (primary):** the logs that have been locked into each room, shown per room
- **Proximity data:** which badge IDs were in each room, and when, shown on the facility map
- **Badge log:** where the player fills in the name and role for each badge ID; names then show up next to the ID across every section
- **Room registry:** where the player adds a description for each room ID
- **Sensor status:** which rooms have audio and proximity sensors, and whether each one is working
- **Unplaced column:** the first column of the room/timeline panel, holding the current batch of logs waiting to be placed
- **Staff directory:** names and roles, but *not* badge IDs, so the player still has to match people to IDs (it could also be locked at first)
- **Internal mail / chat:** staff messages that give context and motive (optional)
- **Video archive:** permanently shows `OFFLINE`, as flavour and a reminder of why you're doing this the hard way

Contradictions between sources are the main puzzle. For example, the transcript puts `ID #4553` speaking in room `B2-07` at 02:14, but at 02:12 the map shows that badge in `A1-03`. Either the AI got the speaker wrong, or something stranger is going on.

### Corruption as a mechanic

The transcripts can be wrong in two ways, and each one gives the player something different to fill in.

**Transcription errors** happen because the AI is imperfect:

- Unknown speakers (`SPEAKER_2`) or speakers attributed to the wrong person
- Misheard words, such as names, room numbers or codes transcribed as similar-sounding words
- Missing or garbled timestamps and room IDs, which is why every log has to be placed by hand
- Overlapping speech merged into one line

**Data corruption** happens because the system was damaged:

- Partly garbled lines (`▒▒░▓` characters)
- Missing chunks of time

In both cases, the player fills the gaps by inference from other sources.

### Story

The premise, tone, background, cast, true timeline, mysteries and **secrets** are in [story.md](story.md).

### Scope: ★★☆

It's one screen with no physics or animation-heavy work. Most of the effort is **writing and puzzle design**: one tight incident with a consistent timeline across every log. The UI framework (windows, scrolling lists, filtering) is the main code task, and once built it's reused by every data source.

**Minimum shippable version:**

- Main screen: map panel (map and tabs), viewer 1 and 2 panels, timeline panel, and the room/timeline panel swapped in on the left
- Badge log (Users tab), room registry with sensor status (Rooms tab), and the unplaced column
- Scrolling and zooming the facility map
- Room timelines with draggable log blocks, independent room and time locks, and checking once both are locked
- Three or four batches, unlocked by a set number of correct placements
- One incident, told through roughly 30–50 logs
- An ending once every log is placed (details deferred to the story design)
- Timelines that expand to more of the shift as batches arrive
- Autosave after every log move, plus manual save

**Stretch goals:**

- A raw view of a log (for example, the AI's confidence scores or alternative transcriptions)
- Replaying the whole night once every log is placed
- Extra end questions or an artifact catalogue for the secrets
- A second, shorter incident or an epilogue twist

### Other decisions

- **Pace:** the player investigates at their own pace. There's no timer or time pressure.
- **Names and room descriptions** are only the player's own notes. The game never checks them; only each log's time and room are checked.
- **Proximity data** is always available, for the whole of the unlocked timeline.
- **Saving:** the game **autosaves after every log is moved**, and the player can also **save manually** whenever they want.
- **Controls:** the GUI is **mouse-driven**. The keyboard is used for typing (names, roles and room descriptions), and possibly for **keyboard shortcuts** later.
- **Shift key:** not used as a control.
- **Deferred to the story design** (see [story.md](story.md)): batch sizes and unlock thresholds, what happens at the end, and the shift's exact start and end times. Which part of the shift is available at each stage is also set by the story.


---

## Other ideas (parked)

These came out of the initial brainstorm and are kept for reference.

The theme can be read in several ways:

- **Physical:** move something, slide it, change its position or gravity
- **State:** transform, swap forms, phase between worlds
- **Time:** a work shift, shift change, day ↔ night, the passing of time
- **Perspective:** change your point of view, change who you control
- **Keyboard:** the Shift key itself as a mechanic
- **Tectonic / gear:** shifting ground, shifting gears, shifting sands
- **Social:** shifting loyalties, blame, power balance

### Phase Shift
A platformer where pressing **Shift** swaps between two versions of the same level (Day/Night, Past/Future, Light/Shadow). Platforms that exist in one world are missing in the other. Scope ★★☆.

### Shapeshifter
A small creature that shifts between 3–4 forms (block, ball, bird, liquid), each with one ability and one weakness, in a compact metroidvania. Scope ★★★.

### Tectonic
A turn-based puzzle game where you slide whole rows and columns of the world, Rubik's-style, to carry your character to the exit. Scope ★☆☆.

### Gear Shift
A courier game where your gear sets how fast the whole world moves. High gear is fast but dangerous, and low gear is safe but the clock is ticking. Scope ★★☆.

### Shift Change
Rotate which crew member is awake on a submarine or station. Each has a skill, and anyone who stays awake too long makes mistakes. Scope ★★☆.

### Blame Shift
Plant evidence and redirect gossip to shift the blame onto someone else before the boss finds out. Scope ★★★. *Its blame mechanic could feed into Night Shift's story.*

### Red Shift
A space game where your speed changes the colour palette, and objects only exist when they're shifted into the visible spectrum. Scope ★★☆.

---

## Next steps

- [x] Pick a direction: **Night Shift**
- [ ] Write the story: see the checklist in [story.md](story.md)
- [x] Mock up the main screen at 1920×1080 (`docs/gui-mockup-map.png`, `docs/gui-mockup-rooms.png`)
- [ ] Prototype mouse-wheel time scrubbing driving the map panel, both viewer panels and the timelines
- [ ] Prototype the room/timeline panel: drag log blocks between rooms and along time, room and time locks, and the check
- [ ] Prototype the badge log and room registry (fill-in forms), with names appearing next to IDs across every section
- [ ] Prototype batches: unlock the next batch after a set number of correct placements
- [ ] Decide art palette and mood (CRT green? amber? institutional grey?)
- [ ] Lock the minimum shippable version vs. stretch goals
