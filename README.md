# Puyan

**هر هدف، یک مسیر؛ هر گام، یک پیشرفت.**

Puyan is a bilingual (Persian/English) progress tracker for Obsidian. It tracks tasks in the current note, records start and completion dates, calculates the elapsed duration, and displays a polished progress widget.

## Features

- Persian and English interface; switch languages in Settings → Puyan.
- Accepts both Persian and Latin digits in numeric input and task-related values.
- Choose whether displayed numbers use Persian or Latin digits.
- Choose Jalali or Gregorian calendar and numeric, month-name, or ISO date format.
- Automatically record the start date when the first task is completed.
- Automatically record the completion date and duration when all tasks are complete.
- Reformat existing start and completion dates in Markdown notes when the calendar or date format changes.
- Customize Frontmatter property names for start date, completion date, duration, and progress.
- Optionally save progress percentage and count nested tasks.
- Control which progress details appear in the widget.
- Generate a reusable numeric step checklist.
- Responsive widget styling for desktop and mobile.

## Quick start

1. Install and enable Puyan.
2. Add Markdown tasks to a note.
3. Insert this code block where the widget should appear:

   ~~~puyan
   ~~~

4. Switch to Reading view to see the widget.

The widget reads tasks from the note containing the code block.

## Commands

- Insert progress widget
- Create step checklist

## Frontmatter properties

Default properties:

| Property | Purpose |
| --- | --- |
| `شروع` | Date the first task is completed |
| `پایان` | Date all tasks are completed |
| `مدت انجام` | Elapsed duration in days after completion |
| `پیشرفت` | Calculated percentage |

All property names can be customized in Settings → Puyan. Duration is stored as a numeric day count so it remains easy to query.

## Dates and digits

- Both Persian digits (۲۵) and Latin digits (25) are accepted.
- The displayed digit style can be set independently.
- When the calendar or date format changes, Puyan attempts to convert existing start and completion dates in note Frontmatter. Dates it cannot recognize are left unchanged.
- Date formats: numeric, month name, and ISO.

## Requirements

- Obsidian 1.5.0 or newer
- No Dataview or Templater dependency

## Manual installation

Download `main.js`, `manifest.json`, and `styles.css` from the latest release and place them in `.obsidian/plugins/puyan/`.

## License

MIT
