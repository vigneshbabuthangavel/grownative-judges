# GrowNative — Stub Packs + Schemas Bundle

This bundle contains **reference JSON schemas** and **example stub packs** used to demonstrate
GrowNative's "orchestrator" design: **plan → generate → review → repair → package**.

## Folder layout

- `schemas/` — JSON Schemas for StoryPacks, Guardrails, QA rubrics, and Input support.
- `stubs/story/` — Example StoryPack JSON (native-language text + separate transliteration field).
- `stubs/guardrails/` — Global and language-specific guardrails.
- `stubs/qa/` — QA rubrics/checks for kids ethics, topic fit, native-likeness, and not-translation.
- `stubs/rubrics/` — Writing challenge scoring rubric.
- `stubs/input/` — Native typing support configuration.

## How to use in your repo

Copy the entire folder into your project, e.g.:

`/src/lib/stubs/` or `/assets/stubs/`

Then load the JSON in a "Story QA" dev panel or use it to drive Gemini prompts and validators.

## Notes

- Transliteration is **optional** and should be stored **separately** from `text.native` fields.
- The QA rubric objects are designed to be explainable to judges (pass/warn/fail + reasons).
- The "Native-likeness" checks are heuristic and should be described as *quality checks*, not mind-reading.
