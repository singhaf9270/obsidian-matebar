const { Plugin, PluginSettingTab, Setting, Modal, Notice, MarkdownRenderChild } = require("obsidian");

const DEFAULT_SETTINGS = {
  language: "fa",
  startField: "شروع",
  endField: "پایان",
  durationField: "مدت انجام",
  progressField: "پیشرفت",
  calendar: "jalali",
  dateFormat: "numeric",
  outputDigits: "fa",
  saveProgress: true,
  countSubtasks: true,
  showCounter: true,
  showStartDate: true,
  showEndDate: true,
  showDuration: true
};

const TEXT = {
  fa: {
    settings: "تنظیمات پویان", language: "زبان رابط کاربری", fa: "فارسی", en: "English",
    startField: "فیلد تاریخ شروع", endField: "فیلد تاریخ پایان", durationField: "فیلد مدت انجام",
    progressField: "فیلد درصد پیشرفت", calendar: "تقویم", jalali: "شمسی", gregorian: "میلادی",
    dateFormat: "قالب تاریخ", numeric: "عددی", long: "نام ماه", iso: "ISO",
    outputDigits: "اعداد نمایشی", persianDigits: "فارسی (۱۲۳)", latinDigits: "انگلیسی (123)",
    saveProgress: "ذخیره درصد پیشرفت در Frontmatter", countSubtasks: "شمارش زیرتسک‌ها",
    showCounter: "نمایش شمارنده تسک‌ها", showStartDate: "نمایش تاریخ شروع", showEndDate: "نمایش تاریخ پایان",
    showDuration: "نمایش مدت انجام", commandInsert: "درج ویجت پیشرفت", commandChecklist: "ساخت چک‌لیست مرحله‌ای",
    modalTitle: "ساخت چک‌لیست مرحله‌ای", activity: "عنوان فعالیت", total: "مقدار کل",
    totalDesc: "تعداد صفحات، فصل‌ها یا مراحل", interval: "فاصله مراحل", create: "ساخت چک‌لیست",
    invalid: "اطلاعات واردشده معتبر نیست.", noTasks: "هیچ تسکی برای نمایش پیشرفت وجود ندارد",
    complete: "کامل شد!", near: "نزدیک به اتمام", halfway: "نیمه‌راه", doing: "در حال انجام", start: "شروع",
    tasks: "تسک", completedTasks: "تسک انجام‌شده", remaining: "باقی‌مانده",
    completedOn: "تکمیل شده در:", duration: "مدت انجام:", days: "روز", lessThanDay: "کمتر از یک روز",
    startedOn: "شروع:", migrationDone: "تاریخ‌های یادداشت‌ها به قالب جدید تبدیل شد.",
    migrationPartial: "تبدیل تاریخ‌ها انجام شد؛ بعضی تاریخ‌های ناشناخته بدون تغییر ماندند.",
    migrationNone: "تنظیمات تاریخ تغییر کرد؛ تاریخ قابل تبدیل دیگری پیدا نشد."
  },
  en: {
    settings: "Puyan settings", language: "Interface language", fa: "فارسی", en: "English",
    startField: "Start date property", endField: "Completion date property", durationField: "Duration property",
    progressField: "Progress property", calendar: "Calendar", jalali: "Jalali", gregorian: "Gregorian",
    dateFormat: "Date format", numeric: "Numeric", long: "Month name", iso: "ISO",
    outputDigits: "Displayed digits", persianDigits: "Persian (۱۲۳)", latinDigits: "Latin (123)",
    saveProgress: "Save progress percentage to Frontmatter", countSubtasks: "Count nested tasks",
    showCounter: "Show task counter", showStartDate: "Show start date", showEndDate: "Show completion date",
    showDuration: "Show duration", commandInsert: "Insert progress widget", commandChecklist: "Create step checklist",
    modalTitle: "Create step checklist", activity: "Activity title", total: "Total amount",
    totalDesc: "Number of pages, chapters, or steps", interval: "Step interval", create: "Create checklist",
    invalid: "Please enter valid values.", noTasks: "No tasks found to calculate progress",
    complete: "Completed!", near: "Almost there", halfway: "Halfway", doing: "In progress", start: "Getting started",
    tasks: "tasks", completedTasks: "tasks completed", remaining: "remaining",
    completedOn: "Completed on:", duration: "Duration:", days: "days", lessThanDay: "Less than a day",
    startedOn: "Started:", migrationDone: "Dates in your notes were converted to the new format.",
    migrationPartial: "Date conversion finished; some unrecognized dates were left unchanged.",
    migrationNone: "Date settings changed; no convertible dates were found."
  }
};

function normalizeDigits(value) {
  return String(value)
    .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
}
function displayDigits(value, mode) {
  const s = String(value);
  return mode === "fa" ? s.replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]) : s;
}
function jalaliParts(date) {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", { year: "numeric", month: "numeric", day: "numeric" }).formatToParts(date);
  const get = type => Number(parts.find(p => p.type === type)?.value || 0);
  return { year: get("year"), month: get("month"), day: get("day") };
}
function jalaliToGregorian(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const start = new Date(Date.UTC(year + 621, 2, 19));
  let newYear = null;
  for (let i = 0; i < 5; i++) {
    const candidate = new Date(start.getTime() + i * 86400000);
    const p = jalaliParts(candidate);
    if (p.year === year && p.month === 1 && p.day === 1) { newYear = candidate; break; }
  }
  if (!newYear) return null;
  const offset = (month <= 6 ? (month - 1) * 31 : 186 + (month - 7) * 30) + day - 1;
  const result = new Date(newYear.getTime() + offset * 86400000);
  const check = jalaliParts(result);
  return check.year === year && check.month === month && check.day === day ? result : null;
}
const PERSIAN_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const ENGLISH_MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
function parseDateValue(value, calendar) {
  if (value === null || value === undefined || value === "") return null;
  const s = normalizeDigits(String(value)).trim();
  let m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (m) {
    const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    return calendar === "jalali" ? jalaliToGregorian(y, mo, d) : validGregorian(y, mo, d);
  }
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]), y = Number(m[3]);
    if (calendar === "jalali") return jalaliToGregorian(y, b, a);
    return validGregorian(y, b, a);
  }
  m = s.match(/^(\d{1,2})\s+(.+?)\s+(\d{4})$/i);
  if (m) {
    const d = Number(m[1]), monthText = m[2].trim().toLowerCase(), y = Number(m[3]);
    const pm = PERSIAN_MONTHS.findIndex(x => x === monthText);
    if (calendar === "jalali" && pm >= 0) return jalaliToGregorian(y, pm + 1, d);
    const em = ENGLISH_MONTHS.findIndex(x => x.startsWith(monthText));
    if (calendar === "gregorian" && em >= 0) return validGregorian(y, em + 1, d);
  }
  const parsed = Date.parse(s);
  if (calendar === "gregorian" && Number.isFinite(parsed)) {
    const date = new Date(parsed);
    return validGregorian(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }
  return null;
}
function validGregorian(y, m, d) {
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}
function formatDate(date, settings) {
  if (!date) return "";
  if (settings.calendar === "jalali") {
    const p = jalaliParts(date);
    if (settings.dateFormat === "iso") return displayDigits(p.year + "-" + String(p.month).padStart(2, "0") + "-" + String(p.day).padStart(2, "0"), settings.outputDigits);
    if (settings.dateFormat === "long") return displayDigits(p.day + " " + PERSIAN_MONTHS[p.month - 1] + " " + p.year, settings.outputDigits);
    return displayDigits(p.year + "/" + String(p.month).padStart(2, "0") + "/" + String(p.day).padStart(2, "0"), settings.outputDigits);
  }
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  if (settings.dateFormat === "iso") return displayDigits(y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0"), settings.outputDigits);
  if (settings.dateFormat === "long") return displayDigits(new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date), settings.outputDigits);
  return displayDigits(y + "/" + String(m).padStart(2, "0") + "/" + String(d).padStart(2, "0"), settings.outputDigits);
}
function readTasks(content, countSubtasks) {
  const tasks = [];
  let parentIndent = null;
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+.+$/);
    if (!m) continue;
    const indent = m[1].replace(/\t/g, "    ").length;
    if (!countSubtasks && parentIndent !== null && indent > parentIndent) continue;
    if (!countSubtasks) parentIndent = indent;
    tasks.push(m[2].toLowerCase() === "x");
  }
  return tasks;
}

class ChecklistModal extends Modal {
  constructor(app, submit, language) { super(app); this.submit = submit; this.t = TEXT[language]; }
  onOpen() {
    const el = this.contentEl, t = this.t;
    el.addClass("puyan-modal");
    el.createEl("h2", { text: t.modalTitle });
    let title = "", total = "100", step = "10";
    new Setting(el).setName(t.activity).addText(input => input.setPlaceholder(t.activity).onChange(v => title = v));
    new Setting(el).setName(t.total).setDesc(t.totalDesc).addText(input => input.setValue(total).onChange(v => total = v));
    new Setting(el).setName(t.interval).addText(input => input.setValue(step).onChange(v => step = v));
    new Setting(el).addButton(button => button.setButtonText(t.create).setCta().onClick(() => {
      const n = Number(normalizeDigits(total)), interval = Number(normalizeDigits(step));
      if (!title.trim() || !Number.isInteger(n) || !Number.isInteger(interval) || n < 1 || interval < 1) {
        new Notice(t.invalid); return;
      }
      this.submit(title.trim(), n, interval); this.close();
    }));
  }
  onClose() { this.contentEl.empty(); }
}

class PuyanSettings extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const el = this.containerEl, p = this.plugin, s = p.settings, t = TEXT[s.language];
    el.empty();
    el.createEl("h2", { text: t.settings });
    new Setting(el).setName(t.language).addDropdown(d => d.addOption("fa", t.fa).addOption("en", t.en).setValue(s.language).onChange(async v => { s.language = v; await p.saveSettings(); this.display(); }));
    el.createEl("h3", { text: s.language === "fa" ? "فیلدهای یادداشت (Frontmatter)" : "Frontmatter properties" });
    p.textSetting(el, t.startField, "startField", DEFAULT_SETTINGS.startField);
    p.textSetting(el, t.endField, "endField", DEFAULT_SETTINGS.endField);
    p.textSetting(el, t.durationField, "durationField", DEFAULT_SETTINGS.durationField);
    p.textSetting(el, t.progressField, "progressField", DEFAULT_SETTINGS.progressField);
    el.createEl("h3", { text: s.language === "fa" ? "تاریخ و نمایش" : "Dates and display" });
    new Setting(el).setName(t.calendar).addDropdown(d => d.addOption("jalali", t.jalali).addOption("gregorian", t.gregorian).setValue(s.calendar).onChange(v => p.changeDateSettings("calendar", v)));
    new Setting(el).setName(t.dateFormat).addDropdown(d => d.addOption("numeric", t.numeric).addOption("long", t.long).addOption("iso", t.iso).setValue(s.dateFormat).onChange(v => p.changeDateSettings("dateFormat", v)));
    new Setting(el).setName(t.outputDigits).addDropdown(d => d.addOption("fa", t.persianDigits).addOption("en", t.latinDigits).setValue(s.outputDigits).onChange(async v => { s.outputDigits = v; await p.saveSettings(); p.refreshAll(); }));
    el.createEl("h3", { text: s.language === "fa" ? "نمایش ویجت" : "Widget display" });
    p.toggleSetting(el, t.saveProgress, "saveProgress");
    p.toggleSetting(el, t.countSubtasks, "countSubtasks");
    p.toggleSetting(el, t.showCounter, "showCounter");
    p.toggleSetting(el, t.showStartDate, "showStartDate");
    p.toggleSetting(el, t.showEndDate, "showEndDate");
    p.toggleSetting(el, t.showDuration, "showDuration");
  }
}

module.exports = class PuyanPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.views = new Map();
    this.updating = new Set();
    this.registerMarkdownCodeBlockProcessor("puyan", async (source, el, ctx) => {
      const path = ctx.sourcePath, view = { el, path, refresh: null };
      view.refresh = () => this.renderWidget(view);
      if (!this.views.has(path)) this.views.set(path, new Set());
      this.views.get(path).add(view);
      const child = new MarkdownRenderChild(el);
      child.onunload = () => {
        const set = this.views.get(path);
        if (set) { set.delete(view); if (!set.size) this.views.delete(path); }
      };
      ctx.addChild(child);
      await this.renderWidget(view);
    });
    this.registerEvent(this.app.vault.on("modify", file => {
      if (!file || this.updating.has(file.path)) return;
      const set = this.views.get(file.path);
      if (set) for (const view of set) view.refresh();
    }));
    const t = TEXT[this.settings.language];
    this.addCommand({ id: "insert-progress-widget", name: t.commandInsert, editorCallback: editor => {
      const fence = String.fromCharCode(96).repeat(3);
      editor.replaceRange(fence + "puyan\n\n" + fence + "\n", editor.getCursor());
    }});
    this.addCommand({ id: "create-checklist", name: t.commandChecklist, editorCallback: editor => {
      new ChecklistModal(this.app, (title, total, interval) => {
        const steps = [];
        for (let n = interval; n < total; n += interval) steps.push(n);
        steps.push(total);
        const output = "## " + title + "\n\n" + steps.map(n => "- [ ] " + title + " — " + n + " از " + total).join("\n") + "\n";
        editor.replaceRange(output, editor.getCursor());
      }, this.settings.language).open();
    }});
    this.addSettingTab(new PuyanSettings(this.app, this));
  }

  onunload() { this.views.clear(); }
  async saveSettings() { await this.saveData(this.settings); }
  textSetting(container, label, key, fallback) {
    new Setting(container).setName(label).addText(input => input.setValue(this.settings[key]).onChange(async value => {
      this.settings[key] = value.trim() || fallback;
      await this.saveSettings();
    }));
  }
  toggleSetting(container, label, key) {
    new Setting(container).setName(label).addToggle(toggle => toggle.setValue(this.settings[key]).onChange(async value => {
      this.settings[key] = value;
      await this.saveSettings();
      this.refreshAll();
    }));
  }
  refreshAll() {
    for (const set of this.views.values()) for (const view of set) view.refresh();
  }
  async changeDateSettings(key, value) {
    const old = { calendar: this.settings.calendar, dateFormat: this.settings.dateFormat };
    if (this.settings[key] === value) return;
    this.settings[key] = value;
    await this.saveSettings();
    let changed = 0, skipped = 0;
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
      if (!fm) continue;
      const fields = [this.settings.startField, this.settings.endField];
      const candidates = fields.filter(field => fm[field] !== undefined && fm[field] !== null && fm[field] !== "");
      if (!candidates.length) continue;
      let fileChanged = false;
      await this.app.fileManager.processFrontMatter(file, front => {
        for (const field of candidates) {
          const parsed = parseDateValue(front[field], old.calendar);
          if (!parsed) { skipped++; continue; }
          const formatted = formatDate(parsed, this.settings);
          if (String(front[field]) !== formatted) { front[field] = formatted; changed++; fileChanged = true; }
        }
      });
      if (fileChanged) this.updating.add(file.path);
    }
    window.setTimeout(() => this.updating.clear(), 500);
    await this.saveSettings();
    this.refreshAll();
    const t = TEXT[this.settings.language];
    new Notice(skipped ? t.migrationPartial : changed ? t.migrationDone : t.migrationNone);
  }
  async renderWidget(view) {
    const file = this.app.vault.getAbstractFileByPath(view.path);
    if (!file) return;
    const content = await this.app.vault.cachedRead(file);
    const tasks = readTasks(content, this.settings.countSubtasks);
    const total = tasks.length, done = tasks.filter(Boolean).length;
    const percent = total ? Math.round(done / total * 100) : 0;
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || {};
    const s = this.settings, t = TEXT[s.language];
    const startKey = s.startField, endKey = s.endField, durationKey = s.durationField, progressKey = s.progressField;
    const today = formatDate(new Date(), s);
    if (total) {
      const started = done > 0, completed = done === total;
      const needsChange = (started && !fm[startKey]) || (completed && !fm[endKey]) ||
        (!completed && !!fm[endKey]) || (!started && !!fm[startKey]) ||
        (s.saveProgress && Number(normalizeDigits(fm[progressKey] ?? NaN)) !== percent);
      if (needsChange && !this.updating.has(file.path)) {
        this.updating.add(file.path);
        try {
          await this.app.fileManager.processFrontMatter(file, front => {
            if (started && !front[startKey]) front[startKey] = today;
            if (completed && !front[endKey]) front[endKey] = today;
            if (!completed) { delete front[endKey]; delete front[durationKey]; }
            if (!started) { delete front[startKey]; delete front[endKey]; delete front[durationKey]; }
            if (completed && front[startKey] && front[endKey]) {
              const days = this.durationInDays(front[startKey], front[endKey]);
              if (days !== null) front[durationKey] = days;
            }
            if (s.saveProgress) front[progressKey] = percent;
          });
        } catch (error) { console.error("Puyan Frontmatter update failed", error); }
        finally { window.setTimeout(() => this.updating.delete(file.path), 150); }
      }
    }
    const latest = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || fm;
    view.el.empty();
    view.el.addClass("puyan");
    if (!total) { view.el.createDiv({ cls: "puyan-empty", text: t.noTasks }); return; }

    let gradient, icon, status, glowColor;
    if (percent === 100) { gradient = "linear-gradient(135deg,#10b981,#34d399,#6ee7b7)"; icon = "🎉"; status = t.complete; glowColor = "rgba(16,185,129,.4)"; }
    else if (percent >= 75) { gradient = "linear-gradient(135deg,#8b5cf6,#a78bfa,#c4b5fd)"; icon = "🔥"; status = t.near; glowColor = "rgba(139,92,246,.4)"; }
    else if (percent >= 50) { gradient = "linear-gradient(135deg,#3b82f6,#60a5fa,#93c5fd)"; icon = "🌓"; status = t.halfway; glowColor = "rgba(59,130,246,.4)"; }
    else if (percent >= 25) { gradient = "linear-gradient(135deg,#f59e0b,#fbbf24,#fcd34d)"; icon = "⚡"; status = t.doing; glowColor = "rgba(245,158,11,.4)"; }
    else { gradient = "linear-gradient(135deg,#ef4444,#f87171,#fca5a5)"; icon = "🚀"; status = t.start; glowColor = "rgba(239,68,68,.4)"; }

    const header = view.el.createDiv("puyan-header");
    const heading = header.createDiv("puyan-heading");
    heading.createSpan({ cls: "puyan-icon", text: icon });
    heading.createSpan({ cls: "puyan-title", text: status });
    if (s.showCounter) header.createSpan({ cls: "puyan-counter", text: displayDigits(done, s.outputDigits) + " / " + displayDigits(total, s.outputDigits) + " " + t.tasks });

    const track = view.el.createDiv("puyan-track");
    if (percent > 0) {
      const glow = track.createDiv("puyan-glow");
      glow.style.width = percent + "%";
      glow.style.background = glowColor;
    }
    const fill = track.createDiv("puyan-fill");
    fill.style.width = percent + "%";
    fill.style.background = gradient;
    const percentText = displayDigits(percent, s.outputDigits) + (s.language === "fa" ? "٪" : "%");
    if (percent >= 20) fill.setText(percentText);
    else track.createSpan({ cls: "puyan-outside-percent", text: percentText });

    const stats = view.el.createDiv("puyan-stats");
    stats.createSpan({ text: displayDigits(done, s.outputDigits) + " " + t.completedTasks });
    stats.createSpan({ text: displayDigits(total - done, s.outputDigits) + " " + t.remaining });

    const shownStart = done > 0 ? (latest[startKey] || today) : null;
    const shownEnd = done === total ? (latest[endKey] || today) : null;
    const duration = shownStart && shownEnd ? this.durationInDays(shownStart, shownEnd) : null;
    if (percent === 100 && shownEnd) {
      const completion = view.el.createDiv("puyan-completion");
      completion.createSpan({ cls: "puyan-crown", text: "🏆" });
      if (s.showEndDate) completion.createSpan({ cls: "puyan-completion-text", text: "✅ " + t.completedOn + " " + shownEnd });
      if (s.showDuration && duration !== null) {
        const durationText = duration <= 1 ? t.lessThanDay : displayDigits(duration, s.outputDigits) + " " + t.days;
        completion.createSpan({ cls: "puyan-duration-pill", text: t.duration + " " + durationText });
      }
    } else if (shownStart && s.showStartDate) {
      const info = view.el.createDiv("puyan-duration-info");
      info.createSpan({ text: "⏳" });
      info.createSpan({ text: t.startedOn + " " + shownStart });
    }
  }
  durationInDays(start, end) {
    const a = parseDateValue(start, this.settings.calendar), b = parseDateValue(end, this.settings.calendar);
    if (!a || !b) return null;
    return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / 86400000) + 1);
  }
};