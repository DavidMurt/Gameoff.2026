# Night Shift — Story

Story design for Night Shift: the premise, background, cast, true timeline, and the **secrets** the player has to deduce. Gameplay, GUI and technical design live in [IDEAS.md](IDEAS.md), and the cast is in [characters.md](characters.md).

The mystery is built backwards:

1. Write what *really* happened: the background, the people, and the true timeline and conversations.
2. Turn the true conversations into **logs**: transcript fragments with badge IDs, but no room or time.
3. Only then damage them with transcription errors and corruption.

---

## Premise

You are the IT manager of a secret government facility. You come in for the morning shift after something terrible happened overnight. The facility's computer systems are corrupted, the main security suite is down, and all you have is the **backup emergency GUI** of the facility's custom-built security solution. Your job is to dig through what's left of the logs and work out what happened on the night shift, who was involved, and how they did it.

The **video system is offline** and unlikely to be recovered. What survives is the security system's **AI transcription log**: a text record of the conversations in each room. The AI is imperfect, and parts of the log are corrupted.

It's a **supernatural mystery**. The facility is a research facility that studies strange **artifacts** of supernatural origin. One of them, **Artifact-01**, holds a mind that can jump from person to person, and what it did that night shows up in the logs and in what people did.

**Theme hooks for the story:**

- **The shift:** the incident happened on the *night shift*, and the player pieces it together at the start of theirs. The shift handover is the framing device.
- **Shifting minds:** the Entity shifts from carrier to carrier, so the person who seems to be responsible keeps changing.
- **Shifting blame:** the obvious evidence points at one person. Someone, or something, has shifted the blame.

## Tone

Quiet, tense and procedural, with the supernatural leaking in at the edges. It should feel like reading something you weren't meant to see. The artifacts are never shown or explained directly; you only see what they did to people and to the logs.

---

## Background

Only the points marked **decided** are settled.

### The facility

- **Decided:** a research facility that studies strange artifacts of supernatural origin.
- **Name:** it should be mysteriously vague, a name that tells you nothing. Candidates:
  - The Annex
  - Site Nine
  - The Meridian Institute
  - Halverson Research Station
  - Department of Continuity, Facility 4
  - The Archive
- Location, cover story, and who it answers to
- Layout: see *Rooms* below

#### Rooms

**Decided:** these rooms exist. Counts, room IDs and sensors are still to be decided.

**The lockdown (decided)** seals **every entrance and exit** of the facility: the Entrance and the Loading dock. Doors inside the facility keep working as normal, with their usual badge restrictions.

| Room | Role in the story |
|---|---|
| **Entrance** | The main way in and out of the facility. The Entity's goal, and sealed by the lockdown. |
| **Loading dock** | The other way in and out, for deliveries. Also sealed by the lockdown, so it's another exit the Entity could try. |
| **Vault** | At the back of the facility. Holds Artifact-01. **Nobody is supposed to go in.** In hour 2, its door is opened by accident, and a scientist goes in, releasing the Entity. |
| **Observation post** | Where scientists **monitor Artifact-01**. People here can see the artifact react when the Entity jumps (see *Artifact-01 reacts to jumps*). |
| **Labs** | Where the artifacts are studied. |
| **Offices** | Staff offices. |
| **Utility closet** | Small and out of the way. |
| **Bathrooms** | **Men's and women's. No sensors (decided).** Only the **men's bathroom** has the vent, which carries conversations into another room, where that room's audio sensor picks them up. Which room is decided with the layout. |
| **Hallways** | Several of them, connecting everything else. People pass through them, so a lot of jumps could happen here. |
| **Conference room** | Meetings and briefings. |
| **Kitchen** | Where the night shift makes **coffee**. A natural place for people to meet, chat and run into each other. See *The coffee* under Artifact-01. |
| **Security office** | Where security staff watch the facility. Likely controls the doors and the lockdown. |
| **Server room** | Holds the security server that the IT lead corrupts. |
| **Facilities room** | The maintenance crew's base, where they work on the HVAC system. |

**Layout:** to come. A rough outline will be sketched separately. It needs to show the **vent network** as well as the hallways (see *Secret 3: The vents*).

**Suggested sensors**, chosen for what they do to the puzzle:

| Room | Audio | Proximity | Why |
|---|---|---|---|
| Entrance | Yes | Yes | The Entity's goal. The player needs to see clearly who reached it, and when. |
| Security office | Yes | Yes | The heart of the lockdown story. |
| Vault | Yes | Yes | Where it starts. Nobody should ever be in here, so any voice or badge in the Vault stands out. The recording also cuts out whenever the Entity jumps, but that rarely matters because the room is almost always empty. |
| Observation post | Yes | Yes | Scientists' comments on Artifact-01 reacting are key timing anchors for jumps. |
| Labs | Yes | Yes | Lots of conversation between scientists. |
| Server room | Yes | No | The player hears the IT lead at work, but proximity can't confirm who was in the room. |
| Offices | Yes | No | Private conversations, harder to place. |
| Conference room | Yes | Yes | Group scenes with lots of people, good for jumps and shared events. |
| Kitchen | Yes | Yes | Everyone passes through for coffee, so it's full of small talk and chance meetings. Good for jumps, and the coffee machine's sounds help date logs. |
| Facilities room | Yes | Yes | The maintenance crew's conversations here could reveal what they did to the HVAC system, and whether they realise they caused the short. |
| Hallways | No | Yes | People pass through, but nothing is recorded. Jumps here can only be inferred from proximity, and from the memory gaps afterwards. |
| Utility closet | No | No | A **blind spot**. Something important happens here that the player can only infer. |
| Bathrooms | No | No | **Decided.** Conversations in the men's bathroom are heard through the vent, in another room's log. Nothing from the women's bathroom is recorded at all. |

Logs only exist for rooms with audio, so with this setup the room/timeline panel would have one column each for the Entrance, Security office, Vault, labs, Server room, offices and Conference room.

**Room IDs:** room IDs shouldn't give away what a room is, because the player works that out (see *Key 2: Rooms* in [IDEAS.md](IDEAS.md)). Plain four-digit numbers with no pattern would work, for example `4471` for the Vault.

### The artifacts

#### Artifact-01 and the Entity (decided)

Artifact-01 is kept in **the Vault**. It contains a mind, called **the Entity**, that can jump from person to person.

- **New and not understood (decided):** Artifact-01 arrived recently. **Nobody at the facility is really sure what it does.** The staff don't know there's a mind inside it.
- **Nobody is supposed to enter the Vault (decided).** It's monitored from the Observation post instead.
- **How the Entity got out (decided):** in hour 2, the maintenance crew's HVAC work accidentally **shorts the security doors**, which **opens the Vault door**. **Margaret** (decided), alone in the Observation post, sees it and hits the **emergency lockdown**. Then she **hears a noise from the Vault** and **goes in**, and the Entity takes her over. Margaret is the Entity's **first carrier**. See *Hour 2* in the timeline.

- **Possession:** when the Entity jumps into a person, it gains that person's **memories**, so it knows what they know and can pass as them. But it **behaves strangely**.
- **Its tells (decided):** the Entity's speech has habits that let the player **track it through the logs** once they realise it's controlling different people:
  - It says **"Indeed."**
  - It **never uses contractions**: "I do not know", never "I don't know"; "it is", never "it's".
  - It **never uses nicknames or abbreviations**: "Doctor Jennifer Hale", never "Jen"; "the security office", never "sec"; "identification", never "ID".
  - It's **very literal**: it misses jokes, sarcasm and figures of speech, and answers exactly what was asked.
  - See *The Entity's tells* below for possible extra tells.
- **Its goal (decided):** to **escape the facility**.
- **Jumping:** the Entity can only jump between people who are **in the same place** at the same time.
- **Artifact-01 reacts to jumps (decided):** the Entity and Artifact-01 are still linked. Whenever the Entity jumps from one person to another, **wherever it happens**, Artifact-01 reacts in two ways:
  - It gives off a **visual sign**, such as a flash.
  - It **cuts out the audio recording in the Observation post and the Vault for 1 minute**. Nothing is transcribed in either room for that minute. Nobody is normally in the Vault, so in practice the gap only shows up in the Observation post.
  - If people are talking in the Observation post at the time, the conversation **suddenly stops for a minute** in the log, then picks up again with them reacting: "Did you see that?", "It just flared again", "Write down the time."
  - So a jump only shows up there **occasionally**: when someone is in the Observation post, talking, to notice it.
- **The carrier:** a person the Entity is in is called a **carrier**. While the Entity is in them, their own mind is **suppressed** until it leaves.
- **After it leaves (decided):** the former carrier is only **slightly confused**, and **carries on with whatever they were doing**.
  - They **remember nothing** from their time as a carrier, but they **don't realise it** until someone asks them about something they did during that time.
  - They also don't remember **conversations** from that time, so they may ask someone to **repeat** something they were already told.
  - These gaps are how the player spots who was a carrier, and when.
- **The coffee (decided):** characters want to make coffee during the night. A character can be taken over while making coffee. The Entity finishes the job to keep up appearances, but the carrier won't remember it. Later, after the Entity has left, they go back to make the coffee, only to find **it's already been made**: "Huh. Someone already made a pot." "Did you make coffee?" "I was just about to do that." It's a small, everyday version of the memory gap, and a gentle early clue.

Still to decide about the Entity:

- **The noise from the Vault:** what does the scientist hear? Is the Entity deliberately luring someone in, since it needs a person to escape into?
- **Jumping rules:** does it need touch, or just the same room? Is it instant? Can it go back into the artifact? Can it be trapped in someone, for example if they're alone?
- **Artifact-01's reaction:** exactly what the visual sign looks like.
- **Where it is now:** see *Story outline*.

#### The Entity's tells

**Decided:** "Indeed.", no contractions, no nicknames or abbreviations, and very literal.

**Possible extra tells**, roughly from most to least subtle. None of these are decided:

| Tell | How it shows in the logs |
|---|---|
| **No filler words** | Everyone else's speech has "um", "uh", "like" and false starts. The Entity's is clean and complete. It's very subtle, and it works well in a transcript. |
| **Calm under stress** | Others react to a bang or an alarm with "What was that?!", while the carrier says nothing, or just "Indeed." |
| **Precise times and numbers** | "It is two forty-seven", where people normally say "nearly three". |
| **Out-of-character speech** | A carrier who swears constantly in earlier logs suddenly stops. This only works if the player has read that person's other logs. |
| **Bad radio procedure** | A security guard who always uses call signs and "over" suddenly stops on the radio. |
| **Seeks company** | Proximity data shows the carrier moving towards other people, because it can only jump between people in the same place. It avoids being alone. |
| **Unusual routes** | The carrier visits rooms their role never needs, especially near the Vault. |
| **Third-person slip** | A rare mistake late in the night: "Marcus would not do that." This is a strong late-game confirmation for players who are close. |

**Writing rules** that make the tells fair:

- **Everyone else must use contractions and filler words** consistently, or the tells stop meaning anything.
- **Keep the Entity's lines short.** Short lines make "Indeed." stand out without overusing it.
- **Only the Entity says "indeed" (decided).** No other character uses the word, so it's a reliable tell once the player spots it.
- **The tells are in the true conversations.** Transcription errors and corruption can hide them in places, but should never invent them.

#### Artifact-02: The Compass (chosen)

A brass compass with no markings. It always points towards **the Entity**, wherever it is.

- **Its role in the story:** it gives the night a second storyline. Someone uses the compass to **hunt the Entity** through the facility.
- **In the logs:** whoever carries it narrates what it shows: "It's pointing at the server room now", "It just swung round. It's behind us", "It's spinning. It's in here with us."
- **The Entity's interest:** the compass is the one thing that can find it, so the Entity has a reason to take it away or destroy it.

#### Artifact-03: The Music Box (chosen)

A small music box. Anyone who hears its tune **falls asleep** for a while.

- **Where it is:** in a **lab** (decided).
- **How it works:** it has to be **wound up** before it can play, and then **activated** separately (decided). In hour 1, Owen and Lily **wind it for the first time but don't activate it**, so it sits in the lab, ready to go, for a later hour.
- **Its role in the story:** the Entity could use it to get past guards, or someone could set it off by accident.
- **In the logs:** `[MUSIC]`, then silence. People stop answering their radios, and their badges sit still on the map for a long time.
- **A red herring next to the Entity:** people who wake up have lost time, just like someone the Entity has left.

#### Possible artifact: The Null Jar (undecided)

A sealed ceramic jar that **suppresses other artifacts** nearby. It's the only thing that can **trap the Entity**. Kept as a possibility, depending on where the story goes.

- People close to the jar can't be jumped into, so the Entity's carriers avoid any room the jar is in.
- Staff could argue about using it to recapture the Entity, which would give the night a climax.
- It could answer "where is the Entity now?": trapped in the jar, or the jar failed.

#### Still to decide about the artifacts

- **Where each one is kept** at the start of the night, and its number. Artifact-02 and Artifact-03 are placeholders.
- **The Compass:** who holds it (the **Compass holder**), and whether they're hunting the Entity on purpose or stumble into it.
- **The Music Box:** how it's activated once wound (opening the lid, a switch, or something else), who activates it and in which hour, how far the sound carries, how long people sleep, and whether it affects people who hear it over a radio or through a vent.
- **The Music Box and the Entity:** if the Entity's carrier falls asleep, can the Entity still act or jump? Is the Entity itself immune?
- **What the staff officially know** about each artifact, compared with the truth.

### Security routines

**Patrols (decided):** the security staff **take turns** patrolling. Each patrol **starts at 15 minutes past the hour** and **lasts 45 minutes**, so it ends on the hour. The two guards **alternate** hours:

| Hour | Patrol |
|---|---|
| 1 | Danny (sent by Raymond; leaves **late**) |
| 2 | Raymond |
| 3 | Danny |
| 4 | Raymond |
| 5 | Danny |
| ... | and so on |

- **The schedule is a clock.** A guard leaving on patrol is a known time (quarter past), and finishing is on the hour, so patrol chatter helps date logs.
- **Breaks from routine are clues.** Danny leaving late in hour 1 is the first example. Once the Entity is in Raymond, his own patrols could go wrong: skipped, late, or following an odd route.
- **Repeated routines can confuse.** Patrols look alike from hour to hour, so the player has to use small differences, such as the heat, the lockdown, or who's missing, to tell them apart.
- The hour-by-hour table above assumes Danny takes the odd hours and Raymond the even ones, which matches Danny patrolling in hours 1 and 3.

### The security system

- Product name, who built it, and why it's custom. Placeholders: **WARDEN**, **SENTINEL/ER** or **BASTION Recovery Mode**.
- How the AI transcription works, and why it survived when the video didn't
- **What caused the system corruption (decided):** the IT lead, while possessed by the Entity, corrupted the security server to try to lift the lockdown. See *Story outline*.

### The people

Names, voices, verbal tics and backgrounds for everyone are in [characters.md](characters.md).

#### The night shift (decided)

Thirteen people are in the facility that night: nine on the night shift, and four others who are there for other reasons.

| # | Role | Notes |
|---|---|---|
| 1 | **Night security supervisor** | In charge of security for the night. |
| 2 | **Night guard** | Reports to the supervisor. |
| 3 | **Scientist** | |
| 4 | **Scientist** | |
| 5 | **Scientist** | |
| 6 | **Intern** | Started **earlier this week**. |
| 7 | **Cleaner** | |
| 8 | **Cleaner** | |
| 9 | **IT lead** | Reports to the player character, the IT manager. |
| 10 | **Facility director** | **Working late.** The most senior person in the building. |
| 11 | **Maintenance supervisor** | **Working late** on the **HVAC system**. |
| 12 | **Maintenance technician** | Working late on the HVAC system with the supervisor. |
| 13 | **Delivery driver** | **Not staff, and has no badge.** Fell asleep in his truck at the Loading dock, and only wakes up when the lockdown alarms go off. |

Still to decide for each person: name, badge ID, gender (this matters for the men's bathroom), clearance, radio, relationships, and their secret.

#### Suggestions for who fills each story role

None of these are decided. They're a starting point that fits the secrets so far:

| Story role | Suggested person | Why |
|---|---|---|
| **Radios** | Security supervisor and night guard | Security staff naturally carry radios, which sets up Secret 1. Possibly the cleaners too. |
| **Enters the Vault** (the first carrier) | **Margaret** (decided) | Alone in the Observation post after Priya leaves for coffee. |
| **The murdered scientist** | One of the scientists | |
| **Compass holder** | A scientist, or the security supervisor | Someone who would know what the Compass does. A scientist hunting the Entity, or the supervisor using it to search the facility. |
| **The drug problem** | A cleaner or the night guard, with a friend among the others | Should be someone the player can easily suspect. |
| **Searches the Security office** with the murder's carrier | The security supervisor or the night guard | They're the ones who'd look up a badge. |
| **Loses the badge** in the men's bathroom | Any man on the shift | |
| **Finds the lost badge** | A cleaner | Cleaning the bathrooms is exactly how it would be found. |
| **Knows the vents** | The maintenance supervisor or technician | They're working on the HVAC system, so they know the ductwork better than anyone. |

**Useful qualities of each role:**

- **The intern:** other people **explain things** to them, which is a natural way to give the player background without exposition. Being new also makes their odd behaviour easy to excuse.
- **The cleaners:** they go **everywhere**, at odd hours, and people tend to overlook them. Good for finding things, overhearing things, and knowing the building's hidden routes.
- **The scientists:** they know the artifacts, and the Observation post is theirs. Their arguments about Artifact-01 can show the player what the staff believe it does.
- **Security:** radios, door access, the Security office, and the lockdown. They're the ones trying to keep order as the night falls apart.

#### The delivery driver (decided)

- He **isn't staff and has no badge**. He fell asleep in his truck at the **Loading dock**, and only wakes up when the **lockdown alarms** go off. By then he's locked in with everyone else.
- **The AI doesn't recognise his voice**, so it gives him a **random ID** that isn't on any staff list.
- At first he has **no badge**, so he **doesn't appear on the map**. The player can only follow him through his voice.
- **The visitor badge (decided):** at some point, the **night guard makes him a visitor badge**. It has its **own number**, different from the random ID the AI gave his voice. From then on:
  - He appears on the map under the **visitor badge number**.
  - His **voice ID and badge ID don't match**. He's the one person whose voice and badge always have different numbers.
  - The player has to work out that the two numbers belong to the same person: for example, the visitor badge appears on the map in the Security office at the moment the guard is heard making it, and from then on it moves wherever the driver's voice is heard.
  - In the badge log, the player can give both numbers the same name.
  - A visitor badge probably opens very few doors, so he still has to follow people around.
- **A red herring:** an ID that matches nobody looks like something supernatural, or an intruder. It's just a confused, lost delivery driver.
- **A natural outsider:** he knows nothing about the facility, so people have to explain things to him, and he asks the questions the player is wondering about.
- Since he can't open any doors, he has to follow other people around, or be let through.

#### The HVAC work (decided)

- The **maintenance supervisor** and **technician** are working late on the **HVAC system**.
- At some point, they **take the HVAC system down**. That makes a loud **clunk**, heard across several rooms, which is a **shared event** for dating logs.
- After that, **the facility slowly heats up**, and people start mentioning it: "Is it getting warm in here?", then "It's boiling", then "I can't breathe in here."
- **The heat works as a rough clock.** How hot people say it is shows roughly how long after the clunk a log happened, even when no other clue does.
- **It ties to the vents.** The maintenance crew know the ductwork, so they're the natural people to know about (or use) the vents. With the HVAC off, the vents are quiet, which could make sound carry through them more clearly.

#### The lab temperature alarm (decided)

- One of the labs has a **temperature sensor** with an alarm. It goes off if the temperature stays **above a set limit for an hour**.
- As the facility heats up, **two scientists mention the temperature** in that lab, for example reading it off the display: "It's already over twenty-eight in here." That's the moment it crosses the limit.
- **Exactly one hour later, the alarm goes off.** It's a loud, distinctive alarm, so it's another **shared event** for syncing logs in that lab and any rooms that can hear it.
- **A deduction across an hour:** if the player knows when the scientists noticed the temperature, they know when the alarm went off, and the other way round. That links two logs an hour apart, which no other shared event does.
- **A red herring next to the lockdown alarms:** it's a different alarm, at a different time. The player has to tell them apart, for example by its sound (`[TEMPERATURE ALARM]` rather than `[LOCKDOWN SIREN]`) and by who reacts to it.

**To decide:** which lab, the temperature limit, which two scientists mention it, and which other rooms can hear the alarm.

**The HVAC work causes the whole incident (decided).** In hour 2, while working on the HVAC system, the crew **accidentally shorts the security doors**. That opens the Vault door, which leads to the lockdown and the Entity's release. See *Hour 2* in the timeline.

**The electrical problems keep the lockdown going (decided).** The HVAC repairs leave the electrical system faulty, and the fault makes the lockdown **restart immediately** whenever Raymond tries to clear it. Clearing the fault ("the jam") is what finally opens the way to the Loading dock. See *The electrical fault and Gus's murder* in the timeline.

**To decide (HVAC):** whether the short is the same moment as the HVAC going down and the clunk, or a separate event; why the crew is working on it that night; whether the crew realises they caused it, and whether they keep that quiet; and whether the Entity takes advantage of the crew's knowledge of the vents.

#### Still to write

- Each person's motive, secret and alibi
- Relationships between them
- The player character: their history with the staff and the system, and whether they're implicated

### What the player knows at the start

- The morning briefing: what's known, what's being asked of you, and by whom

---

## Story outline

The main beats decided so far. Everything between them is still to be written.

1. **The release (hour 2).**
   - **The short:** the maintenance crew, working on the HVAC system, accidentally **short the security doors**. The **Vault door opens**.
   - **The lockdown:** **Margaret**, in the **Observation post**, sees the open door and hits the **emergency lockdown**, sealing every entrance and exit.
   - **The Entity:** Margaret then **hears a noise from the Vault**, goes in, and is **taken over**. She becomes the Entity's first carrier.
2. **The door.** At first, the Entity simply tries to leave through the door. The lockdown stops it.
3. **The search.** It **jumps from person to person**, using each carrier's memories and access to look for another way out. Each carrier is a step in its search.
   - **The scientist's murder:** somewhere in the search, the Entity **kills a scientist** and takes their badge. Later, after the Entity has jumped on, the carrier it left searches the Security office for the badge, and finds it on themselves. See *Secret 8*. **This stays in the story (decided)**, alongside Gus's murder, but when and where it happens is still open.
4. **The IT lead (hour 4).** In Raymond, the Entity finds **Marcus**, the IT lead, and jumps into him. Through Marcus's knowledge it finds another way out: the security system controls the lockdown.
5. **The corruption (hour 4).** Possessed by the Entity, Marcus goes to the **Server room** and **takes down the system** to try to lift the lockdown. The **video is lost and corrupted** and the **user logs are wiped**. This is why the player is working from the backup emergency GUI.
6. **The lockdown won't clear (hour 7).** Taking the system down doesn't lift the lockdown. The electrical problems caused by the HVAC repairs make the lockdown **restart immediately** whenever Raymond tries to clear it.
7. **Jamal (hour 7).** The Entity learns that the **electrical problems** are what keep the lockdown going, so it **jumps into Jamal**, the maintenance technician.
8. **Gus's murder (hour 7).** While Jamal is trying to **clear the jam**, **Gus** discovers him. **Jamal kills Gus** and leaves the body in the **Facilities room**.
9. **The way out (hour 7).** Jamal **clears the jam**, which **opens the way towards the Loading dock**.
10. **The confrontation (hour 8).** The **police are called**. **Raymond and the others confront Jamal**, and **Raymond shoots Jamal**.
11. **The sealing (hour 8).** Through the night, the scientists have been working out how the Entity works and how it's linked to Artifact-01. They believe that if the carrier is killed, the Entity returns to the artifact and can be sealed. When Jamal is killed, they **activate the artifact**, and believe it has **pulled the Entity in**. It hasn't: the Entity jumped into Raymond (see hour 9).
12. **The SWAT team (end of hour 8).** A **SWAT team** comes in and **secures the building**. **Everything seems to be over.**
13. **The interviews (hour 9, a bonus hour).** A **police detective** interviews everyone, room by room. The remaining threads are tied up: the **drugs are discovered and explained**, and the surviving scientists are **interviewed and debriefed**.
14. **The twist (end of hour 9).** The last interview is **Raymond**. It becomes clear that **the Entity was never sealed**: when Raymond shot Jamal, it **jumped into Raymond**. The last lines show it **jumping into the detective**, who will walk out of the facility. The game ends.
15. **The morning.** The player arrives for the morning shift and reads the logs, knowing more than anyone who was there.

**How this fits the logs:**

- The Entity's route from carrier to carrier is the backbone of the night. Each jump needs the old and new carriers in the same room, so the route is visible in the proximity data.
- Each carrier's logs show their own knowledge being put to a new use. For example, in a guard the Entity checks the door codes, and in a scientist it looks up the Vault's systems. The player can work out what the Entity was looking for at each step.
- **The IT lead is the player character's own staff member.** The player is investigating the person who broke their system, and has to work out that the IT lead wasn't really responsible. This is the "shifting blame" hook.

**Questions this raises:**

- Who did the Entity possess, in what order, and what did it try with each one?
- After Jamal clears the jam and opens the way to the Loading dock, why doesn't the Entity get out before the confrontation?
- **"Everything seems to be over" (decided):** it isn't. The Entity jumped into Raymond when he shot Jamal, and at the end of hour 9 it jumps into the police detective, who will leave the facility. The Entity escapes.
- Why did the security server's corruption leave the AI transcripts behind? Did the Entity, or the IT lead, try to delete them?

## The true timeline

The story covers **9 hours** of the night shift, and **there is no hour 10** (decided). Times are given as **hours into the shift**: "hour 5" means the fifth hour, from 4:00 to 5:00 after the shift starts. The clock times are still to be decided.

**The game covers hours 1 to 9 (decided).** Hour 8 is the climax. Hour 9 is a **bonus hour** of police interviews that wraps up the plot threads and delivers the final twist.

### Hour by hour

| Hour | What happens | Status |
|---|---|---|
| **1** | The cleaners and the maintenance crew arrive. The cleaners start their rounds; the maintenance crew go to the Facilities room. Owen and Lily wind the Music Box in a lab, without activating it. The director is on the phone in his office. Margaret and Priya are in the Observation post, until Priya goes to the Kitchen to make coffee. Raymond sends Danny on patrol, but Danny leaves late. | **Started** |
| **2** | The HVAC work **shorts the security doors** and the **Vault door opens**. **Margaret**, in the Observation post, hits the **emergency lockdown**, then hears a noise, enters the Vault, and is **taken over by the Entity**. | **Started** |
| **3** | The Entity, in **Margaret**, tries to leave through the **Entrance** and is stopped by **Raymond**. In the **Security office**, it **jumps into Raymond**. **Luis loses his badge** in the men's bathroom. Danny is on patrol, and Luis tells him about the badge. | **Started** |
| **4** | The Entity, in **Raymond**, makes its way around the facility. It tries to get back to **Artifact-01**, but the Vault door is now **closed**. It finds **Marcus** and **jumps into him**. Marcus goes to the **Server room** and **takes down the system**: the video is lost and corrupted, and the user logs are wiped. | **Started** |
| **5** | The Entity **jumps from Marcus** to a new carrier. | **Started** |
| **6** | **The first hour the player works on.** Marcus and Raymond, both former carriers, try to work out what's going on and assess the damage. Everyone else checks on the facility. First radio calls. | **Started** |
| **7** | The lockdown keeps restarting because of the electrical fault. The Entity jumps into **Jamal**, who kills **Gus** in the Facilities room and clears the jam, opening the way to the Loading dock. | **Started** |
| **8** | **The last hour in the game.** The police are called. Raymond and the others confront Jamal, and **Raymond shoots him**. The scientists **activate Artifact-01**, believing it pulls the Entity back in. In fact, the Entity has jumped into Raymond. At the end of the hour, a **SWAT team** secures the building. | **Started** |
| **9** | **Bonus hour.** A police detective interviews everyone, room by room, and the remaining threads are tied up. The last interview is Raymond: the Entity is in him, and in the final lines it jumps into the detective. | **Started** |

### Hour 1

**The shift starts. Everything is normal.**

- The **cleaners** (Luis and Bev) and the **maintenance crew** (Gus and Jamal) **arrive for work**.
  - The cleaners **start their rounds**.
  - The maintenance crew **head to the Facilities room** to work on the HVAC system.
- **Owen** and **Lily** (the intern) are in **another lab**, working with the **Music Box**. They **wind it for the first time**, but **don't activate it**. It's left ready to go in the lab for a later hour.
- The **director** is in **his office**, on the **phone** with someone outside the facility.
- **Margaret** is in the **Observation post** with **Priya**.
  - Priya **goes to the Kitchen to make coffee**, leaving Margaret on her own.
- **Raymond** sends **Danny** on his **patrol**. He's supposed to leave at **15 minutes past the hour**, but he's **late**.

**Why this works:**

- **It sets up hour 2.** With Priya in the Kitchen, Margaret is alone in the Observation post, so nobody sees her go into the Vault.
- **The Music Box is set up for later.** The player hears it being wound in hour 1, so when it's activated later, a careful player can connect the `[MUSIC]` back to this lab and these two people. Lily asking questions is a natural way to explain what it does, or what the staff think it does.
- **The coffee is a thread.** Priya making coffee in hour 1 introduces the Kitchen and the coffee routine, which the memory-gap clue relies on later.
- **Normal conversations are a baseline.** The player hears how everyone talks before anything goes wrong, which is what makes the Entity's tells noticeable later.
- **Arriving for work sets up Luis's badge.** Luis uses his badge to get into a restricted area early in the shift, which proves he had it when he came in (Secret 9).

**Questions about hour 1:**

1. **The director's phone call:** who is he talking to, and about what? Only his half is recorded, unless he uses the speaker. Is it about Artifact-01?
2. **Where is Marcus** in hour 1? The delivery driver is already asleep in his truck.
3. **Why is Danny late** for his patrol? It's an early chance to hint at his drug problem.
4. **Which restricted door** does Luis use his badge on in hour 1?

### Hour 2

**The incident begins.**

1. **The short.** The maintenance supervisor and technician are working on the HVAC system, and **accidentally short the security doors**. The **Vault door opens**.
2. **The lockdown.** **Margaret**, alone in the **Observation post**, sees the Vault door open, and hits the **emergency lockdown**. Every entrance and exit is sealed. The lockdown is **still going** through hour 6.
3. **The release.** Margaret then **hears a noise from the Vault**, and **goes in**. The Entity takes her over. She's the **first carrier**.

**Why this works:**

- **Nobody is a villain at the start.** It's an accident, followed by someone doing the right thing (the lockdown), followed by a mistake (going in).
- **The first carrier is the person who raised the alarm.** Nobody suspects the person who hit the lockdown, which gives the Entity perfect cover early on.
- **Margaret as the first carrier.** She's the most senior scientist, so people defer to her, and nobody questions her. That gives the Entity perfect cover early on.
- **The maintenance crew have a secret too.** If they realise their work opened the doors, they have a reason to keep quiet about it, which makes them suspicious for the wrong reasons.
- **It explains the "door ajar".** The short opened it, so nobody needed a badge to get in.

**Questions about hour 2:**

1. **The noise:** what does Margaret hear, and is the Entity luring her in?
2. **Is the short also the HVAC clunk** and the moment the HVAC goes down? If so, the heat starts building from hour 2.
3. **Did the short damage other systems** besides the doors, or is all the damage Marcus's, in hour 4?

### Hour 3

**The Entity tries to get out.**

1. **The Entrance.** The Entity, in **Margaret**, tries to leave through the **Entrance**. **Raymond** stops her: the facility is in lockdown.
2. **The first jump.** Margaret goes into the **Security office**, with Raymond, and the Entity **jumps into Raymond**. Margaret is left with a **memory gap** from going into the Vault in hour 2 until now, and carries on as normal.
3. **Luis's badge.** **Luis** goes to the **men's bathroom** and **loses his badge** there (Secret 9).
4. **Danny's patrol.** **Danny** is on his patrol. **Luis finds Danny** in one of the rooms along the way and tells him about the badge. Danny says he **won't report it**, but Luis needs to find it.

**Why this works:**

- **It shows the Entity's goal plainly.** Going straight for the Entrance is the first, simplest escape attempt, and it fails.
- **The first jump goes to the person in charge of security.** The Entity now has Raymond's knowledge, his badge and his radio, which makes it far more dangerous.
- **Margaret's memory gap begins to show.** She remembers hitting the lockdown, but not the Vault, or trying to leave. If anyone asks her about the Entrance, she won't know what they mean.
- **The patrol puts Danny and Luis in the same room** at a predictable time. Danny's patrol starts at quarter past, so the conversation happens somewhere along his route.
- **Raymond is now a carrier.** He stays the carrier until the Entity jumps to Marcus in hour 4.

**Questions about hour 3:**

1. **Which room** do Luis and Danny talk in? It needs audio for the player to hear it.
2. **Is Margaret's attempt at the Entrance recorded?** The Entrance has audio and proximity in the suggested sensors, so the player would hear Raymond stop her.
3. **Raymond's patrol in hour 4:** hour 4 is Raymond's patrol hour, which fits the Entity "making its way around the facility" in him. Does the patrol look normal, or does it go wrong?

### Hour 4

**The Entity reaches the security system.**

1. **Around the facility.** The Entity, in **Raymond**, makes its way around the facility. Hour 4 is Raymond's patrol hour, so this looks like an ordinary patrol.
2. **Back to the Vault.** It tries to get back to **Artifact-01**, but the **Vault door has been closed**, and it can't get in.
3. **The second jump.** It finds **Marcus** and **jumps into him**. Raymond is left with a memory gap from hour 3 until now.
4. **The corruption.** Marcus, now the carrier, goes to the **Server room** and **takes down the system**:
   - the **video is lost and corrupted**
   - the **user logs are wiped**

**Why this works:**

- **It sets up the whole game.** The emergency GUI, the missing video and the corrupted logs all come from this hour.
- **The wiped user logs can explain the badge log.** If the user logs were the records linking badge IDs to names, wiping them is exactly why the player has to work out who each badge ID belongs to.
- **The Entity tries to go back.** Its attempt to reach Artifact-01 shows it's still linked to it. Why it goes back is a good question for the player to wonder about.

**Questions about hour 4:**

1. **Who closed the Vault door,** and when? For example, the maintenance crew fixing the short, the lockdown sealing it, or someone on the night shift.
2. **Why does the Entity go back** to Artifact-01? For example, to check on it, to draw strength from it, or because it can't stay away for long.
3. **Where does it find Marcus,** and who else is there?
4. **Do the "user logs"** mean the records that link badge IDs to names? If so, that's why the player has to rebuild the badge log.
5. **The lockdown survives the system being taken down (decided).** The electrical fault from the HVAC repairs keeps restarting it.

### Hour 5

**The Entity moves on.**

- The Entity **jumps from Marcus** to a **new carrier**.
- Marcus is left with a memory gap from hour 4 until now. He doesn't remember taking down the system.

**Questions about hour 5:**

1. **Who is the new carrier,** and where does the jump happen?
2. **What is the Entity trying next,** now that taking down the system hasn't opened the doors?

### Hour 6

**The first hour the player works on.** The first batch of logs comes from this hour, and at the start of the game only hour 6 is shown on the timelines.

**What happens:**

- **Marcus** (IT lead) and **Raymond** (security supervisor) try to **work out what's going on**, and find out **how much damage has been done to the IT and security systems**.
- **Both are former carriers.** Marcus doesn't remember taking down the system, and Raymond doesn't remember most of hours 3 and 4.
- **Everyone else** is going around the facility, making sure things are okay.
- **The radios are introduced.** Raymond goes to the **Security office** and **calls Marcus on the radio**.
- There's also a **radio call involving one of the scientists**.

**Why this works as the first hour:**

- **Strong dramatic irony.** Marcus is investigating damage he caused himself, and doesn't know it. The player won't know it either, at first.
- **Their memory gaps are the first, subtle Entity clues.** Neither can account for parts of the night, and they may notice it when they compare notes.
- **A radio call is the ideal first shared event.** The same exchange appears in two logs at the same minute: Raymond's half in the Security office, and Marcus's half wherever he is. That teaches the player how to sync two logs, and introduces the radio secret gently.
- **Damage assessment is natural exposition.** Marcus and Raymond list what's broken, which tells the player what the emergency GUI can and can't show, and why.
- **People checking the facility** naturally name rooms and describe them, which helps the player fill in room descriptions.

**Questions about hour 6:**

1. **Where is Marcus** when Raymond calls him? The Server room seems likely.
2. **Which scientist** is involved in the other radio call, who is at the other end, and what is it about?
3. **How much does the Entity appear** in hour 6? It's in the carrier from hour 5, so it could appear, but keeping it quiet in the first batch would let the player learn the basics first.
4. **Do Marcus and Raymond notice their own memory gaps** in hour 6, or only later?

### Hour 7: the electrical fault and Gus's murder

1. **The lockdown keeps restarting.** **Raymond tries to clear the lockdown**, but the electrical problems caused by the HVAC repairs make it **restart immediately**. Taking the system down in hour 4 didn't help either.
2. **The Entity learns why.** It works out that the **electrical problems** are what keep the lockdown going.
3. **The jump into Jamal.** So it **jumps into Jamal**, the maintenance technician, who knows the electrical system.
4. **Gus finds him.** While Jamal is trying to **clear the jam**, **Gus**, his supervisor, discovers him.
5. **The murder.** **Jamal kills Gus**, and leaves the body in the **Facilities room**.
6. **The way out.** Jamal **clears the jam**, which **opens the way towards the Loading dock**.

**Why this works:**

- **It completes the chain started by the accident.** The HVAC work caused the short, the short opened the Vault, and the same fault now holds the lockdown in place. The Entity has to fix the problem the maintenance crew created.
- **It explains why the Entity needs Jamal.** Neither Raymond's authority nor Marcus's systems could lift the lockdown; only someone who understands the electrical fault could.
- **Gus's murder is the darkest shift of blame.** Every ordinary clue points at Jamal: he was there, and Gus is dead. Only the Entity's tells show that it wasn't really him.
- **Raymond's failed attempts are timing anchors.** Each attempt to clear the lockdown, followed by it restarting, is an event that several rooms could hear, such as alarms stopping and starting again.

**Questions:**

1. **Who carries the Entity in hours 5 and 6,** between Marcus and Jamal? Is there one carrier in between, or more?
2. **How does the Entity learn** that the electrical problems are to blame? For example, by overhearing Raymond and Marcus, or from Gus and Jamal talking about the fault.
3. **Where is Jamal** when the Entity jumps into him, and who else is there?
4. **How does Jamal kill Gus,** and is it recorded? The Facilities room has audio and proximity in the suggested sensors, so the player could hear it, perhaps muffled or corrupted.
5. **Gus's badge:** does it stay in the Facilities room with his body? A badge that never moves again is a strong clue.
6. **The scientist's murder (Secret 8)** stays in the story as a separate murder (decided). When and where does it happen?
7. **The Loading dock:** once the way is open, why doesn't the Entity get out before the confrontation in hour 8? For example, the police arrive first, or someone is in the way.

### Hour 8: the confrontation and the sealing

**The last hour in the game.**

1. **The police are called.**
2. **The confrontation.** **Raymond and the others confront Jamal**, still possessed by the Entity.
3. **Raymond shoots Jamal.**
4. **The sealing.** The scientists **activate Artifact-01**, and believe it **pulls the Entity back in**. It doesn't: at the moment of the shot, the Entity **jumps into Raymond** (decided, revealed in hour 9).
5. **The SWAT team.** At the end of the hour, a **SWAT team** comes in and **secures the building**. **Everything seems to be over.**

**The scientists' side plot (decided):** through the night, the scientists work out **how the Entity works** and **how it's linked to Artifact-01**. They come up with a theory: **if the carrier is killed, the Entity returns to the artifact, where it can be sealed.** Hour 8 is when they put the theory to the test.

**Why this works:**

- **The scientists' theory gives the player a parallel investigation.** The player is working out the same things the scientists are, from the logs. Their conversations can confirm the player's guesses, or mislead them.
- **Raymond shooting Jamal is a tragic irony.** Raymond was a carrier himself, and Jamal is innocent. The player may be the only one who ever understands that.
- **"Seems to be over" sets up the final twist** in hour 9: the Entity jumped into Raymond when he shot Jamal.
- **A gunshot is a strong final shared event,** heard across many rooms at the same minute.

**Questions about hour 8:**

1. **Who calls the police,** and how? The phone lines, a radio, or the director's phone?
2. **Who confronts Jamal,** and where? Near the Loading dock seems likely.
3. **Which scientists** activate Artifact-01, and from where: the Observation post, or the Vault?
4. **How do the scientists build their theory?** Which observations lead them to it, and in which hours? The Compass, the 1-minute recording gaps, and the memory gaps could all feed into it.
5. **The Entity isn't sealed (decided).** When Raymond shoots Jamal, the Entity jumps into Raymond. The scientists' theory was wrong, or at least incomplete. See *Hour 9*.
6. **The clue at the moment of the shot:** Artifact-01's 1-minute recording gap in the Observation post (and the Vault) marks a **jump**. If it happens at the minute of the gunshot, a careful player can tell the Entity jumped instead of returning. Should anything else react when the scientists activate the artifact, to make them believe it worked?

### Hour 9: the interviews (bonus hour)

**A bonus hour that wraps up the plot threads and delivers the twist.**

- A **police detective** interviews the people left in the facility, **one at a time, in different rooms**.
- **All the remaining threads are tied up.** For example:
  - The **drugs are discovered and explained** (Secret 5).
  - The surviving **scientists are interviewed and debriefed**, which explains what they worked out about the Entity and Artifact-01.
- **The logs are released to the player one at a time**, instead of in a batch.
- **The last log is Raymond's interview.** It becomes clear that **the Entity isn't trapped in the artifact. It's in Raymond.** It jumped into him when he shot Jamal.
- **The last lines** make it clear that the Entity has **jumped into the detective**. The game ends on the detective's line: **"Indeed."** (decided).

**Why this works:**

- **It rewards the player's work.** By hour 9, the player has rebuilt the whole night. The interviews confirm what they've worked out, and settle the side stories, so the twist lands on a player who feels they understand everything.
- **The Entity finally gets what it wanted.** All night it tried to get out of the facility. The detective is someone who will simply walk out of the door.
- **The player should spot the tells before anyone in the room does.** Raymond's interview should show the Entity's tells: "Indeed.", no contractions, no nicknames, literal answers. A player who has been tracking them will realise the truth a few lines before the end.
- **It recasts hour 8.** Players who go back to the moment of the shot can find the evidence: Artifact-01's 1-minute recording gap at the minute of the gunshot shows a **jump**, not a return.
- **The detective is an outsider.** Like the delivery driver, the AI won't recognise his voice, so he gets a random ID. That makes the final jump visible only through the tells.

**Questions about hour 9:**

1. **The detective:** name, voice and manner. Added to [characters.md](characters.md) as a suggestion.
2. **Who is interviewed, and where?** Each interview in a different room makes a final round of placement. Who's left: everyone except Gus, Jamal and the murdered scientist?
3. **How does the one-at-a-time release work?** Does each interview have to be placed correctly before the next one is released?
4. **Which threads does each interview close?** For example: Danny and the drugs, Luis and the badge, the maintenance crew's guilt over the short, the director's corner-cutting, the Music Box, the Compass, and the scientist's murder.
5. **The last lines (decided):** the game ends on the detective saying **"Indeed."** How the lines before it set this up (for example, Raymond suddenly asking what they were talking about) is still to be written.

### Notes for writing the timeline

- **Shift hours:** the exact clock times of the 9 hours.
- **The night, room by room:** the full minute-by-minute timeline.
- **The actual conversations,** before any transcription errors or corruption.
- **Shared events:** sounds, alarms, announcements and radio calls heard in more than one room. These are what the player uses to date logs, so the timeline needs plenty of them, spread across the night. Examples:
  - Loud sounds: bangs, crashes, breaking glass, gunshots
  - Alarms, sirens and lockdown klaxons
  - Facility-wide PA announcements, heard in every room with audio
  - Power cuts or the lights failing, which people react to out loud
  - The HVAC system going down with a loud clunk, and then people mentioning that it's getting hotter and hotter
  - The lab temperature alarm, which goes off exactly one hour after the lab passes its temperature limit
  - Radio calls, heard in the rooms at both ends (see *Secrets*)
  - Artifact-01 reacting to a jump: a 1-minute gap in the Observation post log, followed by people reacting, at the same minute as the jump elsewhere
  - The coffee machine: `[COFFEE MACHINE BEEPING]` or `[GRINDING]` in the Kitchen, and people mentioning a fresh pot elsewhere
  - People moving: someone says "heading to the lab now", and their badge appears in the lab's proximity data a minute later

---

## Mysteries

There are two layers.

1. **Surface mystery:** who, what, when and how. This is revealed through the logs themselves as the player places them, and is fully laid out once every log is correct.
2. **Secrets:** things that are **never explicitly stated** in the logs. The player has to deduce them for some behaviours and logs to make sense. A player who works them out suddenly understands why the whole night fits together. These are the real payoff.

### Secrets

Some secrets are mundane facts about how the facility works, like the radios. Others are supernatural: what the artifacts do, and how their effects shaped the logs and people's actions.

The strongest design trick is that **some things that look like transcription errors or corruption are not errors at all**. They are true events recorded faithfully. The player starts by "fixing" them and later realises the log was telling the truth.

For each secret, record:

| Field | Description |
|-------|-------------|
| **Truth** | What is actually going on |
| **Why it's never stated** | Who knows it and why nobody says it outright |
| **Clues** | The specific log lines and records that point to it (aim for 3 or more, across different logs) |
| **What it explains** | Which contradictions or "errors" stop being confusing once you know it |
| **Red herrings** | Plausible wrong explanations the player might settle on first |

#### Secret 1: Radios

| Field | Description |
|-------|-------------|
| **Truth** | Some staff carry radios. When someone talks over a radio, their voice comes out of the other radio and is picked up by that room's audio sensor. The AI tags it with the speaker's badge ID, so the speaker shows up in the log of a room they aren't in. |
| **Why it's never stated** | Everyone at the facility takes the radios for granted. Nobody says "I'm talking on the radio". |
| **Clues** | <ul><li>Radio speech patterns: "over", call signs, "come in", "copy that"</li><li>Sound tags like `[STATIC]` or `[RADIO CHIRP]`</li><li>A speaker who talks but never seems to hear anything else said in the room</li><li>Proximity data placing the speaker in a different room at that time</li><li>The other half of the conversation appearing in that other room at the same time</li></ul> |
| **What it explains** | Badge IDs speaking in rooms where proximity says they aren't. One person seeming to be in two places at once. |
| **Red herrings** | The AI attributing the speech to the wrong person, someone using another person's badge, or something supernatural. |

**Design notes:**

- Each radio call works as a **shared event**. The same exchange appears in the logs of both rooms at the same minute, so placing one end helps the player place the other.
- Whoever carries a radio should be part of the cast design. For example, security and maintenance carry radios, and scientists don't.
- A radio being somewhere it shouldn't be, such as dropped, taken or left behind, could be a strong late-game twist.

#### Secret 2: The Entity

| Field | Description |
|-------|-------------|
| **Truth** | A mind from Artifact-01 is moving from person to person through the night. Whoever it's in acts on its behalf, while that person is suppressed. |
| **Why it's never stated** | The carriers don't know it happened: they're suppressed while it's in them, and remember nothing of it afterwards. The Entity knows, but it won't say. The audio logs only show badge IDs, so the AI tags its words with the carrier's ID. |
| **Clues** | <ul><li>Its **tells** ("Indeed." and no contractions) appearing from different badge IDs at different times</li><li>People acting out of character, or doing things that make no sense for their role</li><li>Memory gaps after a jump: "Wait, when did I say that?", "I don't remember doing that"</li><li>Asking to hear something again that they were already told: "Sorry, what was the door code again?"</li><li>Picking up a task where they left off, as if no time has passed</li><li>Going to do something they already did while they were a carrier, such as making coffee that's already been made</li><li>Proximity data: every time the tell moves from one badge ID to another, both people were in the same room just before</li><li>A conversation in the Observation post suddenly stopping for a minute, then resuming with people reacting to Artifact-01 flashing, at the same minute as a jump elsewhere</li><li>Someone not remembering something they clearly said or did in an earlier log</li></ul> |
| **What it explains** | Why several people seem to be working together without ever talking about it. Why trusted people did terrible things. Why people deny things the logs show they did. Why the blame seems to shift from person to person. |
| **Red herrings** | A conspiracy among several staff, one person lying to cover for another, drugs or a gas leak, or the AI mishearing the same word. |

**Design notes:**

- **Tracking the Entity is the core deduction.** Once the player spots the tell, they can follow it from carrier to carrier. The proximity data shows who it could have jumped to at each moment, so the player can rebuild its route through the night.
- **It ties to the badge log.** The badge ID on each line is correct: the AI really did hear that person's voice. The twist is that the mind behind the voice was the Entity.
- **It ties to the theme.** The Entity literally shifts from carrier to carrier.
- **Interaction with radios:** the Entity's tell can be heard over a radio from someone in another room. That's a good trap, because the player might think it jumped across the facility when it didn't. Decide whether the Entity can travel *through* a radio. The default is no.
- **Artifact-01's reaction times the jumps.** The 1-minute gap in the Observation post log happens at the same minute as a jump somewhere else in the facility. That lets the player sync the log where the jump happened with the Observation post log, even when the two rooms are far apart.
  - It's **not proximity-based**: it works for jumps in rooms with no proximity sensor, or no sensors at all.
  - The player first has to connect the artifact's reaction to the jumps. Early on, the scientists' comments just sound like an unexplained fault.
  - **The gap is the clue.** A conversation that cuts off mid-flow for exactly one minute, then resumes with "Did you see that?", is easy to spot once the player knows what it means. Before that, it looks like ordinary corruption.
  - Corruption elsewhere should rarely produce a clean 1-minute gap, so the artifact's gaps stay recognisable.
- **The memory gaps after a jump are subtle on purpose.** A former carrier isn't obviously confused. They carry on as normal, and the gap only shows when someone asks about something they did as a carrier, or when they ask to hear something again. Players have to notice that the person asking was present when it was said.
- **The gaps are also anchors for dating logs:** everything a person can't remember happened while they were a carrier. The last thing they *do* remember marks roughly when the Entity took over, and the first thing they remember after marks when it left.

#### Secret 3: The vents

| Field | Description |
|-------|-------------|
| **Truth** | The facility has a network of vents linking some of the rooms. The vents **carry sound** between the rooms they connect, and people can **crawl through them**. Someone who travels by vent moves between rooms without passing through the hallways, so they never trip the hallway proximity sensors. |
| **Why it's never stated** | The vents are just part of the building. Nobody talks about them, and anyone who uses them to get around has a reason not to mention it. |
| **Clues** | <ul><li>**Sound:** muffled speech or noises from a room that isn't next door, tagged by the AI with sounds like `[MUFFLED VOICES]` or `[ECHO]`</li><li>**Sound:** a shared event, such as a bang, heard clearly in a room that's far from its source, while rooms in between hear nothing</li><li>**Travel:** a badge ID **disappears** from every proximity sensor for a few minutes, then **reappears** in a room that isn't reachable without crossing a hallway</li><li>**Travel:** sounds like `[METAL CREAKING]`, `[SCRAPING]` or `[THUMPING OVERHEAD]` in the rooms along the route</li><li>Someone mentioning the vents in passing, such as maintenance complaining about the ductwork, or someone noticing a loose vent cover</li></ul> |
| **What it explains** | People getting into rooms without passing through the hallways. Voices or sounds turning up in rooms far from where they were made. Someone being somewhere during the lockdown that should have been impossible to reach. |
| **Red herrings** | Teleportation or another supernatural effect, a cloned badge, a proximity sensor fault, or a radio. |

**Design notes:**

- **The vents are a mundane explanation that looks supernatural.** With the Entity around, a player can easily blame a badge vanishing and reappearing on the supernatural. Working out that it was just a vent is satisfying, and it teaches the player not to blame everything on the artifacts.
- **Vent sound vs radio sound:** both put a voice in a room the speaker isn't in. The difference is that radio speech is clear, with radio habits like "over" and `[STATIC]`. Vent sound is muffled, often only partly transcribed, and both ends are rooms on the vent network.
- **Vent sound as shared events:** a sound carried by a vent appears in both rooms at the same minute, so it helps the player date logs, but only once they know which rooms the vents link.
- **The gap in proximity data** is the key travel clue. Vent travel takes a few minutes, so the person drops off every sensor for that long. Nobody walking through the hallways would do that, except someone going to the bathroom.
- **The bathrooms (decided):** the bathrooms have no sensors, but a vent carries conversations from the **men's bathroom** into another room, where that room's audio sensor picks them up. The women's bathroom has no vent, so it's a true blind spot. This makes the bathrooms the one place people *think* is private, which makes them good for secrets and confessions. In the logs, these conversations appear muffled, in a room where proximity shows the speakers aren't.
- **The bathrooms as a red herring:** someone going to the bathroom also drops off the map, because there are no sensors there. So a badge that disappears for a few minutes could mean vent travel, or just a bathroom visit. The player has to look at where the badge disappeared and reappeared: a bathroom visit starts and ends in the hallway next to the bathrooms.
- **The lockdown:** the vents could be a way around the lockdown, because they aren't sealed. That makes them a natural thing for the Entity to try. For example, it might take over someone who knows the vents, such as maintenance staff.

**To decide:**

- Which rooms the vents connect. This needs to be part of the layout.
- Which room hears the men's bathroom through the vent. This will be decided with the layout.
- How the AI tags speech it hears through a vent: with the speaker's badge ID (it recognises the voice), with an unknown speaker, or only as `[MUFFLED VOICES]`?
- Who knows about the vents, and who uses them that night.
- Can the Entity jump between someone in a vent and someone in a room the vent opens into? The default is no: they have to be in the same place.
- Can the Entity actually escape through the vents, or do they only go between rooms inside the facility?

#### Secret 4: Badges and locked doors

| Field | Description |
|-------|-------------|
| **Truth** | Proximity sensors track **badges, not people**. Badges can be **lost or stolen**, so a badge ID on the map shows where the badge is, not necessarily where its owner is. Some doors only open for **certain badges**, so a badge can also be how someone gets into a room they shouldn't be able to reach. |
| **Why it's never stated** | Nobody announces that they've taken someone else's badge, and someone who has lost theirs may not have noticed yet. Everyone takes the door restrictions for granted. |
| **Clues** | <ul><li>A badge in a room on the map while its owner's voice is heard in a different room</li><li>A badge that sits in one room for hours and never moves, with no voice from its owner there: a **lost** badge</li><li>Someone getting into a restricted room their role doesn't allow</li><li>Someone complaining that they can't get through a door, or asking "Have you seen my badge?"</li><li>Someone asking to borrow a badge, or holding a door for someone else</li><li>A person's voice in a room while the map shows no badge there for them at all</li></ul> |
| **What it explains** | Badges moving in ways their owners never could. People in restricted rooms they shouldn't be able to enter. The map and the audio disagreeing about where someone was. |
| **Red herrings** | The Entity possessing the badge's owner, a vent, a radio, or a sensor fault. |

**Design notes:**

- **Audio and proximity identify people differently (decided).** The AI identifies speakers by **voice**, and shows each one as their badge ID. Proximity sensors only detect the **physical badge**. A mismatch between the two is the key clue that a badge has changed hands.
- **The four secrets that put someone in the "wrong" place need different clues**, so the player can tell them apart:

  | Secret | What's out of place | Telling clue |
  |---|---|---|
  | Radio | A voice | Clear speech, "over", `[STATIC]`, a reply in another room |
  | Vent | A voice, or a person | Muffled sound; a badge drops off the map for a few minutes |
  | Badge | A badge | The badge and its owner's voice are in different rooms |
  | Visitor badge | A number | A badge ID that never matches any voice ID, moving with the delivery driver's voice |
  | Entity | A mind | The tells: "Indeed.", no contractions, literal speech |

- **Locked doors shape the Entity's route.** It needs a carrier whose badge can open the doors it wants. That gives it two ways to get somewhere: jump into the right person, or take their badge. Both should show up in the logs.
- **Restricted rooms are good story locations.** Likely candidates are the Vault, the Server room and the Security office.

**To decide:**

- Which doors are restricted, and which roles or badges can open each one. Add an **Access** column to the rooms table.
- Whose badges are lost or stolen that night, and by whom.

#### Secret 5: The drug problem (a red herring)

| Field | Description |
|-------|-------------|
| **Truth** | One of the workers has a drug problem. A friend of theirs has found out, and the worker spends part of the night trying to convince the friend to look the other way and not report it. **It has nothing to do with the Entity or the breach.** |
| **Why it's never stated** | Neither of them will say it out loud at work. They talk around it in euphemisms, and the drugs are **never explicitly mentioned** in the logs. |
| **Clues** | <ul><li>Hushed, secretive conversations between the two: "You can't tell anyone", "I'll lose my job", "I've got it under control", "It was just the once", "I know what I saw"</li><li>The friend's pressure: "You need help", "If you don't report it, I will"</li><li>The worker slipping off to private places, such as the bathrooms or the utility closet, with no sensors or only the vent</li><li>Nervous, jittery speech, with lots of filler words and false starts</li><li>Mentions of a locker, a bag or a pocket, without saying what's in it</li></ul> |
| **What it explains** | Why this worker is so secretive, defensive and nervous all night. Why they keep disappearing from the map. Why they're desperate to keep someone quiet. |
| **Red herrings** | It *is* the red herring. The player is meant to suspect this worker of being behind the breach, of working with the Entity, or of being possessed. |

**Design notes:**

- **Its job is to make the player suspicious of the wrong person.** Secrecy, lying and pressuring a colleague look exactly like guilt. The player should seriously consider this worker as a suspect before working out what's really going on.
- **It must be fair and solvable.** There should be enough clues for the player to realise it's a *different* secret, unrelated to the breach. Once they see it, the worker's behaviour makes sense, and the player can rule them out.
- **It's easy to tell apart from the Entity, if you look.** The worker's speech is the opposite of the Entity's: full of contractions, filler words and nervous slang. A player who's tracking the Entity's tells can rule out possession, but still has to explain the secrecy.
- **The men's bathroom vent** is a natural place for the key conversation. The two think they're alone, but the vent carries it into another room's log. If they use the men's bathroom, both the worker and the friend need to be men, or at least comfortable meeting there.
- **Handle it with care.** Treat the worker sympathetically, as someone struggling, not as a joke or a villain.

**To decide:**

- Who the worker and the friend are: their roles, and whether either carries a radio or has restricted access.
- Where and when the key conversations happen.
- How it ends: does the friend agree to keep quiet, report it, or is it overtaken by the lockdown?
- Does the Entity ever possess either of them? Keeping them unpossessed keeps the subplot cleanly separate, but one brief possession could make it even more confusing.

#### Secret 6: The Compass

| Field | Description |
|-------|-------------|
| **Truth** | The Compass always points at the Entity. Whoever carries it is following the Entity through the facility. |
| **Why it's never stated** | The staff know what the Compass does, so they never explain it. They only describe where it's pointing. |
| **Clues** | <ul><li>Someone narrating a direction or a room: "It's pointing at the server room"</li><li>The directions matching the Entity's route, once the player has tracked it by its tells</li><li>The Compass holder always moving towards wherever the Entity's tells were last heard</li><li>The compass "spinning" or "swinging round" when the Entity jumps nearby</li><li>The Entity's carriers trying to get hold of the Compass, or get rid of it</li></ul> |
| **What it explains** | Why one person seems to follow, or be one step behind, a string of others all night. Why the Entity's carriers keep trying to get one particular object. |
| **Red herrings** | That the Compass holder is the culprit, stalking people. That "it" means a person, or an animal loose in the facility. |

**Design notes:**

- **It confirms the Entity's route.** Once the player understands the narration, it double-checks the route they rebuilt from the tells and proximity data.
- **It's also a placement tool.** "It's pointing at the Vault" at a known moment ties that log's time to where the Entity was.
- **It's a chase.** The Compass holder and the Entity can become the main thread of the night, with the holder always arriving just after the Entity has moved on.

#### Secret 7: The Music Box

| Field | Description |
|-------|-------------|
| **Truth** | The Music Box puts anyone who hears it to sleep. Some of the night's silences and lost time are people asleep, not possessed and not missing. |
| **Why it's never stated** | The sleepers don't know what happened. They just wake up confused. Anyone who sets it off on purpose won't say so. |
| **Clues** | <ul><li>`[MUSIC]` or `[MUSIC BOX]` in a log, followed by silence</li><li>`[SNORING]` or `[HEAVY BREATHING]`</li><li>Several badges in the same room that stop moving at the same moment, for the same length of time</li><li>Unanswered radio calls: "Come in... come in, are you there?"</li><li>People waking up together, confused: "Did I fall asleep?", "How long was I out?"</li></ul> |
| **What it explains** | Gaps where several people go silent at once. Guards who didn't respond. A route the Entity took past people who should have stopped it. |
| **Red herrings** | The Entity, because both leave people with lost time. A gas leak. People lying about where they were. |

**Telling sleep apart from the Entity:**

- The Music Box affects **everyone in the room at once**. The Entity only affects **one person at a time**.
- Sleepers are silent and still. The Entity's carrier keeps talking and moving, with its tells.
- Sleepers wake up together, knowing they fell asleep: "Did I fall asleep?" A former carrier doesn't notice anything until someone asks them about the time they lost.

#### Secret 8: The murder and the missing badge

| Field | Description |
|-------|-------------|
| **Truth** | While in one carrier, the Entity **kills a scientist** and **takes their badge**. Later, the Entity jumps from the carrier to someone else. The carrier carries on as normal, with the dead scientist's badge on them, and **doesn't know it**. The carrier then spends time in the **Security office** with someone else, searching for the missing badge, only to discover **they've had it on them all along**, with no memory of how they got it. |
| **Why it's never stated** | Nobody saw the killing except the Entity's carrier. The carrier genuinely doesn't remember it. The Entity won't say. |
| **Clues** | <ul><li>The scientist's voice is **never heard again** after a certain point, often after `[STRUGGLE]`, `[THUD]` or a cut-off sentence</li><li>The scientist's **badge keeps moving** on the map after that, travelling with the carrier, while the scientist's voice is silent</li><li>The carrier's speech shows the Entity's tells during the time of the killing</li><li>During the search in the Security office, the map shows the scientist's badge **in the Security office**, right where they're searching</li><li>The discovery: "Wait... it's in my pocket", "How did I get this?", "I don't remember picking this up"</li></ul> |
| **What it explains** | Why the scientist goes silent, but their badge doesn't. Why the carrier has the badge. Why the carrier seems guilty of murder, and why they seem honestly baffled. |
| **Red herrings** | That the carrier is the murderer, lying about not remembering. That the scientist is alive and hiding. That someone planted the badge on the carrier. |

**Design notes:**

- **This is the "shifting blame" hook at its strongest.** Every ordinary clue points at the carrier: they had the badge, and they were there. Only a player who has tracked the Entity's tells can see that the carrier's body did it, but the carrier didn't.
- **The Security office scene uses dramatic irony.** The player can see the scientist's badge sitting in the Security office on the map while the two people search for it. The player may work it out before they do.
- **The search can use the security system itself.** The two people look up the badge's location, and the system says it's right there in the room with them. That's a strong moment to write.
- **It ties to the badges secret.** The proximity sensors track the badge, not the person, which is exactly what lets the dead scientist's badge keep "walking around".
- **It needs care with the Music Box.** A scientist who goes silent could also be asleep. The difference is that a sleeping person's badge stays still, while a dead scientist's badge keeps moving with someone else.

**To decide:**

- **Who** the scientist is, who the carrier is, and who searches with the carrier in the Security office.
- **Where and when** the killing happens. A room without audio would hide it; a room with audio would capture it, perhaps muffled or corrupted.
- **Why** the Entity kills them and takes the badge. For example: the badge opens a door the Entity needs, the scientist realised what was happening, or the scientist was carrying the Compass.
- **Why** the carrier is looking for the badge. For example, they're searching for the missing scientist by tracking their badge, or they're security, responding to a badge alert.
- **The body:** is it found during the night, by the morning shift, or by the player?
- **Is this the "horrible security incident"** the player arrives after, or one part of it?

#### Secret 9: Luis's badge, lost in the men's bathroom

| Field | Description |
|-------|-------------|
| **Truth** | Early in the shift, **Luis** (a cleaner) **loses his badge in the men's bathroom**. For a while, his **voice** is heard in rooms where his **badge** isn't. He knows he **definitely had it when he came in**, because he used it to get into a **restricted area** earlier. He tells **Danny**, the night guard, who says he **won't report it**, but Luis needs to find it. Later in the shift, it's **found and returned** to him. |
| **Why it's never stated** | Luis doesn't know where he lost it, only that he had it earlier. Danny keeps it off the record, so there's no official report. |
| **Clues** | <ul><li>The owner's badge **vanishes from the map** after a visit to the men's bathroom, which has no sensors, and doesn't come back</li><li>The owner's voice is heard in rooms where the map doesn't show them</li><li>Luis telling Danny it's missing: "I had it when I came in. I used it on the door earlier." Danny: "I won't write it up, but you need to find it."</li><li>Earlier, Luis's badge on the map entering a restricted area, which proves he had it then</li><li>The owner asking people to let them through doors, because their badge won't</li><li>The finder in the men's bathroom, heard through the vent: "Whose badge is this?"</li><li>The badge reappearing on the map **with the finder**, then moving to the owner</li></ul> |
| **What it explains** | Why one person's conversations can't be placed using proximity data for part of the night. Why their badge disappears and later turns up with someone else. |
| **Red herrings** | Vent travel, because the badge vanishes in a room with a vent. A stolen badge (Secret 4). The finder looking like a thief while they carry two badges. |

**Design notes:**

- **Its main job is to make placing logs harder.** While the badge is lost, the owner's voice has no badge on the map to match, so the player can't use proximity to work out which room their conversations are in. They have to use other clues, such as what's said, who else is speaking, and shared events.
- **The men's bathroom has no proximity sensor**, so the lost badge doesn't show anywhere on the map. It isn't a badge sitting still in one room; it's simply gone.
- **Luis telling Danny is a good timing anchor.** It marks when Luis noticed. Since Danny keeps it off the record, there's no official report: the player only learns about it from the conversation.
- **The restricted area matters.** Luis's badge entering a restricted area early on proves he had it then, and narrows down when and where he lost it.
- **Danny's favour can set up the drug problem** (Secret 5). Danny does Luis a favour by not reporting the lost badge. If Luis later finds out about Danny's drug problem, Danny can ask him to return the favour. That makes Luis's choice much harder.
- **The finder must be someone who uses the men's bathroom.** Their conversation there, if any, is carried by the vent.
- **It overlaps with the murder** (Secret 8), where another badge goes missing. The two can confuse each other on purpose: the player may mix up which missing badge the Security office search is about. Make sure both can be told apart in the end.

**To decide:**

- Who finds Luis's badge, and when. One idea: Luis searches the men's bathroom for it and walks in on Danny using, which is how he discovers the drug problem.
- Which restricted area Luis used his badge on earlier.
- Whether the owner's restricted access matters while the badge is lost, for example being locked out of their usual rooms.
- Whether the Entity is involved: for example, does it ever possess the owner or the finder?

#### Secret 10: The lab coat in the heat

| Field | Description |
|-------|-------------|
| **Truth** | Scientists clip their badges to their **lab coats**. After the HVAC goes down and the facility heats up, a scientist **takes off their lab coat** and leaves it behind, **with the badge still clipped on**. From then on, their badge stays where the coat is, while they go somewhere else. |
| **Why it's never stated** | Taking a coat off in the heat is too ordinary to mention, and nobody thinks about the badge on it. |
| **Clues** | <ul><li>Complaints about the heat just before: "It's boiling, I'm taking this off"</li><li>`[RUSTLING]` or someone saying "Hang that up for me?"</li><li>The scientist's badge **stops moving** on the map, while their voice turns up in other rooms</li><li>Later, someone noticing: "Whose coat is this?", "You left your coat in the lab"</li><li>The scientist picking it up again, and the badge moving with their voice once more</li></ul> |
| **What it explains** | Why a scientist seems to be in one room on the map but is heard in another, after the heat sets in. |
| **Red herrings** | A lost or stolen badge (Secrets 4 and 9), vent travel, a radio, or the Entity. |

**Design notes:**

- **It ties to the HVAC and the heat.** It can only happen after the clunk, once people start complaining about the heat. That gives the player a clue about when it started.
- **It's different from a lost badge.** The badge doesn't disappear: it sits still in a room with a sensor. The scientist knows exactly where it is, and doesn't go looking for it.
- **Someone else could pick up the coat**, for example to move it, or by mistake. Then the badge moves with the wrong person for a while.

**To decide:** which scientist, where they leave the coat, and for how long. A scientist who moves around a lot would make this most confusing, such as the Compass holder.

#### Secret 11: Talking about the past

| Field | Description |
|-------|-------------|
| **Truth** | People often **talk about earlier events**: retelling what happened, explaining to someone who missed it, or arguing about who did what. Those conversations happen **later** than the events they describe. |
| **Why it's never stated** | It's just how people talk. Nobody says "I'm now describing something that happened earlier." |
| **Clues** | <ul><li>Past tense and time words: "earlier", "when the alarm went off", "before the lights went out"</li><li>Details that depend on things that have already happened, such as the heat, the lockdown, or someone already missing</li><li>Who's in the conversation: someone who wasn't there being filled in, like the intern or the delivery driver</li></ul> |
| **What it explains** | Why a log mentions an event but doesn't line up with it. A log that describes the bang is not the log where the bang happened. |
| **Red herrings** | It *is* a trap: the player may place a retelling at the time of the event it describes. |

**Design notes:**

- **It's a trap for placing logs.** A player who sees "the loud bang" in a log may assume the log is from the moment of the bang. The real shared event is recorded as a sound, like `[LOUD BANG]`; a retelling only talks about it.
- **Retellings are also useful.** They confirm the **order** of events, even when they don't give the time. "After the alarm, but before the lights went out" narrows a window.
- **People's versions can disagree.** Retellings are memories, so they can be wrong, or differ between people.
- **Former carriers can't retell what they did as carriers.** A retelling with a gap, such as "I was in the lab, and then... I was in the kitchen", is a quiet clue to the Entity (Secret 2).
- **The intern and the delivery driver** are natural listeners for retellings, because they missed things, or don't understand them.

#### Possible secrets for other artifacts

These are suggestions only, not decisions, if more artifacts are added later:

- **Time:** an artifact that shifts time locally, so a shared event seems to happen *before* its source, or a log only fits at a time that seems impossible. This also fits the theme.
- **Memory:** an artifact that erases or rewrites memories, so people's later statements contradict their own earlier transcripts.
- **Presence:** the AI transcribes a voice in a room where proximity shows nobody, and there's no radio, vent or carrier to explain it.

Once the player knows about radios, vents, badges and the Entity, a voice in an empty room *with none of them* to explain it stands out much more.

#### Secrets 12 onwards

*To be written.*

### Things to decide

- Does the player ever get confirmation of the secrets? For example, optional extra questions at the end, an artifact catalogue to fill in, or an ending that changes depending on what they worked out.
- Can every log be placed without understanding the secrets, or do some placements only make sense once you know them?

---

## Story-driven game settings (to be decided)

These gameplay settings depend on the story, so they're decided here:

- **Batches:** how many logs are in each batch, how many correct placements unlock the next one (this can differ per batch), and which logs go in which batch.
- **Timeline expansion:** the game **starts with hour 6** (decided). Which hours open up as later batches arrive is still to be decided, until hours 1 to 8 are all available. Hour 9 comes last, as a bonus.
- **The ending:** the game ends with the final lines of **Raymond's interview** in hour 9, as the Entity jumps into the detective. **The very last line is the detective saying "Indeed."** (decided).
- **Hours in the game:** hours 1 to 9 (decided). The game starts with hour 6. Hour 9 is a bonus hour.
- **Hour 9's logs are released one at a time (decided)**, instead of in a batch. The **last one is Raymond's interview**.

---

## Writing checklist

- [ ] The facility's name, the security system and the room layout (room IDs and sensors)
- [ ] The Entity: any extra tells, what it wants, how it got out, its jumping rules, and where it is now
- [ ] The Compass and the Music Box: who has them, where they're kept, and how they're used that night
- [ ] Decide whether to use the Null Jar
- [ ] The cast: names, roles, badge IDs, radios, motives and secrets
- [ ] The secrets (radios, the Entity, the vents, badges, the drug problem, the Compass, the Music Box, the murder, the lost badge, the lab coat and talking about the past drafted; any more to come)
- [ ] Door access: which rooms are restricted, and which badges open them
- [ ] The vent network: which rooms the vents link
- [ ] The true timeline and conversations, with enough shared events
- [ ] Split the conversations into logs (15-minute blocks), and assign each log to a batch
- [ ] Decide which transcription errors and corruption to apply to each log, and which clues let the player place it
- [ ] The ending
