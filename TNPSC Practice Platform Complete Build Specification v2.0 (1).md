# TNPSC Practice Platform: Complete Build Specification v2.0

**Status:** Final consolidated specification, 25 Oct 2026. **This document is standalone.** It replaces the earlier "Build Specification v1.0" and the "Decisions Addendum v1.1". Give the builder only this document, plus the official syllabus PDFs listed in section 0.\
**Owner:** Abdul (Abd Azee). **Second user:** the owner's sister. **Builder:** the owner's friend, working with Claude.\
**Exams:** TNPSC Group 4 and Group 2/2A Prelims, both equally.

---

## 0. How to use this document

- **Words.** "Must" means required. "Should" means do it unless there is a good reason not to, recorded in DECISIONS.md. "May" means optional. **VERIFY** means a fact to confirm from an official source before it is relied on (section 23).
- **Order of truth.** (1) this document, (2) DECISIONS.md (the builder's record of choices this document leaves open), (3) code comments. If code and this document disagree, fix the code, or change this document on purpose in the same commit.
- **Build order.** Section 19. Work one phase at a time. For every rule in sections 6 and 8, write the test before the code.
- **Never invent TNPSC facts:** exam numbers, syllabus text, dates or answers. If unsure, mark it VERIFY, or leave the question as a draft.
- **Keep in /docs/syllabus:** the official syllabus PDFs for Group 4 (code 496) and Group 2/2A Prelims (code 495), both dated 12.12.2024, plus the Group 1 prelims (497) and mains PDFs (498, 469, 583) and the Tamil Eligibility Test schemes, which are used for the written-practice prompts in section 9.
- **Working with Claude.** Section 20 gives the method and ready prompts.
- **Plain language.** The owner has limited technical knowledge. Write DECISIONS.md and every owner-facing message in plain English.

---

## 1. Product definition

**Purpose.** Help two people prepare for TNPSC exams by practising **every kind of question TNPSC asks**, finding what they get wrong, bringing wrong questions back at the right time until they are retained, tracking syllabus coverage honestly, and building a daily study habit. The app measures practice honestly. It never promises exam results.

**Users.** Two people, two logins, nothing more. The owner prepares for Group 4 and Group 2/2A. His sister prepares for Group 2/2A (Tamil language paper).

**The core loop.** Practise, save the mistakes, bring them back on a schedule, show progress honestly, practise again. Features that do not serve this loop or the syllabus-completion goal are outside the first release.

**Principles.** Every rule follows from these nine:

1. **Study time first.** A quiz starts in 3 taps from Home. The app never makes a person feel they lost work.
2. **Never lose an answer.** An in-progress test survives a reload, a crash, a phone call and a bad network.
3. **Be honest with numbers.** New-question accuracy and repeated-question accuracy are always shown separately. Small samples say "not enough data". Marks from an unchecked exam setup carry an "unverified" label.
4. **Exams are data.** No exam name, count, time or mark is written into the logic.
5. **Private by default.** Each person's attempts and mistakes are private. Only the question bank is shared.
6. **Facts are verified by a human.** AI may transcribe, map, check and suggest, but a question or summary is never live until a person has checked it against the official source.
7. **Real formats.** The app practises the formats TNPSC really uses (statements, assertion and reason, match the following, arrange in order, passages, tables, pictures), not only plain multiple choice.
8. **Small and boring.** Choose the simplest design that meets the rule.
9. **Free to run.** Every service used must have a free plan that covers two users.

---

## 2. Decisions register

The owner made these decisions. They are binding.

| # | Topic | Decision |
| --- | --- | --- |
| 1 | Exams | Group 4 (code 496) and Group 2/2A Prelims (code 495), equally important |
| 2 | Releases | One release. Time tracking, streak, 60-minute goal, PWA, reminders and backups are in it |
| 3 | Builder | The owner's friend, with a Claude Pro plan, builds the whole app. Weekly hours unknown |
| 4 | Stack | Supabase and Vercel, free plans only |
| 5 | Devices | Two android phones |
| 6 | Question source | Claude converts official past-paper PDFs Samacheer Books, then people verify |
| 7 | Verification | Claude checks, then **one human confirms** against the official TNPSC answer key, or the textbook if no key exists |
| 8 | Syllabus filter | Keep only previous-year questions that match the **current** syllabus |
| 9 | Papers to load | Everything available, newest first |
| 10 | Pictures | Stored inside questions |
| 11 | Languages in questions | Store **both Tamil and English** text per question, with a Both, Tamil and English switch |
| 12 | Screen language | Tamil and English, each person chooses |
| 13 | Question formats | **All TNPSC objective formats** are supported as structured kinds (section 6). Written practice (Tamil eligibility and descriptive tasks) is also included (section 9) |
| 14 | Streak | A day counts if **either** 60 active minutes **or** 20 questions is met |
| 15 | Mock tests | Flexible: pause and resume allowed. A paused mock is not comparable |
| 16 | Checklist | Tick-boxes per **class, book and chapter** from the Samacheer textbooks, plus unit level for subjects without chapters. The app never ticks anything by itself |
| 17 | Unit summaries | Claude drafts, a person verifies against the textbook, with page citations |
| 18 | Targets | Weekly targets that each person sets. No exam date, no penalties |
| 19 | Current affairs | A flag and an event month on a question, with a dated source |
| 20 | Search | Global search across everything the person may see |
| 21 | Privacy | Fully private between the two users |
| 22 | Reminders | Daily phone notification where supported, in-app banner otherwise |
| 23 | Backups | Free automatic weekly backup plus manual export (section 15) |
| 24 | Ownership | The friend owns the accounts and code. The owner must be added as an admin on all of them |
| 25 | Maintenance | The owner and the friend maintain it together |
| 26 | "Most asked" filter | Not built |
| 27 | Design approval step | None. Build directly, review the new screens at every phase exit |
| 28 | Import format | CSV for simple questions, **JSON Lines** for structured kinds, both with images in a ZIP |

---

## 3. Scope

### 3.1 What the app does

| Area | Features |
| --- | --- |
| Access | Two logins, allow-list, settings (exam, language paper, screen language, display language, goals, reminders) |
| Exams | Group 4 and Group 2/2A Prelims setups with 22 units (section 5) |
| Question bank | Add, edit, import, convert, verify, filter, search. All kinds in section 6 |
| Tests | Full mock, past paper, part test, unit quiz, chapter quiz, current affairs quiz, practice now, due review |
| Test player | Local save, timer, pause and resume, pace line, palette, all question kinds, language switch |
| Results | Score, answer review, new against repeated accuracy |
| Mistake Vault | Review ladder, due list, hard marks, why a question was chosen |
| Syllabus | Unit and chapter tree, checklist, practice evidence, weekly targets |
| Study support | Verified unit summaries, current affairs by month, global search |
| Habit | Time tracking, daily goal, streak, reminders |
| Written practice | Tamil eligibility and descriptive tasks with model answers, rubrics and self-scoring (section 9) |
| Safety | Local drafts, weekly backup, export, restore |
| Install | PWA on Android and iPhone |

### 3.2 Not built (see section 24)

A third user, payments, AI marking inside the app, native apps, leaderboards, a "most asked" filter, Group 1 and Group 2A Mains objective practice (files kept for later).

---

## 4. Users, access and roles

| Role | Who | What they can do |
| --- | --- | --- |
| Learner | Both users | Use their own attempts, vault, settings. Add and edit questions. Confirm (verify) questions against the source. Export their own data |
| Admin | The owner | Everything a learner can do, plus edit exam setups, units and chapters, restore backups, rebuild derived data |
| Builder | The friend | No login in production. Works on a local Supabase with fake data. Live checks by screen share |

**Rules**

- **Exactly 2 accounts**, created by hand in the Supabase dashboard (email and password). No sign-up screen, no invitation, no social login. Sign-ups must be disabled in the project settings (VERIFY the option).
- **Allow-list.** The two user IDs are stored in a `allowed_users` table and used by every security policy. A third account, even a valid one, can read and write nothing.
- **Session.** The person stays signed in on the device. Password reset is an email link from the login screen.
- **Private data.** Attempts, seen records, vault, time entries, checklist, targets, written attempts and settings are readable and writable only by their owner.
- **Shared data.** Units, exams, chapters, passages, questions, corrections and summaries are readable by both users.
- **Ownership.** The friend owns the Supabase, Vercel and GitHub accounts. **The owner must be added as an owner or admin on all three**, not as a read-only guest. Use a password manager both can reach and record who can recover each account.
- **Honest privacy note.** Privacy is enforced between the two users inside the app. Whoever owns the Supabase project can technically read the database, and that is the friend. The sister must be told this and agree to it.
- **Private use.** The app and its content are for these two people only. Do not share the link, accounts or content.

---

## 5. Exams, syllabus and units

### 5.1 How an exam is set up (data)

Every exam is a row in `exams` with a JSON `config`:

- **id and name** (`g4`, `g2-prelims`).
- **syllabus:** title, code, date, the day it was checked, link.
- **status:** `confirmed` or `needs_checking`.
- **totalQuestions, durationMin, marksPerQuestionHalf** (3 means 1.5 marks), **negativeMarkHalf** (0 means none), **showNotKnownOption** (true or false).
- **parts:** each has an id, name, level (`SSLC` or `DEGREE`) and variants. A variant has a key (`all`, `ta` or `en`) and a list of units with a question count each. A part with one variant `all` is not a language part.
- **Validation on save:** the counts of each possible paper add up to `totalQuestions`. Every unit id exists. Marks and times are positive whole numbers.
- **Setup changes never rewrite history.** Each attempt stores a copy of the numbers it used.

### 5.2 Exams in the first release

| Exam | Questions | Time | Marks | Negative | Syllabus | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Group 4 (`g4`) | 200 (75 + 25 + 100) | 180 min | 300 (1.5 each) | None | Code 496, 12.12.2024 | needs\_checking |
| Group 2/2A Prelims (`g2-prelims`) | 200 (75 + 25 + 100) | 180 min | 300 (1.5 each) | None | Code 495, 12.12.2024 | needs\_checking |

Secondary sources agree on 200 questions, 3 hours, 300 marks, no negative marking, an offline OMR paper, and 90 marks as the Group 4 qualifying mark, but they are not official. The admin must check the latest official notification, record its title, date and link, and then set `confirmed`. Until then marks show an **"unverified"** label. Also VERIFY: the pass mark for the Tamil part (not modelled in the first release), and whether question papers print an "(E) Answer not known" option. If they do, set `showNotKnownOption` to true.

### 5.3 Units (one shared list, authoritative IDs)

Marks are questions × 1.5. Tamil unit names must be copied exactly from the official PDF.

**Part A, General Studies (75).** Group 4 level `SSLC`, Group 2/2A level `DEGREE`.

| Unit id | Name | Qs |
| --- | --- | --- |
| gs-science | General Science (பொது அறிவியல்) | 5 |
| gs-geography | Geography of India (இந்தியாவின் புவியியல்) | 5 |
| gs-history-india | History, Culture of India and Indian National Movement | 10 |
| gs-polity | Indian Polity (இந்திய ஆட்சியியல்) | 15 |
| gs-economy-tn | Indian Economy and Development Administration in Tamil Nadu | 20 |
| gs-history-tn | History, Culture, Heritage and Socio-Political Movements of Tamil Nadu | 20 |

**Part B, Aptitude and Mental Ability (25), level SSLC for both exams.**

| Unit id | Name | Qs |
| --- | --- | --- |
| apt-aptitude | Aptitude (திறனறிவு) | 15 |
| apt-reasoning | Reasoning (காரணவியல்) | 10 |

**Part C, Language (100), level SSLC.** Group 4 uses Tamil only. In Group 2/2A each person picks Tamil or English in Settings (default Tamil). A test never mixes the two. English units are seeded but **disabled** because the sister takes Tamil. Enable them only if someone chooses English.

| Tamil unit id | Name | Qs | English unit id | Name | Qs |
| --- | --- | --- | --- | --- | --- |
| ta-grammar | இலக்கணம் | 25 | en-grammar | Grammar | 25 |
| ta-vocabulary | சொல்லகராதி | 15 | en-vocabulary | Vocabulary | 15 |
| ta-writing | எழுதும் திறன் | 15 | en-writing | Writing Skills | 10 |
| ta-terms | கலைச் சொற்கள் | 10 | en-terms | Technical Terms | 10 |
| ta-reading | வாசித்தல் – புரிந்து கொள்ளும் திறன் | 15 | en-reading | Reading Comprehension | 20 |
| ta-translation | எளிய மொழிபெயர்ப்பு | 5 | en-translation | Translation | 5 |
| ta-literature | இலக்கியம், தமிழ் அறிஞர்களும், தமிழ்த்தொண்டும் | 15 | en-literature | Literary Works | 15 |

**Rules**

- **Level tag.** Every General Studies question carries `level` (`SSLC` or `DEGREE`). Group 4 tests use SSLC questions only. Group 2/2A tests use DEGREE questions only. Aptitude and language questions are SSLC and shared by both exams. The owner may opt to practise degree-level questions in Group 4 practice.
- **One main unit per question.** Thirukkural appears in both `gs-history-tn` and `ta-literature`. Choose the unit by what the question tests.
- **Sub-topics** exist only as chapters (5.4) and as topic tags for reasoning and aptitude (for example dice, Venn diagrams, percentage, time and work).

### 5.4 Chapters (class, book, chapter)

Units are too coarse for "complete the syllabus", so add a chapter layer.

- **Table `chapters`:** id, class (6 to 12), book (term or volume as printed), subject as printed, chapter number, names in English and Tamil, textbook edition (year), primary unit id, optional other units.
- **Seeding.** The builder reads each textbook's contents page with Claude's help, produces a chapters CSV, and a person checks it against the printed contents page. Never copy chapter lists from a third-party site. Seed only the chapters the owner is studying now, then grow.
- **Classes:** the owner confirms per exam. Suggested start, to verify: classes 6 to 10 for Group 4 and 6 to 12 for Group 2/2A. Tamil unit VII is based on books up to the 10th standard.
- A question may carry a `chapter_id`. The chapter's unit must match the question's unit or be one of the chapter's other units.
- Store chapter names and page references only, never textbook text.

### 5.5 Current affairs

Current affairs appears in General Studies units I, II, IV and V of both syllabi (VERIFY against the latest PDFs). A question may have `is_current_affairs`, `event_month` (YYYY-MM, required when flagged), optional `event_date`, and `source_ref` (required: a dated reliable source). The flag is allowed only in `gs-science`, `gs-geography`, `gs-polity` and `gs-economy-tn`; elsewhere the import warns. Claude cannot know recent events by itself: the person supplies the dated source, Claude may turn it into a question, and a human checks it before it goes live.

### 5.6 Syllabus filter

Every question has `in_current_syllabus` and `syllabus_version` (for example `496-12.12.2024`). Only questions mapped to a unit of a current setup may be active. When a new syllabus is published, the admin updates units and runs a check listing questions whose unit no longer exists. Those are archived, never deleted.

### 5.7 Later exams

Group 1 Prelims (code 497: 175 General Studies at degree level plus 25 aptitude) fits the same engine and needs only a setup row and unit counts. Group 2A Mains (583) is also objective but its file text was damaged when read, so re-check it first. These are not part of the first release.

---

## 6. Questions

TNPSC objective papers are single-best-answer multiple choice (four options, marked on an OMR sheet), but the **stems have many shapes**. The app stores each shape as a **kind** with a structured answer, so the player can draw it properly and the importer can **check the answer key automatically**.

### 6.1 Question kinds

| Kind | What it looks like | Structured answer (for the automatic check) |
| --- | --- | --- |
| `direct` | A plain question with four options. Includes fill in the blank (கோடிட்ட இடம்), word forms, synonyms, idioms, proverbs, author or work identification | None. Human check only |
| `statements` | 2 to 5 labelled statements or pairs (I, II, III or 1, 2, 3 or a, b, c). "Which is/are correct", "incorrect", "how many are correct". Includes correct-pair and incorrect-pair questions | `truth` for each item. Each option has `selects` (a set of labels, or `none`, or `all`) or `count`. The correct option must match the truth |
| `assertion_reason` | Assertion (கூற்று) and Reason (காரணம்) | `a_true`, `r_true`, `r_explains_a`. Each option has a `semantic`: `both_true_explains`, `both_true_not_explains`, `a_true_r_false`, `a_false_r_true`, `both_false` |
| `match` | List I (A to D) and List II (1 to 4 or more), options are code combinations (பொருத்துக) | `pairs` mapping. Each option has a `mapping`. Exactly one option must equal the key mapping |
| `arrange` | Put items in chronological, logical or alphabetical order, or arrange jumbled words into a sentence | `order` list. Each option has a `sequence` |
| `numeric` | Aptitude calculation with numeric options | Optional `answer_value`. The check parses the options and compares |
| `visual` | Stem and/or options are pictures: series, dice, cubes, Venn diagrams, mirror and water images, paper folding, patterns, maps, graphs | None. Alt text required in each language |
| `quote` | A quoted line (poetry or prose) and a question on its source, author or meaning | None |

Two cross-cutting features:

- **Passages.** A shared passage with several questions (reading comprehension, data interpretation). Section 6.5.
- **Tables.** Any stem may contain a table block. Section 6.2.
- **Negative stems.** Any kind may set `is_negative` ("NOT", "except", "incorrect"). The player emphasises the word, and the statement check reverses its polarity.
- **Reasoning families** (analogy, odd one out, coding and decoding, directions, blood relations, clock, calendar, ranking, series) are **topic tags**, not kinds. They use `direct`, `numeric` or `visual`.

### 6.2 Stem blocks

The words of a question are an ordered list of **blocks**. Allowed block types:

| Block | Content |
| --- | --- |
| `text` | A paragraph |
| `statement` | Label (`I`, `1`, `a`) and text |
| `assertion`, `reason` | Text |
| `list` | Name (`List I`), items with labels |
| `table` | Header cells and rows |
| `quote` | Quoted text with an optional attribution |
| `blank` | Marks a gap in a sentence |
| `image` | Reference to a stored picture, with alt text |

Each kind has required blocks (for example `assertion_reason` needs one `assertion` and one `reason`; `match` needs two `list` blocks). Validation rejects missing or extra blocks.

### 6.3 Options

- **Exactly four options**, keys `A` to `D`, in the order printed in the source. Option order is never shuffled.
- An option has text, an optional image, and the kind-specific fields (`selects`, `semantic`, `mapping`, `sequence`).
- Options may be images only, for visual questions. They still need alt text.
- **"(E) Answer not known"** is not stored. If the exam setup has `showNotKnownOption`, the player adds it as a fifth choice. Choosing it counts as a **blank** (scores 0), is recorded as `not_known`, and enters the Mistake Vault like any blank.

### 6.4 Bilingual texts and parity

- Shared fields live on `questions`. Words live in `question_texts`, **one row per language** (`ta`, `en`): stem blocks, four options, explanation.
- **At least one language is required.** Tamil language units normally carry Tamil only, and English units English only. General Studies and aptitude carry both when the source paper prints both. VERIFY on one official paper per exam.
- **Parity check.** Both languages must have the same block types in the same order, the same number of items and options, and the same labels. The correct key and structured answer are shared.
- Display switch: Both, Tamil, English, default Both, remembered per person. If a question has one language, show it without an error.

### 6.5 Passages

`passages` hold shared texts (one row per language, plus images and tables). A question with `passage_id` is shown with its passage in the player and keeps its place next to the other questions of that passage in the palette and in generated tests. A passage cannot be split across tests. If a test would include only some of its questions, include all of them or none.

### 6.6 Core fields

| Field | Rule |
| --- | --- |
| `id` | Stable text id, never reused, for example `g4-2024-p-q045` |
| `kind` | One of section 6.1 |
| `unit_id`, `level`, `chapter_id` | Section 5. `level` is required for `gs-*` units |
| `topic_tags` | Optional tags such as `dice`, `venn`, `percentage` |
| `correct_key` | `A` to `D` |
| `structure` | The kind's structured answer (6.1) |
| `is_negative` | Boolean |
| `difficulty` | `easy`, `medium`, `hard`, optional |
| `passage_id` | Optional |
| Current-affairs fields | Section 5.5 |
| Source | `source_type` (`past_paper`, `book`, `test_series`, `self_written`, `other`), exam, year, paper id, question number, provider, note, `source_ref` |
| Verification | `ai_check` (`agree`, `disagree`, `unsure`), `ai_note`, `ai_suggested_key`, `verified_by`, `verified_at`, `verified_source` |
| Housekeeping | `status` (`draft`, `active`, `archived`), `version`, `content_hash`, `added_by`, `last_edited_by`, `in_current_syllabus`, `syllabus_version` |

### 6.7 Validation (the importer and the editor run the same rules)

1. Required blocks for the kind exist, with correct labels.
2. Exactly four options, no two equal in the same language.
3. `correct_key` is `A` to `D`.
4. **Structured answer check.** For `statements`, `assertion_reason`, `match` and `arrange`, compute the correct option from `structure`. Exactly one option must match, and it must equal `correct_key`. If not, the row is an error ("the answer key disagrees with the structure"). For `numeric` with `answer_value`, the same.
5. **Bilingual parity** (6.4).
6. Unit exists, level present for `gs-*`, chapter consistent with unit.
7. Images exist, are within size limits, and have alt text in each language the question has.
8. Current-affairs rule (5.5).
9. No duplicate id. **Duplicate content** is detected by hash of the normalised text of all languages, and near-duplicates warn.
10. Length limits (6.9).

The structured answer check catches typing mistakes that a tired human would miss. It does **not** prove the key is factually right. Only the human check against the official source does that.

### 6.8 Lifecycle and verification

| Change | Who | Effect |
| --- | --- | --- |
| New or imported question | Learner or import | Starts as `draft`. Never appears in tests |
| Draft to active | A learner, after the human check | The learner ticks "I checked the source", records the source reference and the page or key number. Sets `verified_by` and `verified_at`. **No bulk activation.** |
| Draft returned | The verifier | Adds a note. Stays draft |
| Active to draft | Any learner who edits the words, options, key, structure, unit or level | `version` + 1, a correction record (what, why, source) is required, and the question leaves new tests until verified again. Old attempts keep their snapshot and show "question changed since" |
| To archived | Any learner | A reason is required. Never appears in new tests |
| Archived to draft | Admin | Needs verification again |
| Delete | Nobody | Not allowed |

- **AI is never the verifier.** `ai_check` agree with no human confirmation never makes a question active.
- **The human step** compares the question text, options and pictures with the PDF page, both language texts with each other, and the answer with the source. "It looks right" is not enough.
- **Source of truth:** (1) the official TNPSC answer key for that paper, (2) the prescribed textbook with page. Coaching keys are not a source. If Claude's suggested key differs from the official key, the official key wins and the question is flagged for a second look, because TNPSC has revised keys after objections. Record the final key and the date.
- Even a typo fix returns the question to draft. A wrong key hurts more than a delay.

### 6.9 Limits

At most 200 questions per attempt. Stem text and explanation at most 1,500 characters each per language, options at most 300. Images are compressed on upload with a maximum file size and width set in DECISIONS.md. These keep one attempt's stored items below 900 KB.

---

## 7. Content pipeline: past papers to verified questions

### 7.1 Sources, in order of priority

1. **Official TNPSC past papers** with their official answer keys, newest first, one paper at a time. The tnpsc.gov.in site is the source. Third-party sites may be used to find a paper but are never the source of truth.
2. **Prescribed textbooks** (Samacheer) for chapter practice and for answers that have no official key.
3. **Self-written or test-series questions** only with a recorded source and the same checking.
4. **Current affairs** only from a dated source supplied by a person.

Do not copy or scrape another practice site's questions, chapter lists or text. Read its Terms first. These are private-use materials for two people.

### 7.2 Conversion steps for one paper (Claude does 1 to 6, people do 7 and 8)

1. **Collect.** Save the official PDF and the official answer key. Record the exam, year, paper code and file name.
2. **Extract** about 25 questions at a time. Some official Tamil PDFs use an old font and extract as garbage text. If the text is garbled or the page is a scan, Claude must read the page **image** instead and mark that row lower confidence.
3. **Structure.** For each question choose the `kind` (6.1), build the stem blocks, the four options, and the structured answer. Keep Tamil and English texts together when the paper prints both.
4. **Map.** Choose one unit from section 5.3 and the level. If the question does not fit any unit in the **current** syllabus, write `outside_syllabus` in the note and **do not import it**.
5. **Check.** Claude sets `ai_check`, `ai_note`, and `ai_suggested_key` from the official key. If there is no key, Claude proposes an answer from the textbook with the page.
6. **Package** the JSON Lines file and the images in one ZIP (7.3).
7. **Import** as drafts. The importer runs the validation in 6.7.
8. **Human verification** one question at a time (6.8).

**Measure quality.** After the first 100 questions, count conversion errors found by the human. If there are more than 2 in 100, stop and fix the method before continuing.

**Workload.** At about one minute of careful checking per question, 500 questions take roughly 8 hours of human time. Load papers newest first and use the app while the bank grows. Do not wait for "everything".

### 7.3 Import formats

An import is a **ZIP** containing exactly one data file and optional images in an `images/` folder.

- **`questions.jsonl`** (one JSON object per line) supports every kind. This is what Claude produces. Appendix A shows examples.
- **`questions.csv`** supports `direct` questions only, with these columns: `id, unit_id, level, chapter_id, difficulty, correct, is_negative, topic_tags, text_ta, text_en, option_a_ta, option_a_en, option_b_ta, option_b_en, option_c_ta, option_c_en, option_d_ta, option_d_en, explanation_ta, explanation_en, is_current_affairs, event_month, source_type, source_exam, source_year, source_paper, source_no, source_ref, image_files, status`. A language is complete when its text and all four options are present. A row with half a set is an error.
- Maximum 400 questions and 30 MB per ZIP.
- Images are named in the file (`image_files` or the block `file`). A name that is not in the ZIP is an error.

### 7.4 Import process (all steps required)

1. Check file type and size, then unzip safely (no path tricks, no nested archives).
2. Parse as UTF-8 and normalise all text to Unicode NFC.
3. Validate every row with the same rules as the editor (6.7).
4. Detect duplicate ids and duplicate content, inside the file and against the database.
5. Show a **preview table** with a row-level error list (row, field, message), with icons as well as colour.
6. If any row has an error, nothing is written until the person explicitly chooses "import only the valid rows".
7. Write in batches of at most 100 rows in one transaction each. If a batch fails, report exactly which rows were not saved. A half-written question must never exist.
8. Upload images to private storage, compressed, then attach them.
9. Save an `import_logs` record (file, counts, errors, who, when).
10. Everything arrives as **draft**.

### 7.5 Corrections after TNPSC revises a key

When TNPSC publishes a revised key, a learner opens the question, changes the key and records the reason and the source. The question returns to draft and is verified again. Old attempts are never rewritten. They show "key corrected" with the date, and the result page can show both scores (original and corrected) for past papers.

---

## 8. Business rules

Every rule here is a **pure TypeScript function** with no database or screen code, and each needs unit tests (section 18). Times use `Asia/Kolkata` (IST). A "day" is midnight to midnight IST and a "week" starts on Monday.

### 8.1 Test kinds

| Kind | Pool and size | Order and options | Counts in mock trend |
| --- | --- | --- | --- |
| **Full mock** | One paper built from the exam setup, unit by unit, at the exam's level, in the chosen language variant | Questions shuffled inside each part, passages kept whole, options never shuffled | Yes, only if never paused |
| **Past paper** | One official paper, original order and wording | Never shuffled | Yes, only if complete and never paused. If some questions were left out as outside the syllabus, label it "partial" |
| **Part test** | One part (General Studies, Aptitude or Language) at exam counts | As full mock | No |
| **Unit quiz** | One unit, 10, 20 or 40 questions | Unseen first, then answered longest ago | No |
| **Chapter quiz** | One chapter | Same | No |
| **Current affairs quiz** | A month or a range of months | Same | No |
| **Practice now** | Mixes vault items not yet due with unseen questions | Same | No |
| **Due review** | The due queue (8.6) | Fixed by the queue | No |
| **Custom** | Chosen units, size and timer | Same | No |

If the verified pool is too small, show exactly what is missing, and offer a smaller test. **Never repeat a question inside one test and never fill a gap with draft questions.** A full mock needs the setup's count in every unit.

### 8.2 Scoring

- Per question: correct = +marks, wrong = −negative marks (zero today), blank = 0. "Answer not known" = blank.
- All numbers come from the exam setup copied into the attempt. Marks stay in half marks (integers), shown as a decimal.
- A result shows an **"unverified"** label if the exam setup was `needs_checking`.
- Scoring is one function, used by the result page, the progress page and the tests.

### 8.3 The attempt, drafts and the exactly-once submit

1. **Start:** the app picks the questions and creates an `attempt` with status `in_progress`, a client-made attempt id, and a copy of the exam setup used.
2. **Local draft:** every answer, mark for review and timer change is written to IndexedDB at once. Questions are shown from the local copy.
3. **Sync:** the draft is sent to the server when online, so the other phone can not take over a half-done test (one active attempt per person; starting another asks to resume or discard).
4. **Submit:** the client computes the results with the pure functions, then calls one database function `submit_attempt` (section 13). It writes the attempt, the question items, the `seen` rows and the vault rows in a **single transaction**, checks that those rows are unchanged since they were read (version check), and does nothing if the attempt id was already submitted.
5. If the function reports a version conflict, the client re-reads, recomputes and tries again.
6. If offline, the finished attempt waits in an **outbox** and is sent later. A submitted attempt can never be edited.
7. **Abandon** and **discard** keep nothing in the vault. A draft older than 30 days is deleted by the app after a warning.

Each question item stores a **snapshot** of what the person saw (both languages, options, key, explanation, structure, version), so history survives later corrections.

### 8.4 Pause and resume

A full mock or past paper may be paused. The countdown stops while paused and the paused time is stored on the attempt. A resumed attempt restores the timer and every answer. A paused attempt is labelled "paused" and is **not** comparable, so it stays out of the mock trend. Pause, resume and an accidental close must never lose an answer.

### 8.5 Seen records and accuracy

- A `seen` row exists per person and question: first seen date, times seen, correct count, last result.
- **New accuracy** counts only the **first** time a question is ever answered. **Repeated accuracy** counts later answers. They are always shown **separately**, with n.
- **Labels** (starting thresholds, configurable, to be reviewed after real use):
  - fewer than 10 distinct new questions in a unit: **"Not enough data"**, no percentage band;
  - 10 to 29: the percentage with an **"early signal"** tag;
  - 30 or more: a band: **below 50% needs work, 50% to 74% building, 75% and above strong.**
- Mock trend needs 5 or more comparable points before it draws a line.

### 8.6 Mistake Vault and the review ladder

**What enters the vault:** a wrong answer, a blank, an "answer not known", or a question the person marks **hard** (even if answered correctly). One vault row per person and question, with its history.

**Ladder (starting hypothesis, configurable):** stages 0 to 4 with intervals **1, 3, 7, 14 and 30 days**.

| Event | Result |
| --- | --- |
| Enters the vault | Stage 0, due in 1 day. Reason recorded (wrong, blank, not\_known, hard) |
| Correct when due | Stage + 1. Next due date = today + interval of the new stage |
| Correct before due (extra practice) | Recorded, but the stage does not move |
| Wrong, blank or not\_known at any stage | Stage 0, due in 1 day. Mistake count + 1 |
| Correct at stage 4 | Status **retained**. It returns once as a check after 60 days |
| Wrong during a retained check | Back to stage 0 |
| "Hard" mark removed | Allowed only if the question is retained |

Status words shown to people: **Learning** (stages 0 to 2), **Consolidating** (stages 3 and 4), **Retained**. Repeated success on the same question proves memory of that question, not understanding. So also show new accuracy on other questions of the same unit.

**Due queue order:** (1) overdue, longest overdue first; (2) due today, lowest stage first; (3) most mistakes. A session takes up to 30 items. Every item shows **why it was chosen** (for example "Overdue by 2 days, stage 1, missed twice"). "Practice now" mixes not-yet-due vault items with unseen questions of the same units.

### 8.7 Time tracking

- **Active time** is counted in **segments**. A segment runs while the app is visible and there was input (tap, key, scroll, answer) in the last **120 seconds**. After 120 seconds without input the segment closes at the last input.
- Segments belong to an activity (`test`, `vault_review`, `summary`, `written`, `other`) and are stored with their start and end.
- **Manual entries** (book study, paper practice, video) are added with a date, minutes and activity. They count in "total study minutes" but are shown separately from in-app minutes.
- A segment longer than 3 hours is cut and flagged. Segments under 10 seconds are dropped.
- Time that crosses midnight IST is split between the two days.

### 8.8 Daily goal and streak

- Daily goals: **60 active minutes** (in-app plus manual) **or 20 questions answered**. Each person can change the numbers.
- A day **counts for the streak** if **either** goal is met.
- **One rest day in any 7** can be marked in advance. It keeps the streak without activity.
- A missed day with no rest day left resets the current streak to 0. The longest streak is kept.
- A missed day never changes a label, blocks a feature or shows a scolding message.
- Streak and goals are **calculated** from segments, manual entries and attempts. There is no stored counter. A late-synced attempt lands on the day it happened.
- Show them low on the Progress page and compactly on Home.

### 8.9 Weekly targets

Each person may set targets for the coming week: minutes, questions, chapters to study. The app shows target against actual for the current week. Nothing penalises a missed target. Targets carry over only if the person chooses.

### 8.10 Syllabus checklist

- States for each **chapter**: `not_started`, `studied`, `revised`, with the date. The **person** sets them. The app **never** ticks anything.
- Units with no chapters (aptitude, reasoning and any unit not yet seeded) have a unit-level state.
- Unit progress = chapters at `studied` or `revised` out of all its chapters, shown as a count and a percentage. Exam progress is shown per exam.
- Beside each chapter and unit show **practice evidence**: questions answered, and the new accuracy label from 8.5. Practice evidence does not change the checklist.

### 8.11 Hard marks, search and current affairs views

- **Hard mark:** a button on the answer review. It adds the question to the vault (8.6).
- **Search:** a global search over questions, passages, units, chapters, summaries and written prompts, plus the person's **own** vault notes and written attempts. Draft questions appear only in the verification list. Results show the type and the unit and chapter path. Twenty results per page. Search normalises text to NFC, and uses a trigram index because default Postgres text search handles Tamil poorly. Tamil words with conjuncts must be found.
- **Current affairs:** a list by month, a quiz by month, and a separate accuracy view with n (it is time-bound). An event's age is shown. Old questions are never deleted automatically.

---

## 9. Written practice

Some TNPSC tasks are written, not multiple choice: the **Tamil Eligibility Test** (Group 2/2A mains, Group 1 Paper I) and the descriptive General Studies papers of the mains. The app supports these as **practice with self-assessment**. It does **not** mark them automatically.

### 9.1 Prompt kinds

| Kind | Task (from the official Tamil Eligibility scheme and the mains) | Typical limits |
| --- | --- | --- |
| `translate_ta_en`, `translate_en_ta` | Translate a passage between Tamil and English | Time and word limit per prompt |
| `precis` | Summarise a passage (சுருக்கி வரைதல்) | A set fraction of the length |
| `comprehension` | Written answers on a passage (பொருள் உணர்திறன்) |  |
| `expansion` | Expand notes into a passage (விரிவாக்கம்) |  |
| `essay_kural` | Essay on Thirukkural, on the six themes in the scheme (for example its secular character, everyday life, values, philosophy) |  |
| `letter_official` | Formal letter (அலுவல் சார்ந்தது) |  |
| `language_knowledge` | Use a word in a sentence, difference in meaning, split words, antonyms, negative sentences, correct the errors |  |
| `descriptive_gs` | A mains-style General Studies answer (optional) | Word limit |

Exact tasks and marks are taken from the scheme PDFs. VERIFY the current scheme before seeding prompts.

### 9.2 Data

- **`written_prompts` (shared):** kind, language, prompt text (blocks), unit id, time and word limits, **model answer**, **rubric** (a list of criteria, each with a name and maximum points), source and source reference, status, verified by and at.
- **`written_attempts` (private):** prompt id, response text **or** a photo of a handwritten answer (stored privately), started and ended times, active seconds, word count, **self-scores per rubric criterion**, total, note, next review date, status.

### 9.3 Flow

1. Choose a prompt. The timer starts, with a word counter.
2. Write in the app, or write on paper and add a photo.
3. Submit. The app shows the **model answer** and the **rubric**.
4. Score yourself against each criterion. The result is saved as **self-assessed**.
5. Re-attempt rule: below 60% returns in 7 days, 60% to 79% in 21 days, 80% and above does not return unless asked.
6. The time counts as study time (activity `written`). Written attempts do **not** enter the Mistake Vault ladder and are shown on their own Progress card.

### 9.4 Optional Claude feedback (free, outside the app)

A "Copy for Claude" button builds a text with the prompt, the rubric and the person's answer. The person pastes it into their own Claude chat and then enters the score. **The app never sends text to any AI service** and never auto-scores. This keeps it free and keeps the person in control.

### 9.5 Verification

Prompts, model answers and rubrics follow the same lifecycle as questions (6.8). A model answer for a Thirukkural essay must cite the couplets by number and chapter. A translation model answer must be checked by a person against the source.

### 9.6 Priority

This is **phase P8**, the last build phase before the pilot. If the friend runs out of capacity, this module is the **only** part the owner may move after the pilot. Everything else is required for the first release.

---

## 10. Unit summaries

The owner studies from books. Summaries support revision and do not replace the textbook.

| Item | Rule |
| --- | --- |
| Table | `unit_summaries`: unit id, chapter id (optional), language, body (Markdown), source (textbook edition and pages), status, `ai_drafted_at`, `verified_by`, `verified_at`, version |
| Drafting | Claude drafts from the prescribed textbook. A draft is never shown to learners |
| Verification | A person checks it against the textbook pages and activates it. A summary with no page references cannot be activated |
| Editing | Editing an active summary returns it to draft, as for questions |
| Content | Exam-relevant facts, in the learner's own words, short enough to read in a few screens. Do not copy textbook paragraphs |
| Display | On the unit page with a link to practise that unit. Search finds it |
| Languages | One row per language. A unit may have Tamil only, English only, or both |

Each person also has a private note on each unit and chapter (plain text), searchable by that person only.

---

## 11. Screens and design

### 11.1 Principles

Study first (3 taps to a quiz). Phone first (design at 360 px, then widen). Calm and high contrast. Tamil and English labels everywhere. No ads, no paywall, no download counters, no pressure. Every screen has loading, empty, error, offline and success states, written in both languages. Do not copy any other site's layout or brand.

### 11.2 Design tokens (one file, built in P0)

| Token | Rule |
| --- | --- |
| Fonts | Noto Sans Tamil and Noto Sans, self-hosted. Body at least 16 px, line height at least 1.6 |
| Spacing | A 4 px scale |
| Touch targets | At least 44 px. Answer options at least 48 px tall |
| Themes | Light and dark, both fully designed |
| States with icons | Correct (green tick), Wrong (red cross), Not visited (grey circle), Marked for review (amber flag), Answered (blue filled), Paused (neutral pause), Not known (grey question mark). **Meaning is never colour alone** |
| Contrast | At least 4.5 to 1 |
| Tamil | Never cut text mid-letter. Test at the 1.3 font scale |

### 11.3 Navigation

- **Phone:** bottom tabs: Home, Practice, Vault, Progress, More. A search icon and the exam switcher sit in the top bar.
- **Computer:** left side menu with the same items, and Ctrl or Cmd plus K for search.
- **Language:** screen language in Settings. Question display language (Both, Tamil, English) inside the player.

### 11.4 How each question kind is drawn

| Kind | Drawing |
| --- | --- |
| `direct` | Stem, then four options with letters A to D |
| `statements` | A labelled list of statements or pairs in a card, then the options. Polarity word (correct, incorrect) emphasised |
| `assertion_reason` | Two clearly labelled cards, **Assertion (கூற்று)** and **Reason (காரணம்)**, then the options |
| `match` | Two lists side by side on a computer and stacked on a phone, items labelled A to D and 1 to 4, then code options |
| `arrange` | The items as a numbered list, then the sequence options |
| `numeric` | Stem, then options in a grid. Fractions and powers in plain Unicode text or images |
| `visual` | Pictures that can be tapped to zoom, with alt text. Image options in a 2 by 2 grid |
| `quote` | The line in a quote block with its attribution, in a Tamil-friendly font size |
| Table block | A table inside the stem that scrolls sideways inside its own box, never the whole page |
| Passage | A collapsible panel pinned above the question, remembered between the questions of that passage |
| Both languages | Tamil above English in the same card, with a divider. Never side by side on a phone |

### 11.5 Screens

| Screen | Layout and must-show items |
| --- | --- |
| **Home** | One primary card: due reviews with a count and a Start button. Below it: minutes and questions against goals, the week's target bar, a small streak, Continue last test. Install hint until installed |
| **Syllabus** | Tree: exam, unit, chapter. Each row shows both language names, answered out of available, a checklist chip, the accuracy label with n, a Practice button. Units show a progress bar |
| **Practice** | Cards for Full mock, Past papers, Part test, Unit quiz, Chapter quiz, Current affairs, Practice now, Due review, Written practice |
| **Test builder** | Kind, exam, unit or chapter or month, size, timer, display language. If the pool is short, list what is missing |
| **Test player** | Top bar: timer, answered count, Pause, language switch. Centre: the question drawn by its kind. Bottom bar: Previous, Mark for review, Clear, Next. A palette drawer with the state legend. A pace line ("11 questions behind", quiet). Submit asks for confirmation with unanswered and marked counts |
| **Result** | Score with "unverified" and "paused" labels where they apply, correct, wrong and blank counts, a unit breakdown, time per question, new against repeated accuracy. Buttons: Review answers, Open Vault |
| **Answer review** | Your answer, the correct answer, the explanation, the source reference, Mark hard, a "key corrected" or "question changed since" notice |
| **Mistake Vault** | Tabs Learning, Consolidating, Retained. Filters by unit. Each card: reason, stage, next review date, why chosen |
| **Past papers** | Filter by exam and year. Each paper shows its parts, how many questions are verified, partial or complete, Start, and the official source link |
| **Progress** | New against repeated accuracy with n, unit labels, mock trend, time, goals and streak low on the page, checklist progress per exam |
| **Unit and chapter page** | Verified summary with pages, private note, the checklist state, Practice button |
| **Written practice** | Prompt list, writing screen, model answer and rubric, self-score form, history |
| **Search** | Overlay with results grouped by type |
| **Verify queue** | The PDF page image beside the question text in both languages, the answer-key source, "I checked the source" tick, reject with a note |
| **Import** | Upload ZIP, preview table, row errors, a clear count of what will be saved |
| **Settings** | Screen language, exam, language paper, display language, goals, reminders, export, install steps for Android and iPhone |

### 11.6 Design checks (no mockup step, so check early)

Build the **test player** and **Home** first within their phases, and have both users open them on their own phones before building other screens. At the exit of **every phase from P3 onward**, both users open the new screens on their own phones and leave comments in DECISIONS.md. Fix them in the next phase. A screen that is hard to use is a bug.

**Design acceptance:** no horizontal scrolling at 360 px (tables scroll in their own box); the player works one-handed and by keyboard; Tamil fits at the 1.3 font scale; the Lighthouse accessibility score is at least 90 (VERIFY the version); empty, loading, error and offline states exist in both languages; dark mode meets the same contrast rule.

---

## 12. Architecture

### 12.1 Stack (VERIFY every version and free-plan limit in P0 and record them in DECISIONS.md)

| Layer | Choice | Notes |
| --- | --- | --- |
| App | Next.js (App Router) with TypeScript in strict mode | One codebase for phone and computer |
| Styling | Tailwind CSS with the design tokens in 11.2 |  |
| Database, login, files | Supabase: Postgres, Auth, Storage | Free plan. Row Level Security on every table |
| Hosting | Vercel | Free plan. VERIFY its terms for a private personal project |
| PWA | Web app manifest and a service worker (Serwist or the current equivalent) | VERIFY it works with the Next.js version |
| Local storage | IndexedDB through the `idb` library | Drafts, outbox, cached questions and images |
| Validation | Zod | One schema set used by the editor, the importer and the database layer |
| Import | PapaParse (CSV), a JSON Lines reader, JSZip (ZIP) |  |
| Push | Web Push with VAPID keys | VERIFY support on iOS (14.2) |
| Scheduled jobs | GitHub Actions (backups, keep-alive) and a free scheduler for reminders | VERIFY free limits |
| Tests | Vitest (rules), Playwright (flows), Supabase local with automated RLS tests |  |

### 12.2 Code layout

```
/src/domain      pure TypeScript rules (no screens, no database)
/src/data        repositories: the only code that talks to Supabase
/src/app         routes and screens
/src/ui          shared components built on the design tokens
/src/i18n        English and Tamil strings
/supabase/migrations   SQL migration files (the only way to change the database)
/supabase/tests        automated RLS and function tests
/docs            syllabus PDFs, this specification, DECISIONS.md
```

### 12.3 Rules for the code

1. `domain` never imports `data`, the framework or the database library. It receives plain objects and returns plain objects.
2. Screens never call Supabase directly. They call repositories.
3. All changes to the database are migration files, applied in order, tested on a fresh local database.
4. Dates are stored in UTC and shown and grouped in IST.
5. All text is NFC-normalised on the way in. Tamil text is never cut mid-letter, so use a grapheme-aware splitter for snippets.
6. Lists are paginated and queries are indexed. The whole question bank is never loaded at once. A test loads only its own questions.
7. Three environments: local, preview and production. Production secrets exist only in Vercel and GitHub settings. The service-role key is never in client code.
8. Pin exact dependency versions and review updates before accepting them.
9. Strings the person sees come from `i18n`, never typed into a screen.

---

## 13. Database

### 13.1 Tables (create these as migrations; add `created_at` and `updated_at` where useful)

```sql
-- access
create table allowed_users (user_id uuid primary key references auth.users);
create function is_allowed() returns boolean language sql stable security definer
  as $$ select exists (select 1 from allowed_users where user_id = auth.uid()) $$;

create table profiles (
  user_id uuid primary key references auth.users,
  display_name text, screen_lang text default 'en',          -- 'en' | 'ta'
  display_lang text default 'both',                          -- 'both' | 'ta' | 'en'
  language_paper text default 'ta', active_exam text,
  goal_minutes int default 60, goal_questions int default 20,
  rest_days_per_week int default 1,
  reminders_enabled boolean default false, reminder_time time,
  timezone text default 'Asia/Kolkata');

-- shared reference data (admin edits)
create table exams (id text primary key, name text, config jsonb not null,
  status text check (status in ('confirmed','needs_checking')) not null);
create table units (id text primary key, name_en text, name_ta text, part text,
  level text check (level in ('SSLC','DEGREE')), enabled boolean default true, sort int);
create table chapters (id text primary key, class int check (class between 6 and 12),
  book text, subject text, chapter_no int, name_en text, name_ta text, edition text,
  unit_id text references units, other_unit_ids text[] default '{}');

-- shared content (learners edit; lifecycle rules in 6.8)
create table passages (id text primary key, unit_id text references units,
  status text, version int default 1);
create table passage_texts (passage_id text references passages, lang text,
  blocks jsonb, primary key (passage_id, lang));
create table questions (
  id text primary key,
  kind text check (kind in ('direct','statements','assertion_reason','match',
                            'arrange','numeric','visual','quote')) not null,
  unit_id text references units not null,
  level text check (level in ('SSLC','DEGREE')),
  chapter_id text references chapters, topic_tags text[] default '{}',
  correct_key char(1) check (correct_key in ('A','B','C','D')) not null,
  structure jsonb, is_negative boolean default false, difficulty text,
  passage_id text references passages,
  is_current_affairs boolean default false, event_month text, event_date date,
  source_type text, source jsonb, source_ref text,
  ai_check text, ai_note text, ai_suggested_key char(1),
  verified_by uuid references auth.users, verified_at timestamptz, verified_source text,
  status text check (status in ('draft','active','archived')) default 'draft',
  version int default 1, content_hash text unique,
  in_current_syllabus boolean default true, syllabus_version text,
  added_by uuid, last_edited_by uuid);
create table question_texts (question_id text references questions, lang text,
  blocks jsonb not null, options jsonb not null, explanation text,
  search_text text, primary key (question_id, lang));
create table question_images (id uuid primary key default gen_random_uuid(),
  question_id text references questions, position text,  -- 'stem','A','B','C','D'
  path text, alt_ta text, alt_en text, width int, height int);
create table question_versions (question_id text, version int, snapshot jsonb,
  changed_by uuid, reason text, source_ref text, at timestamptz default now(),
  primary key (question_id, version));
create table unit_summaries (id uuid primary key default gen_random_uuid(),
  unit_id text references units, chapter_id text references chapters, lang text,
  body text, source text, status text default 'draft', ai_drafted_at timestamptz,
  verified_by uuid, verified_at timestamptz, version int default 1);
create table written_prompts (id text primary key, kind text, lang text,
  blocks jsonb, unit_id text references units, time_limit_min int, word_limit int,
  model_answer jsonb, rubric jsonb, source text, status text default 'draft',
  verified_by uuid, verified_at timestamptz);
create table import_logs (id uuid primary key default gen_random_uuid(), user_id uuid,
  file_name text, rows int, saved int, errors jsonb, at timestamptz default now());

-- private data (owner only)
create table attempts (id uuid primary key, user_id uuid not null, exam_id text,
  kind text, status text check (status in ('in_progress','submitted','abandoned')),
  exam_setup jsonb, unverified boolean, comparable boolean,
  started_at timestamptz, submitted_at timestamptz,
  paused_seconds int default 0, active_seconds int default 0,
  score_half int, max_half int, correct int, wrong int, blank int,
  draft jsonb);
create table attempt_items (attempt_id uuid references attempts, position int,
  question_id text, version int, snapshot jsonb, chosen text,
  result text check (result in ('correct','wrong','blank','not_known')),
  marked boolean default false, seconds int,
  primary key (attempt_id, position));
create table seen (user_id uuid, question_id text, first_seen_at timestamptz,
  first_result text, times_seen int, correct_count int, last_result text,
  version int default 1, primary key (user_id, question_id));
create table vault (user_id uuid, question_id text, reason text, hard boolean default false,
  stage int check (stage between 0 and 4), status text, mistakes int default 0,
  next_due date, last_result text, retained_at timestamptz,
  version int default 1, primary key (user_id, question_id));
create table study_segments (id uuid primary key, user_id uuid, activity text,
  started_at timestamptz, ended_at timestamptz, active_seconds int, flagged boolean);
create table manual_entries (id uuid primary key default gen_random_uuid(), user_id uuid,
  day date, minutes int check (minutes > 0), activity text, note text);
create table checklist (user_id uuid, node_type text check (node_type in ('chapter','unit')),
  node_id text, state text check (state in ('not_started','studied','revised')),
  state_date date, primary key (user_id, node_type, node_id));
create table weekly_targets (user_id uuid, week_start date, minutes int, questions int,
  chapters int, primary key (user_id, week_start));
create table rest_days (user_id uuid, day date, primary key (user_id, day));
create table notes (user_id uuid, node_type text, node_id text, body text,
  primary key (user_id, node_type, node_id));
create table written_attempts (id uuid primary key, user_id uuid, prompt_id text,
  response text, photo_path text, started_at timestamptz, active_seconds int,
  words int, scores jsonb, total_pct int, note text, next_review date);
create table push_subscriptions (id uuid primary key default gen_random_uuid(),
  user_id uuid, endpoint text unique, keys jsonb, platform text);
```

**Derived, never stored:** daily activity, streak, unit progress and accuracy are calculated from these tables by pure functions or a read-only view.

**Indexes (add in P2, measure in P7):** `vault (user_id, next_due)`, `seen (user_id, question_id)`, `attempts (user_id, submitted_at desc)`, `attempt_items (question_id)`, `questions (unit_id, status, level)`, `questions (is_current_affairs, event_month)`, `study_segments (user_id, started_at)`, and a **trigram** index (`pg_trgm`) on `question_texts.search_text`, summaries and written prompts.

### 13.2 Row Level Security

Turn RLS on for **every** table. No table is readable without a policy.

| Tables | Policy |
| --- | --- |
| `exams`, `units`, `chapters` | Read: `is_allowed()`. Write: admin only |
| `questions`, `question_texts`, `question_images`, `passages`, `passage_texts`, `unit_summaries`, `written_prompts`, `import_logs` | Read and write: `is_allowed()`. **No delete.** A trigger blocks changing `verified_by` to anyone but the signed-in person, and writes a `question_versions` row on every edit of an active question |
| `attempts`, `attempt_items`, `seen`, `vault`, `study_segments`, `manual_entries`, `checklist`, `weekly_targets`, `rest_days`, `notes`, `written_attempts`, `push_subscriptions`, `profiles` | Read and write only when `user_id = auth.uid()` **and** `is_allowed()` |
| Submitted attempts and their items | A trigger blocks update and delete. They are immutable |
| Storage buckets | Private. Access by short-lived signed URLs. A person reads question images and only their **own** handwriting photos |

### 13.3 The submit function

`submit_attempt(p_attempt jsonb, p_items jsonb, p_seen jsonb, p_vault jsonb, p_expected jsonb) returns jsonb` runs as the signed-in person (not as a super user) in **one transaction**:

1. If an attempt with this id is already `submitted`, return `already_submitted` and write nothing.
2. For every `seen` and `vault` row in `p_expected`, check the stored `version` equals the version the client read. If any differ, raise `version_conflict` and write nothing.
3. Insert the attempt as `submitted`, then its items.
4. Upsert the `seen` and `vault` rows with `version + 1`.
5. Return `ok` with the new versions.

The pure TypeScript function `applyAttempt` computes the new `seen` and `vault` rows. The database does not repeat the ladder logic.

---

## 14. Offline, PWA and reminders

### 14.1 Local data

IndexedDB stores: `drafts` (the in-progress attempt), `outbox` (finished attempts and writes not yet sent), `cache_questions` (the questions of a started test, with both languages and images), `cache_meta` (versions). A test starts only after its questions are cached, so it can finish offline.

### 14.2 Promises for the first release

- A test or review in progress continues if the connection drops. Answers sync later.
- Starting a **new** test offline works only for questions already cached.
- Full offline use is **not** promised.
- Conflict rule: last write wins for drafts. Submitted attempts are immutable. Server wins on shared content.
- A sync indicator shows synced, pending or offline.
- **Updates:** when a new version is deployed, show "Update available, reload". Never reload during a test.

### 14.3 Install

- **Android:** web manifest (name, icons 192 and 512, maskable icon, `display: standalone`, theme colour, start URL), install prompt on Home only.
- **iPhone:** the app must be added to the Home Screen from Safari first. Show clear steps and a hint until installed. The iPhone may clear stored data of a web app that is not used for a while, so every finished test syncs **at once**, and a draft older than a few days gets a warning. VERIFY the minimum iOS version for web push and for stored data.

### 14.4 Reminders

- Each person turns reminders on **per device** and picks a time in IST. The device registers a push subscription.
- A scheduled job sends a neutral message (for example "3 reviews are due"), in the person's screen language, only if something is due or the goal is not yet met. No guilt wording, and never more than one a day.
- Where push is not supported or permission is denied, show an **in-app banner** on opening.
- VERIFY the free scheduler limits on Supabase, Vercel and GitHub, and pick the one that works.
- Test on both real phones: allow, deny, unsubscribe, app closed, phone restarted.

---

## 15. Backup, export and restore

The owner needs this to cost nothing.

1. **Weekly automatic backup.** A scheduled GitHub Actions job dumps the database (using a restricted read-only connection stored as a secret), copies the stored images, compresses and **encrypts** the files, and saves them in a private place both the friend and the owner can reach. Keep the last 8. VERIFY the free minutes and size limits for private repositories. If the backup grows too large, keep the database dump weekly and the images monthly.
2. **Keep-alive.** The same schedule makes a harmless database call so the free project is not paused for inactivity. VERIFY the current pause rule on Supabase's pricing and docs pages.
3. **Manual export.** A Settings button downloads the person's own data as one ZIP (JSON files and their handwriting photos), with a monthly reminder.
4. **Restore test, before the pilot.** Restore a backup into a fresh Supabase project and compare counts of questions, attempts and vault rows. Record the date and result. A backup that has never been restored does not count.
5. **Credentials.** The backup key and connection secrets live in a password manager both the owner and the friend can reach. Record who can recover each account.
6. **Failure alert.** If a weekly backup fails, the job opens an issue and emails both people.

---

## 16. Security and privacy

1. **Every table has RLS.** The automated tests include a third logged-in user who must read and write nothing anywhere, and a second user who must not see the first user's private rows.
2. **No sign-up path.** Disable sign-ups, and have no sign-up screen or endpoint.
3. **Two-step login** is required on the GitHub, Supabase and Vercel accounts (VERIFY each).
4. **Secrets** only in Vercel and GitHub settings. The Supabase service-role key is never in client code or in the repository. Rotate a key at once if it leaks.
5. **Question and summary text is rendered as text.** No raw HTML from the database is ever inserted into a page. Summaries are Markdown, sanitised.
6. **Storage is private** with signed URLs that expire quickly. Image uploads accept only image types and a set size.
7. **Security headers:** a strict content security policy, HTTPS only, no third-party trackers or analytics.
8. **Logs** never contain answers, notes, written responses or photos.
9. **Import** is size-limited and safe against path tricks and oversized files.
10. **Privacy note.** Show both users a plain statement: private between the two users inside the app, but the owner of the Supabase project can technically read the database. Record the sister's agreement.
11. **Copyright.** Private use by two people only. Use official papers first, record each source, and do not copy another site's questions.

---

## 17. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Devices | Current Android Chrome and current iPhone Safari (installed), plus a current computer browser. VERIFY the oldest iOS to support |
| Speed | First load on a mid-range phone under 3 seconds on a normal mobile connection. Moving between questions under 100 ms. Search under 1 second with 10,000 questions (VERIFY on the free plan) |
| Scale | Two users, up to 10,000 questions, 200,000 attempt items. Lists are paginated |
| Reliability | No lost answers. Submitted attempts are immutable. The submit function is exactly-once |
| Accessibility | Keyboard operable, visible focus, 4.5 to 1 contrast, text resizable to 200 percent, alt text on every picture, screen-reader labels on the palette and options |
| Typography | Tamil and English readable at 16 px or more, line height 1.6 or more |
| Cost | Free plans only. Log database reads and storage use during development, and fix any screen that reads more than it needs |
| Privacy | No third-party analytics or trackers |
| Maintainability | Strict TypeScript, linting, one formatter, CI that runs types, lint and tests on every change |

---

## 18. Testing

### 18.1 Unit tests for the rules (written first)

Every rule in sections 5, 6 and 8 has tests. At minimum:

| Area | Cases to cover |
| --- | --- |
| Scoring | All correct, all wrong, all blank, a mix, "not known" counted as blank, half-mark rounding, the "unverified" label |
| Test building | Full mock counts per unit, passages kept whole, a short pool refused with the missing count, no question twice, past paper order kept, level filtering for Group 4 and Group 2/2A |
| Kind validators | For `statements`, `assertion_reason`, `match`, `arrange` and `numeric`: a correct example passes, a wrong `correct_key` fails, two options matching the structure fails, no option matching fails, a negative stem flips polarity, a count option works |
| Parity | Different number of options, different block types or labels between Tamil and English fails |
| Ladder | Each row of the table in 8.6, an early correct that does not advance, a retained check, hard marks |
| Queue | The order in 8.6, the 30-item cap, the "why chosen" text |
| Accuracy | New against repeated, 9 and 10 questions, 29 and 30 questions, the band edges at 49, 50, 74 and 75 percent |
| Time | Idle cut at 120 seconds, hidden tab, a segment crossing midnight IST, a long segment cut, a 9-second segment dropped |
| Goal and streak | 59 and 60 minutes, 19 and 20 questions, either goal, a rest day used once and twice in a week, a late-synced attempt on an earlier day, the longest streak kept |
| Import | Bad ZIP, path tricks, wrong encoding, duplicate ids and content, a missing image, half an option set, a bad unit, a current-affairs flag in the wrong unit |
| Written practice | Re-attempt dates at 59, 60, 79 and 80 percent |

### 18.2 Database tests

- RLS: person A cannot read or write person B's private rows. A third user reads nothing. Anonymous access reads nothing.
- `submit_attempt`: calling it twice with the same id writes once. A stale version raises `version_conflict` and writes nothing. A failed step leaves nothing behind.
- Submitted attempts cannot be updated or deleted. Questions cannot be deleted.
- Migrations apply cleanly to an empty database and to a copy of production.

### 18.3 End-to-end tests (Playwright)

Login and wrong password. Import a ZIP with 20 questions of all kinds and see the error list. Verify a question with the tick. A full mock with a pause and a resume. Reload in the middle of a test. Go offline in the middle and finish later. A Mistake Vault review round. The checklist and weekly target. A Tamil search with a conjunct. A written practice attempt with a self-score. Export and restore into a fresh project.

### 18.4 Real-device tests (both phones, before the pilot)

Install, dark mode, rotate, kill the app mid-test, airplane mode, low battery mode, push allowed and denied, a long Tamil question at the 1.3 font scale, and both languages shown together.

### 18.5 Test data

The builder creates **fake** demo questions of every kind in both languages for development (Appendix A shows the shape). Real content enters only through verified imports.

---

## 19. Build phases

No dates. Start the next phase only when the exit gate is true. At every exit from P3 onward both users open the new screens on their phones and leave comments (11.6).

| Phase | Build | Exit gate |
| --- | --- | --- |
| **P0 Foundation** | Repository, TypeScript strict, lint, CI, Next.js shell, design tokens, fonts, English and Tamil string files, Supabase local, DECISIONS.md. Check every VERIFY item that affects the stack (free-plan limits, versions) | CI is green. DECISIONS.md lists versions, limits, account owners, the sister's privacy agreement, and the chosen scheduler |
| **P1 Domain rules** | All pure functions in sections 5, 6 and 8 with tests, including kind validators and parity | Domain tests pass with full coverage of the rules |
| **P2 Data and access** | Migrations, RLS, the two accounts, seed of exams and units, the submit function, the allow-list | The database tests in 18.2 pass in CI |
| **P3 Question library** | Editor for every kind, passages, images, ZIP import (JSONL and CSV), validation, verify queue with side-by-side PDF image, corrections, chapter seeding tool, current-affairs fields | Both users import a converted paper of 20 or more questions of mixed kinds and verify them one by one. Conversion error rate measured |
| **P4 Test engine** | Test builder (all kinds in 8.1), player with every kind drawn (11.4), local drafts, pause and resume, submit, result, answer review | Reload, offline and pause tests pass. All kinds render at 360 px in both languages |
| **P5 Vault and review** | `seen` and `vault` updates, ladder, due queue with reasons, hard marks, practice now | Ladder and queue tests pass against the real database |
| **P6 Study support** | Progress page, accuracy labels, checklist at chapter and unit level, weekly targets, unit summaries, notes, search, current-affairs views | Real content loaded: one past paper per exam, summaries for at least two units, chapters for the units in use |
| **P7 Habit and safety** | Time tracking, goals, streak, PWA install on both phones, push reminders with banner fallback, weekly backup, export, **restore test** | Restore test done. Both phones tested. Reminders tested |
| **P8 Written practice** | Prompts, writing screen, photo upload, model answers, rubrics, self-scoring, re-attempt rule, "Copy for Claude" | Both users complete one prompt of each kind |
| **Pilot** | Both people use it daily for **2 weeks**. Fix bugs only. No new features | Zero lost attempts, zero wrong scores, no data seen across accounts, the time report matches reality on one tracked day |

If the friend's capacity runs out, only **P8** may move after the pilot (9.6). Everything else is required before the pilot.

---

## 20. Working with Claude

### 20.1 Method

1. **One task per session.** Paste only the relevant sections plus sections 12, 13 and DECISIONS.md.
2. **Rules first.** Ask for the pure function and its tests before any screen.
3. **Tests with code.** No task is finished until its tests pass in CI.
4. **Read the diff, run the app, then commit.** Small commits with the task name.
5. **Ask Claude to list its assumptions** and every VERIFY item it relied on.
6. **Keep DECISIONS.md current**, so a new Claude session can resume from it. This matters because Claude Pro has usage limits.
7. **No new dependency** without a written reason.
8. **Claude never decides exam facts.** It reads official sources that the friend supplies.

### 20.2 Ready prompts

**Start of a phase:** "We are building phase P\<n> of the TNPSC Practice Platform. Here are sections \<list> of the specification and our DECISIONS.md. List the tasks in order, the tests to write first, and anything unclear. Do not write code yet."

**A rule module:** "Write the pure TypeScript function for section \<x>, with Vitest tests for every row of its table and the edge cases in 18.1. No database or UI imports."

**Converting a paper:** "Here is page \<n> of the official TNPSC paper \<exam, year, code> and its official answer key. Extract questions \<a> to \<b>. For each, choose the kind (6.1), build the blocks, four options, the structured answer, the unit and level, and set ai\_check against the key. Output one JSON object per line using the schema in Appendix A. Mark any row you could not read clearly as low confidence. Do not guess an answer that is not in the key."

**Drafting a summary:** "Here are pages \<n> to \<m> of the Samacheer textbook \<class, subject, edition>. Draft a short revision summary of the exam-relevant facts in my own words, in \<language>, with page references for each fact. Do not copy paragraphs."

**Checking a question:** "Here is a question and the official key. Say whether the key is consistent with the question, and whether the Tamil and English texts mean the same. Do not change the key."

---

## 21. Definition of done

1. Every phase exit gate in section 19 is true.
2. All tests in section 18 pass in CI, and the real-device tests are done.
3. A restore from backup into a fresh project is verified.
4. The two-week pilot is finished with the pilot gate true.
5. DECISIONS.md lists every deviation from this document and every VERIFY item with its source and date.
6. Each user has read the privacy note, and both have the owner-admin access described in section 4.

**Success checks after launch (honest, not a promise of results):** share of due reviews done within 2 days; accuracy on **unseen** questions of the same unit (the real proof of learning); mock score trend over 5 or more complete mocks; chapters studied per week against the person's own target; lost-data incidents (target zero).

---

## 22. Risks

| Risk | Why it matters | What to do |
| --- | --- | --- |
| First release is large | No A and B split | Small phases, exit gates, cut a feature before cutting a test |
| Friend's capacity unknown | Hours per week not stated | Agree a realistic pace in week one and record it |
| Claude Pro usage limits | A big build uses many sessions | Small tasks, current DECISIONS.md, tests that document the intent |
| Wrong key or wrong text | One wrong key spoils trust | Human check against the official source, structural key check, correction process |
| Conversion errors in Tamil | Old fonts and scans | Read page images, measure the error rate, stop above 2 in 100 |
| Verification backlog | Thousands of questions | Newest papers first, use the app while the bank grows |
| Bilingual mismatch | Tamil and English texts differ | Parity check and human check of both |
| Memorising answers | Repeat accuracy looks like learning | Show new accuracy separately, mix unseen questions |
| Account loss | One person owns everything | Owner is admin everywhere, shared password manager, recovery recorded |
| Free-plan limits | Pausing, storage, scheduled jobs | Check in P0, keep images small, keep-alive job |
| iPhone limits | Web apps are restricted on iOS | Install steps, immediate sync, banner fallback |
| Reminders unreliable | Push varies by platform | In-app banner always works |
| Copyright | Past papers, textbooks and images | Private use for two people, official sources first, record sources |
| No exam date | Drift | Weekly targets, checklist progress, due reviews |
| Redesign cost | No mockup step | Build Home and the player first, review at every exit |
| Summaries wrong | AI drafts | Page references required, human check |

---

## 23. Items to VERIFY before relying on them

1. Group 4 and Group 2/2A exam numbers (questions, minutes, marks, negative marking, qualifying marks, the Tamil part's pass rule) and whether papers print "(E) Answer not known", from the latest official notification. Record title, date and link.
2. Newer syllabus versions than 12.12.2024, and that current affairs sits in units I, II, IV and V.
3. Whether official General Studies papers print each question in both Tamil and English, on one real paper per exam.
4. Which classes and textbook editions to use for chapters, and where the official textbook PDFs are published.
5. The current Tamil Eligibility Test scheme before seeding written prompts.
6. Supabase free plan: the inactivity pause rule, storage size, bandwidth, backups, and whether sign-ups can be disabled.
7. Vercel free plan terms for a private personal project.
8. GitHub Actions free minutes for private repositories, and the scheduler to use for reminders.
9. Minimum iOS version for web push and Home Screen web apps, and whether the iPhone clears stored data.
10. Two-step login on the GitHub, Supabase and Vercel accounts.
11. Availability of official answer keys for each paper.
12. Library versions (Next.js, the PWA library, Zod, Playwright) and that they work together.
13. The friend's weekly hours and the Claude Pro limits.
14. The Terms of any practice site before using anything from it. By default use nothing.

---

## 24. Out of scope

A third user or public sign-up. Payments. AI marking inside the app, and any AI service call from the app. Native apps. Leaderboards and social features. A "most asked" filter. Video lessons. Live classes. Group 1 Prelims and Group 2A Mains practice (only the setup differs, so they can be added later). Automatic handwriting reading. Encrypting each person's data against the project owner. Full offline use.

---

## Appendix A. Import file shape (JSON Lines)

One JSON object per line in the real file. They are shown spread out here for reading. `option_meta` carries the language-independent option fields. All examples are demo content for tests.

**A.1 Direct, bilingual**

```json
{"id":"demo-dir-001","kind":"direct","unit_id":"gs-science","level":"SSLC",
 "correct":"B","is_negative":false,"status":"draft",
 "source":{"type":"other","note":"demo"},
 "ai_check":"agree","ai_note":"",
 "texts":{
  "en":{"blocks":[{"type":"text","text":"Which gas do plants take in for photosynthesis?"}],
        "options":[{"key":"A","text":"Oxygen"},{"key":"B","text":"Carbon dioxide"},
                   {"key":"C","text":"Nitrogen"},{"key":"D","text":"Hydrogen"}],
        "explanation":"Plants take in carbon dioxide."},
  "ta":{"blocks":[{"type":"text","text":"ஒளிச்சேர்க்கையின்போது தாவரங்கள் எடுத்துக்கொள்ளும் வாயு எது?"}],
        "options":[{"key":"A","text":"ஆக்சிஜன்"},{"key":"B","text":"கார்பன் டை ஆக்சைடு"},
                   {"key":"C","text":"நைட்ரஜன்"},{"key":"D","text":"ஹைட்ரஜன்"}],
        "explanation":"தாவரங்கள் கார்பன் டை ஆக்சைடை எடுக்கின்றன."}}}
```

**A.2 Statements** (the check: statements I and III are true, so the option selecting I and III must be the key)

```json
{"id":"demo-stm-001","kind":"statements","unit_id":"gs-science","level":"SSLC",
 "correct":"B","is_negative":false,
 "structure":{"truth":{"I":true,"II":false,"III":true}},
 "option_meta":{"A":{"selects":["I"]},"B":{"selects":["I","III"]},
                "C":{"selects":["II","III"]},"D":{"selects":["I","II","III"]}},
 "texts":{"en":{"blocks":[
   {"type":"text","text":"Consider the following statements. Which are correct?"},
   {"type":"statement","label":"I","text":"Water boils at 100 degrees Celsius at sea level."},
   {"type":"statement","label":"II","text":"The Sun rises in the west."},
   {"type":"statement","label":"III","text":"A triangle has three sides."}],
  "options":[{"key":"A","text":"I only"},{"key":"B","text":"I and III only"},
             {"key":"C","text":"II and III only"},{"key":"D","text":"I, II and III"}],
  "explanation":"I and III are true."}}}
```

**A.3 Assertion and reason** (both true and the reason explains the assertion, so the option whose semantic is `both_true_explains` must be the key)

```json
{"id":"demo-ar-001","kind":"assertion_reason","unit_id":"gs-science","level":"SSLC",
 "correct":"A",
 "structure":{"a_true":true,"r_true":true,"r_explains_a":true},
 "option_meta":{"A":{"semantic":"both_true_explains"},
                "B":{"semantic":"both_true_not_explains"},
                "C":{"semantic":"a_true_r_false"},"D":{"semantic":"a_false_r_true"}},
 "texts":{"en":{"blocks":[
   {"type":"assertion","text":"Water boils at 100 degrees Celsius at sea level."},
   {"type":"reason","text":"The boiling point depends on the surrounding pressure."}],
  "options":[{"key":"A","text":"Both are true and the reason explains the assertion"},
             {"key":"B","text":"Both are true but the reason does not explain the assertion"},
             {"key":"C","text":"The assertion is true but the reason is false"},
             {"key":"D","text":"The assertion is false but the reason is true"}],
  "explanation":""}}}
```

**A.4 Match the following** (mapping A to 1, B to 2, C to 3, D to 4)

```json
{"id":"demo-mat-001","kind":"match","unit_id":"apt-aptitude","level":"SSLC",
 "correct":"A",
 "structure":{"pairs":{"A":"1","B":"2","C":"3","D":"4"}},
 "option_meta":{
  "A":{"mapping":{"A":"1","B":"2","C":"3","D":"4"}},
  "B":{"mapping":{"A":"2","B":"1","C":"3","D":"4"}},
  "C":{"mapping":{"A":"1","B":"2","C":"4","D":"3"}},
  "D":{"mapping":{"A":"4","B":"3","C":"2","D":"1"}}},
 "texts":{"en":{"blocks":[
   {"type":"text","text":"Match List I with List II."},
   {"type":"list","name":"List I","items":[{"label":"A","text":"2 + 3"},{"label":"B","text":"4 × 2"},
                                            {"label":"C","text":"9 − 3"},{"label":"D","text":"10 ÷ 5"}]},
   {"type":"list","name":"List II","items":[{"label":"1","text":"5"},{"label":"2","text":"8"},
                                             {"label":"3","text":"6"},{"label":"4","text":"2"}]}],
  "options":[{"key":"A","text":"A-1, B-2, C-3, D-4"},{"key":"B","text":"A-2, B-1, C-3, D-4"},
             {"key":"C","text":"A-1, B-2, C-4, D-3"},{"key":"D","text":"A-4, B-3, C-2, D-1"}],
  "explanation":"5, 8, 6 and 2."}}}
```

**A.5 Arrange in order**

```json
{"id":"demo-arr-001","kind":"arrange","unit_id":"gs-science","level":"SSLC",
 "correct":"A","structure":{"order":["I","II","III","IV"]},
 "option_meta":{"A":{"sequence":["I","II","III","IV"]},"B":{"sequence":["II","I","III","IV"]},
                "C":{"sequence":["I","III","II","IV"]},"D":{"sequence":["IV","III","II","I"]}},
 "texts":{"en":{"blocks":[
   {"type":"text","text":"Arrange the stages of a plant's life in order."},
   {"type":"list","name":"Stages","items":[{"label":"I","text":"Seed"},{"label":"II","text":"Seedling"},
                                             {"label":"III","text":"Young plant"},{"label":"IV","text":"Flowering plant"}]}],
  "options":[{"key":"A","text":"I, II, III, IV"},{"key":"B","text":"II, I, III, IV"},
             {"key":"C","text":"I, III, II, IV"},{"key":"D","text":"IV, III, II, I"}],
  "explanation":""}}}
```

Images are named in a block (`{"type":"image","file":"images/dice-12.png","alt":"..."}`) or in an option (`"image":"images/opt-a.png","alt":"..."`), and the files sit in the ZIP. Passages are separate lines with `"record":"passage"`, an id and texts per language, and questions refer to them with `"passage_id"`.

## Appendix B. Glossary

| Word | Meaning |
| --- | --- |
| Kind | The shape of a question (direct, statements, assertion and reason, match, arrange, numeric, visual, quote) |
| Block | A piece of a question's stem: text, statement, list, table, quote, image |
| Structured answer | The machine-readable answer that lets the importer check the key |
| Draft, active, archived | The lifecycle of questions, summaries and prompts |
| Verified | A person checked the item against the official source |
| Vault | The Mistake Vault: questions to bring back on a schedule |
| Stage | A step on the review ladder (0 to 4) |
| New and repeated accuracy | Accuracy on the first time a question is seen, against later times |
| Comparable | A full mock or past paper that was complete and never paused |
| IST | Indian Standard Time, the only clock used for days and weeks |
| RLS | Row Level Security: the database rule that keeps one person's rows from the other |
| PWA | An installable web app |
| VERIFY | A fact to confirm from an official source before relying on it |
