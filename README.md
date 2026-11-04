# Puyan

**هر هدف، یک مسیر؛ هر گام، یک پیشرفت.**

Puyan is a bilingual (Persian/English) progress tracker for Obsidian. It tracks tasks in the current note or a different target note, records dates and duration, and provides configurable checklist generation.

## Features

- Persian and English interface with matching RTL/LTR settings and modal layouts.
- Accepts both Persian and Latin digits.
- Jalali/Gregorian calendars and configurable date formats.
- Start date, completion date, duration, and progress Frontmatter fields.
- Existing dates can be reformatted when calendar or date format changes.
- Place a progress widget in one note and track tasks from another note.
- Configure checklist generation as numbered steps or a fixed list.
- Customize the generated line template with `{n}`, `{total}`, and `{title}` placeholders.
- Leave the activity title empty; it is optional.
- Responsive progress widget styling.

## Quick start

Add Markdown tasks to a note, then insert this block where the progress widget should appear:

~~~puyan
~~~

By default, the widget reads tasks from the note containing the block.

### Show progress from another note

Add a `note:` option inside the code block. The value can be a vault-relative path or a wikilink:

~~~puyan
note: Projects/Book.md
~~~

or:

~~~puyan
note: [[Book]]
~~~

The widget is displayed in the current note but reads tasks and updates tracking properties in the target note.

## Checklist generator

Open the Command Palette and run **Create step checklist**.

Choose the default checklist type in Settings → Puyan:

- **Numbered steps:** enter a total and interval. For example, total 30 and interval 10 produces 10, 20, 30.
- **Fixed list:** configure one item per line in settings. For example, weekdays can be entered as شنبه, یکشنبه, دوشنبه, and so on.

The activity title is optional. If provided, it is inserted as a heading. For numbered steps, customize the line template. Available placeholders:

| Placeholder | Meaning |
| --- | --- |
| `{n}` | Current step number |
| `{total}` | Total amount |
| `{title}` | Activity title |

Examples:
- `- [ ] {n}` creates checkboxes with only numbers.
- `{n}` creates plain numbered lines.
- `- [ ] {title} — {n} از {total}` includes the title and total.

Both Persian and Latin digits are accepted; generated numbers follow the selected display digit setting.

## Frontmatter properties

Default properties:

| Property | Purpose |
| --- | --- |
| `شروع` | Date the first task is completed |
| `پایان` | Date all tasks are completed |
| `مدت انجام` | Elapsed duration in days |
| `پیشرفت` | Calculated percentage |

All property names can be customized in Settings → Puyan.

## Installation

Download `main.js`, `manifest.json`, and `styles.css` from the latest GitHub release and place them in `.obsidian/plugins/puyan/`.

## Requirements

- Obsidian 1.5.0 or newer
- No Dataview or Templater dependency

## License

MIT
