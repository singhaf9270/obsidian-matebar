# Matebar

**هر هدف، یک مسیر؛ هر گام، یک پیشرفت.**

Matebar is a flexible progress tracker for Obsidian. Track projects, tasks, reading goals, learning plans, and personal activities with an inline progress widget, automatic date tracking, and a reusable checklist generator.

## Features

- Add a progress widget only where you need it.
- Calculate progress from the tasks in the current note.
- Automatically record the start date when the first task is completed.
- Automatically record the completion date when all tasks are complete.
- Clear the completion date when a completed activity becomes active again.
- Optionally save the calculated percentage to Frontmatter.
- Choose Jalali or Gregorian dates and a date display format.
- Customize the Frontmatter property names.
- Choose whether nested tasks are included in progress.
- Generate a checklist from a title, total amount, and step interval.
- Persian interface and responsive styling.

## Quick start

1. Install and enable Matebar.
2. Add tasks to a note using standard Markdown task syntax.
3. Insert this code block where you want the progress widget to appear:

   ~~~matebar
   ~~~

4. Switch to Reading view to see the widget.

The widget reads tasks from the note containing the code block. It does not add a sidebar panel or automatically appear in every note.

## Commands

Open the Command Palette and search for:

- درج ویجت پیشرفت — inserts a Matebar code block at the cursor.
- ساخت چک‌لیست مرحله‌ای — creates a checklist by asking for an activity title, total amount, and step interval. It works for page counts, chapters, milestones, or any other numeric goal.

## Automatic tracking

By default, Matebar uses these Frontmatter properties:

| Property | Purpose |
| --- | --- |
| شروع | Date the first task is completed |
| پایان | Date all tasks are completed |
| پیشرفت | Calculated percentage |

You can rename these properties or disable percentage storage in Settings → Matebar.

If all tasks are unchecked, the start and completion dates are cleared. If a task is added after completion, the completion date is removed until all tasks are complete again.

## Date settings

Choose Jalali or Gregorian calendar and one of these formats:

- Numeric: 1405/08/13
- Month name: 13 آبان 1405 (Jalali) or 13 November 2026 (Gregorian)
- ISO: 1405-08-13

Jalali formatting uses the calendar support built into the JavaScript internationalization API; no additional calendar plugin is required.

## Requirements

- Obsidian 1.5.0 or newer
- No Dataview or Templater dependency

## Installation

### Community plugins

Once approved and listed in the Obsidian community plugin directory, search for Matebar in Settings → Community plugins.

### Manual installation

1. Download main.js, manifest.json, and styles.css from the latest GitHub release.
2. Create .obsidian/plugins/matebar/ in your vault.
3. Place the three files in that folder.
4. Reload Obsidian and enable Matebar.

## Development

The plugin is written in JavaScript and uses the Obsidian plugin API. No build step is required for the current release.

## License

MIT
