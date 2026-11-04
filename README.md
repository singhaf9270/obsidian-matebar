# Puyan

**هر هدف، یک مسیر؛ هر گام، یک پیشرفت.**

Puyan is a bilingual progress-tracking plugin for Obsidian. It turns Markdown task lists into a visual progress widget, records the start and completion dates, calculates elapsed duration, and lets you generate reusable checklists. You can track tasks in the current note or display their progress from another note.

## Features

### Progress tracking
- Displays completed tasks, total tasks, and completion percentage in a visual widget.
- Tracks tasks in the note containing the widget, or in a separately selected target note.
- Automatically records the start date when the first task is checked.
- Automatically records the completion date when all tracked tasks are checked.
- If a task is added after completion, the completion date is cleared until the list is complete again.
- If all tracked tasks are unchecked, the start date and completion date are cleared.
- Calculates and stores the elapsed duration in days.
- Optionally saves the calculated progress percentage to Frontmatter.

### Dates and Frontmatter
- Supports Jalali (Persian) and Gregorian calendars.
- Offers configurable date formats.
- Can reformat existing tracked dates when the calendar or date format setting is changed.
- Lets you customize the Frontmatter property names for start date, completion date, duration, and progress.
- Accepts Persian, Arabic-Indic, and Latin digits as input.
- Lets you choose whether generated/displayed numbers use Persian or Latin digits.

### Checklist generator
- Creates numbered checklists using a total and an interval. For example, a total of 30 and interval of 10 creates 10, 20, and 30.
- Creates fixed lists from items entered in settings, such as weekdays.
- Allows the activity title to be left empty.
- Lets you customize the generated line template with placeholders.

### Language, layout, and appearance
- Persian and English interface.
- Settings and modal layouts adapt to RTL or LTR according to the selected language.
- Responsive progress widget for desktop and mobile screens.
- Configurable display options for the widget.

## Quick start

1. Add Markdown tasks to a note.
2. Insert the following code block where you want the progress widget to appear:

~~~puyan
~~~

By default, the widget tracks tasks in the same note that contains the code block.

### Track tasks from another note

You can place the widget in one note and track tasks in a different note by adding a `note:` line inside the code block.

Using a vault-relative path:

~~~puyan
note: Projects/Book.md
~~~

Or using a wikilink:

~~~puyan
note: [[Book]]
~~~

The widget appears in the current note, while task tracking and Frontmatter updates apply to the target note.

## Checklist generator

Open the Command Palette and run **Create step checklist**.

Choose the checklist type in **Settings → Puyan**.

### Numbered steps

Enter a total and an interval. For example:

- Total: `30`
- Interval: `10`

The generated numbers are 10, 20, and 30.

You can customize the line template with these placeholders:

| Placeholder | Description |
| --- | --- |
| `{n}` | Current number |
| `{total}` | Total amount |
| `{title}` | Activity title |

Examples:

- `- [ ] {n}` creates checkboxes containing only the numbers.
- `{n}` creates plain numbered lines.
- `- [ ] {title} — {n} از {total}` includes the title, current number, and total.

The activity title is optional. If it is left empty, the generator does not require a title.

### Fixed list

Select the fixed-list type and enter one item per line in settings. For example:

~~~text
شنبه
یکشنبه
دوشنبه
سه‌شنبه
چهارشنبه
پنجشنبه
جمعه
~~~

The generator creates one checklist item for each line.

Both Persian and Latin digits are accepted. Generated numbers follow the digit-display setting.

## Frontmatter properties

Puyan uses these property names by default:

| Property | Description |
| --- | --- |
| `شروع` | Date the first task is checked |
| `پایان` | Date all tracked tasks are completed |
| `مدت انجام` | Elapsed duration in days |
| `پیشرفت` | Completion percentage, when saving progress is enabled |

You can change the property names in **Settings → Puyan**. The widget updates the configured properties in the note whose tasks are being tracked.

## Settings

The settings let you configure:

- Interface language (Persian or English).
- Calendar (Jalali or Gregorian) and date format.
- Output digit style (Persian or Latin).
- Frontmatter property names.
- Whether progress percentage is saved.
- Which progress details are shown in the widget.
- Checklist generator type, fixed-list items, and numbered-line template.

## Installation

Download `main.js`, `manifest.json`, and `styles.css` from the GitHub release and place them in:

`.obsidian/plugins/puyan/`

Then enable **Puyan** from Obsidian's Community Plugins settings.

## Requirements

- Obsidian 1.5.0 or newer.
- No Dataview or Templater dependency.
- Works on desktop and mobile.

## License

MIT
