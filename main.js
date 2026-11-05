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
  showDuration: true,
  showNoteTitle: true,
  showOpenButton: true,
  savedChecklists: [
    { id: "weekdays", name: "روزهای هفته", type: "fixed", items: ["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"] },
    { id: "steps10", name: "مراحل ده‌تایی", type: "step", interval: 10, dateStep: 1, template: "- [ ] {n}" },
    { id: "stepsWithDates", name: "مراحل با تاریخ", type: "step", interval: 1, dateStep: 1, template: "- [ ] {date} — {n}" }
  ]
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
    showDuration: "نمایش مدت انجام", showNoteTitle: "نمایش عنوان یادداشت", showOpenButton: "نمایش دکمهٔ بازکردن یادداشت",
    commandInsert: "درج ویجت پیشرفت", commandChecklist: "ساخت چک‌لیست از قالب (انتخاب دستی)",
    commandChecklistPrefix: "ساخت چک‌لیست:",
    modalTitle: "ساخت چک‌لیست", activity: "عنوان فعالیت", total: "مقدار کل",
    totalDesc: "تعداد صفحات، فصل‌ها یا مراحل", interval: "فاصله مراحل", create: "ساخت چک‌لیست",
    continueBtn: "ادامه", backBtn: "بازگشت",
    invalid: "اطلاعات واردشده معتبر نیست.", noTasks: "هیچ تسکی برای نمایش پیشرفت وجود ندارد",
    complete: "کامل شد!", near: "نزدیک به اتمام", halfway: "نیمه‌راه", doing: "در حال انجام", start: "شروع",
    tasks: "تسک", completedTasks: "تسک انجام‌شده", remaining: "تسک باقی‌مانده",
    completedOn: "تکمیل شده در:", duration: "مدت انجام:", days: "روز", lessThanDay: "کمتر از یک روز",
    startedOn: "شروع:", migrationDone: "تاریخ‌های یادداشت‌ها به قالب جدید تبدیل شد.",
    migrationPartial: "تبدیل تاریخ‌ها انجام شد؛ بعضی تاریخ‌های ناشناخته بدون تغییر ماندند.",
    migrationNone: "تنظیمات تاریخ تغییر کرد؛ تاریخ قابل تبدیل دیگری پیدا نشد.",
    widgetTarget: "یادداشت منبع", checklistType: "نوع چک‌لیست پیش‌فرض",
    numericListType: "عددگذاری مرحله‌ای", fixedListType: "فهرست ثابت",
    checklistTemplate: "قالب هر مرحله",
    templateDesc: "با دکمه‌ها یا تایپ مستقیم، قالب را بسازید. {n} شماره، {total} کل، {title} عنوان، {date} تاریخ.",
    checklistItems: "موارد فهرست (هر مورد در یک خط)",
    listDesc: "برای نمونه روزهای هفته را هرکدام در یک خط بنویسید.",
    savedLists: "قالب‌های ذخیره‌شده چک‌لیست",
    addList: "افزودن قالب", editList: "ویرایش قالب", removeList: "حذف",
    listName: "نام قالب", listType: "نوع قالب", numericList: "مرحله‌ای", listItemsType: "ثابت",
    itemsLabel: "موارد (با ویرگول جدا کنید)", itemsDesc: "مثلاً: مطالعه، تمرین، مرور",
    totalLabel: "مقدار کل", intervalLabel: "فاصله مراحل", templateLabel: "قالب هر مرحله",
    defaultIntervalLabel: "فاصله مراحل پیش‌فرض", defaultIntervalDesc: "هنگام ساخت چک‌لیست قابل تغییر است.",
    intervalDesc: "فاصله بین مراحل (مثلاً ۱۰ یا ۲۵).",
    chooseList: "انتخاب چک‌لیست", startDate: "تاریخ شروع",
    startDateDesc: "برای انتخاب، روی تقویم کلیک کنید یا دستی وارد کنید.",
    pickDate: "انتخاب تاریخ", noSavedLists: "هنوز قالبی ذخیره نشده است.",
    listEmpty: "موارد این قالب خالی است.",
    templateHelp: "راهنمای قالب هر مرحله",
    templateHelpBody: "از {n} برای شماره مرحله، {total} برای مقدار کل، {title} برای عنوان فعالیت و {date} برای تاریخ همان مرحله استفاده کنید.",
    widgetSyntax: "برای نمایش ویجت از یادداشت دیگر، در کدبلاک بنویسید: note: مسیر/یادداشت.md",
    targetNotFound: "یادداشت مقصد پیدا نشد: ",
    calendarPluginMissing: "پلاگین «تقویم پارسی» (persian-calendar) نصب یا فعال نیست. تبدیل تاریخ شمسی در دسترس نخواهد بود.",
    widgetBefore: "ویجت پیشرفت را قبل از چک‌لیست قرار بده",
    dateStepLabel: "ضریب تاریخ", dateStepDesc: "هر چند روز یکبار تاریخ ثبت شود (۱ = هر روز)",
    openNote: "بازکردن یادداشت", today: "امروز", closeBtn: "بستن",
    tplTokensLabel: "توکن‌ها:", tplTokenN: "شماره مرحله", tplTokenTotal: "مقدار کل",
    tplTokenTitle: "عنوان فعالیت", tplTokenDate: "تاریخ مرحله", tplTextLabel: "متن:",
    tplTextCheckbox: "چک‌باکس", tplTextOf: "از", tplTextNewline: "خط جدید",
    tplPresetsLabel: "آماده:", tplPresetSimple: "ساده", tplPresetWithTitle: "با عنوان",
    tplPresetWithDate: "با تاریخ", tplPresetBare: "فقط شماره",
    tplPreviewLabel: "پیش‌نمایش:", tplSampleTitle: "نمونه",
    supportAriaLabel: "ارتباط با ما و حمایت", supportHeading: "همراه ما باشید",
    supportIntro: "آموزش‌ها، تازه‌ها و نکته‌های کاربردی ابسیدین را در کانال‌های ما دنبال کنید.",
    supportChannelJoin: "عضویت در کانال",
    supportDonationTitle: "با همراهی شما، ادامه می‌دهیم",
    supportDonationDesc: "اگر این افزونه برایتان مفید بوده، می‌توانید از ادامهٔ توسعهٔ آن حمایت کنید.",
    supportDonateBtn: "حمایت مالی", supportDonateAria: "حمایت مالی از سازنده در ریمیت"
  },
  en: {
    settings: "Puyan settings", language: "Interface language", fa: "فارسی", en: "English",
    startField: "Start date property", endField: "Completion date property", durationField: "Duration property",
    progressField: "Progress property", calendar: "Calendar", jalali: "Jalali", gregorian: "Gregorian",
    dateFormat: "Date format", numeric: "Numeric", long: "Month name", iso: "ISO",
    outputDigits: "Displayed digits", persianDigits: "Persian (۱۲۳)", latinDigits: "Latin (123)",
    saveProgress: "Save progress percentage to Frontmatter", countSubtasks: "Count nested tasks",
    showCounter: "Show task counter", showStartDate: "Show start date", showEndDate: "Show completion date",
    showDuration: "Show duration", showNoteTitle: "Show note title", showOpenButton: "Show 'open note' button",
    commandInsert: "Insert progress widget", commandChecklist: "Create checklist from template (pick manually)",
    commandChecklistPrefix: "Create checklist:",
    modalTitle: "Create checklist", activity: "Activity title", total: "Total amount",
    totalDesc: "Number of pages, chapters, or steps", interval: "Step interval", create: "Create checklist",
    continueBtn: "Continue", backBtn: "Back",
    invalid: "Please enter valid values.", noTasks: "No tasks found to calculate progress",
    complete: "Completed!", near: "Almost there", halfway: "Halfway", doing: "In progress", start: "Getting started",
    tasks: "tasks", completedTasks: "tasks completed", remaining: "remaining",
    completedOn: "Completed on:", duration: "Duration:", days: "days", lessThanDay: "Less than a day",
    startedOn: "Started:", migrationDone: "Dates in your notes were converted to the new format.",
    migrationPartial: "Date conversion finished; some unrecognized dates were left unchanged.",
    migrationNone: "Date settings changed; no convertible dates were found.",
    widgetTarget: "Source note", checklistType: "Default checklist type",
    numericListType: "Numbered steps", fixedListType: "Fixed list",
    checklistTemplate: "Step line template",
    templateDesc: "Use the buttons or type directly. {n} number, {total} total, {title} title, {date} date.",
    checklistItems: "List items (one per line)",
    listDesc: "For example, enter weekdays on separate lines.",
    savedLists: "Saved checklist templates",
    addList: "Add template", editList: "Edit template", removeList: "Remove",
    listName: "Template name", listType: "Template type", numericList: "Step-based", listItemsType: "Fixed list",
    itemsLabel: "Items (separate with commas)", itemsDesc: "For example: Read, Practice, Review",
    totalLabel: "Total amount", intervalLabel: "Step interval", templateLabel: "Step template",
    defaultIntervalLabel: "Default step interval", defaultIntervalDesc: "Can be changed when creating a checklist.",
    intervalDesc: "Gap between steps (e.g. 10 or 25).",
    chooseList: "Choose a checklist", startDate: "Start date",
    startDateDesc: "Click the calendar icon to pick, or type manually.",
    pickDate: "Pick date", noSavedLists: "No saved templates yet.",
    listEmpty: "This template has no items.",
    templateHelp: "Step template guide",
    templateHelpBody: "Use {n} for step number, {total} for total, {title} for activity title, and {date} for that step's date.",
    widgetSyntax: "To show a widget from another note, add this inside the code block: note: path/to/note.md",
    targetNotFound: "Target note not found: ",
    calendarPluginMissing: "The 'persian-calendar' plugin is not installed or enabled. Jalali date conversion will be unavailable.",
    widgetBefore: "Insert progress widget before the checklist",
    dateStepLabel: "Date step", dateStepDesc: "How many days between each item's date (1 = every day)",
    openNote: "Open note", today: "Today", closeBtn: "Close",
    tplTokensLabel: "Tokens:", tplTokenN: "Step number", tplTokenTotal: "Total",
    tplTokenTitle: "Activity title", tplTokenDate: "Step date", tplTextLabel: "Text:",
    tplTextCheckbox: "Checkbox", tplTextOf: "of", tplTextNewline: "Newline",
    tplPresetsLabel: "Presets:", tplPresetSimple: "Simple", tplPresetWithTitle: "With title",
    tplPresetWithDate: "With date", tplPresetBare: "Bare number",
    tplPreviewLabel: "Preview:", tplSampleTitle: "Sample",
    supportAriaLabel: "Connect and support", supportHeading: "Stay connected",
    supportIntro: "Follow our channels for Obsidian tutorials, updates and practical tips.",
    supportChannelJoin: "Join channel",
    supportDonationTitle: "Help this project grow",
    supportDonationDesc: "If this plugin helps you, consider supporting its continued development.",
    supportDonateBtn: "Donate", supportDonateAria: "Support the creator on Reymit"
  }
};

const PERSIAN_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const ENGLISH_MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const JALALI_MONTHS_EN = ["Farvardin","Ordibehesht","Khordad","Tir","Mordad","Shahrivar","Mehr","Aban","Azar","Dey","Bahman","Esfand"];

/* ---------------- DOM helpers ---------------- */
function el(parent, tag, cls, text) {
  const node = parent.createEl(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}
function link(parent, cls, href, ariaLabel) {
  const a = parent.createEl("a");
  if (cls) a.className = cls;
  a.href = href;
  a.setAttribute("target", "_blank");
  a.setAttribute("rel", "noopener noreferrer");
  if (ariaLabel) a.setAttribute("aria-label", ariaLabel);
  return a;
}
const SVG_NS = "http://www.w3.org/2000/svg";
function makeSvg(parent, viewBox, children) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  for (const [tag, attrs] of children) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    svg.appendChild(node);
  }
  parent.appendChild(svg);
  return svg;
}
function logo(parent, type) {
  if (type === "bale") return makeSvg(parent, "0 0 24 24", [
    ["path", { d: "M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8l-4 4V7a2 2 0 0 1 2-2z" }],
    ["path", { d: "M8 10h8M8 14h5" }]
  ]);
  if (type === "telegram") return makeSvg(parent, "0 0 24 24", [
    ["path", { d: "M22 3 11 14" }],
    ["path", { d: "M22 3 15 21l-4-7-7-4 18-7z" }]
  ]);
  if (type === "youtube") return makeSvg(parent, "0 0 24 24", [
    ["rect", { x: "2", y: "5", width: "20", height: "14", rx: "3.5" }],
    ["path", { d: "m10 9 5 3-5 3V9z", fill: "currentColor", stroke: "none" }]
  ]);
  if (type === "heart") return makeSvg(parent, "0 0 24 24", [
    ["path", { d: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" }]
  ]);
  return null;
}
function calendarIcon(parent) {
  const svg = makeSvg(parent, "0 0 24 24", [
    ["rect", { x: "3", y: "5", width: "18", height: "16", rx: "2.5" }],
    ["path", { d: "M3 10h18" }],
    ["path", { d: "M8 3v4M16 3v4" }]
  ]);
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("class", "puyan-calendar-icon");
  return svg;
}

/* ---------------- digit helpers ---------------- */
function normalizeDigits(value) {
  return String(value)
    .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}
function displayDigits(value, mode) {
  const s = String(value);
  return mode === "fa" ? s.replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]) : s;
}
function todayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
}

/* ---------------- persian-calendar bridge ---------------- */
class CalendarApi {
  constructor(app) { this.app = app; this.pcApi = null; this._resolve(); }
  _resolve() {
    try {
      const plugin = this.app.plugins?.getPlugin?.("persian-calendar");
      this.pcApi = plugin?.api || null;
    } catch (_) { this.pcApi = null; }
    return this.pcApi;
  }
  get available() { return !!(this.pcApi || this._resolve()); }
  toEnNumber(v) {
    if (this.available && typeof this.pcApi.toEnNumber === "function") return this.pcApi.toEnNumber(String(v));
    return normalizeDigits(v);
  }
  toFaNumber(v) {
    if (this.available && typeof this.pcApi.toFaNumber === "function") return this.pcApi.toFaNumber(String(v));
    return displayDigits(v, "fa");
  }
  gregorianToJalali(date) {
    if (!this.available) return null;
    try {
      const g = date instanceof Date ? date : new Date(date);
      if (!(g instanceof Date) || isNaN(g.getTime())) return null;
      const r = this.pcApi.gregorianToJalali(g.getFullYear(), g.getMonth() + 1, g.getDate());
      return (r && Number.isFinite(r.jy) && Number.isFinite(r.jm) && Number.isFinite(r.jd)) ? r : null;
    } catch (_) { return null; }
  }
  jalaliToDate(jy, jm, jd) {
    if (!this.available) return null;
    try {
      const d = this.pcApi.jalaliToDate(jy, jm, jd);
      if (!(d instanceof Date) || isNaN(d.getTime())) return null;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
    } catch (_) { return null; }
  }
  jalaliMonthName(m, lang) {
    if (this.available && typeof this.pcApi.jalaliMonthName === "function") {
      try { return this.pcApi.jalaliMonthName(m, lang); } catch (_) {}
    }
    if (lang === "en") return JALALI_MONTHS_EN[m - 1] || "";
    return PERSIAN_MONTHS[m - 1] || "";
  }
}

/* ---------------- date parsing ---------------- */
function parseDateValue(value, calendar, calApi) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const s = calApi.toEnNumber(String(value)).trim();
  let m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (m) {
    const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    return calendar === "jalali" ? calApi.jalaliToDate(y, mo, d) : validGregorianLocal(y, mo, d);
  }
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]), y = Number(m[3]);
    if (calendar === "jalali") return calApi.jalaliToDate(y, b, a);
    return validGregorianLocal(y, b, a);
  }
  m = s.match(/^(\d{1,2})\s+(.+?)\s+(\d{4})$/i);
  if (m) {
    const d = Number(m[1]), monthText = m[2].trim().toLowerCase(), y = Number(m[3]);
    if (calendar === "jalali") {
      let pm = PERSIAN_MONTHS.findIndex(x => x === monthText) + 1;
      if (pm <= 0) pm = JALALI_MONTHS_EN.findIndex(x => x.toLowerCase() === monthText) + 1;
      if (pm > 0) return calApi.jalaliToDate(y, pm, d);
    } else {
      const em = ENGLISH_MONTHS.findIndex(x => x.startsWith(monthText));
      if (em >= 0) return validGregorianLocal(y, em + 1, d);
    }
  }
  if (calendar === "gregorian") {
    const parsed = Date.parse(s);
    if (Number.isFinite(parsed)) {
      const date = new Date(parsed);
      return validGregorianLocal(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }
  }
  return null;
}
function validGregorianLocal(y, m, d) {
  if (!Number.isInteger(y) || y < 1 || y > 9999) return null;
  if (!Number.isInteger(m) || m < 1 || m > 12) return null;
  if (!Number.isInteger(d) || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d, 12, 0, 0, 0);
  return (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) ? date : null;
}

/* ---------------- date formatting ---------------- */
function formatDate(date, settings, calApi) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  if (settings.calendar === "jalali") {
    const p = calApi.gregorianToJalali(d);
    if (!p) return "";
    const lang = settings.language === "fa" ? "fa" : "en";
    if (settings.dateFormat === "iso") {
      return displayDigits(String(p.jy) + "-" + String(p.jm).padStart(2, "0") + "-" + String(p.jd).padStart(2, "0"), settings.outputDigits);
    }
    if (settings.dateFormat === "long") {
      const month = calApi.jalaliMonthName(p.jm, lang);
      return displayDigits(p.jd + " " + month + " " + p.jy, settings.outputDigits);
    }
    return displayDigits(p.jy + "/" + String(p.jm).padStart(2, "0") + "/" + String(p.jd).padStart(2, "0"), settings.outputDigits);
  }
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  if (settings.dateFormat === "iso") {
    return displayDigits(y + "-" + String(m).padStart(2, "0") + "-" + String(day).padStart(2, "0"), settings.outputDigits);
  }
  if (settings.dateFormat === "long") {
    const txt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
      .format(new Date(Date.UTC(y, m - 1, day)));
    return displayDigits(txt, settings.outputDigits);
  }
  return displayDigits(y + "/" + String(m).padStart(2, "0") + "/" + String(day).padStart(2, "0"), settings.outputDigits);
}

/* ---------------- task reader ---------------- */
function readTasks(content, countSubtasks) {
  const tasks = [];
  let parentIndent = null;
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+.+$/);
    if (!m) continue;
    const indent = m[1].replace(/\t/g, "    ").length;
    if (!countSubtasks) {
      if (parentIndent === null || indent < parentIndent) parentIndent = indent;
      else if (indent > parentIndent) continue;
    }
    tasks.push(m[2].toLowerCase() === "x");
  }
  return tasks;
}
function parseWidgetOptions(source) {
  const options = {};
  for (const line of String(source || "").split(/\r?\n/)) {
    const match = line.match(/^\s*note\s*:\s*(.+?)\s*$/i);
    if (match) options.note = match[1].trim();
  }
  return options;
}
function resolveLinkTarget(raw) {
  return String(raw).replace(/^\[\[|\]\]$/g, "").split("|")[0].trim();
}

/* ==================================================================== */
/* Inline popover calendar (Persian / Gregorian) — attached to modal    */
/* ==================================================================== */
class PopoverCalendar {
  constructor(anchor, plugin, initial, onPick) {
    this.anchor = anchor;
    this.plugin = plugin;
    this.calApi = plugin.calApi;
    this.settings = plugin.settings;
    this.t = TEXT[plugin.settings.language];
    this.onPick = onPick;
    this.current = (initial instanceof Date && !isNaN(initial.getTime())) ? new Date(initial) : todayLocal();
    this.overlay = null;
    this.popover = null;
    this._outsideHandler = null;
    this.open();
  }

  open() {
    // close any existing instance
    document.querySelectorAll(".puyan-cal-overlay").forEach(n => n.remove());

    // full-screen transparent overlay catches outside clicks
    this.overlay = document.body.createDiv({ cls: "puyan-cal-overlay" });
    this.overlay.addEventListener("pointerdown", (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.popover = document.body.createDiv({ cls: "puyan-cal-popover" });
    this.popover.setAttribute("dir", this.settings.language === "fa" ? "rtl" : "ltr");

    // position based on anchor's viewport rect (fixed positioning)
    const aRect = this.anchor.getBoundingClientRect();
    const popW = 280;
    const popH = 340;
    const margin = 8;

    let left = aRect.left;
    let top = aRect.bottom + margin;

    // RTL: align right edge of popover with right edge of button
    if (this.settings.language === "fa") {
      left = aRect.right - popW;
    }

    // flip up if no room below
    if (top + popH > window.innerHeight - margin) {
      top = Math.max(margin, aRect.top - popH - margin);
    }
    // clamp horizontally
    if (left < margin) left = margin;
    if (left + popW > window.innerWidth - margin) left = window.innerWidth - popW - margin;

    this.popover.style.top = top + "px";
    this.popover.style.left = left + "px";

    this._render();
  }

  _render() {
    const pop = this.popover, calApi = this.calApi;
    pop.empty();
    const isJalali = this.settings.calendar === "jalali";
    const pj = isJalali ? calApi.gregorianToJalali(this.current) : null;
    const year = pj ? pj.jy : this.current.getFullYear();
    const month = pj ? pj.jm : this.current.getMonth() + 1;

    // header
    const header = pop.createDiv({ cls: "puyan-cal-header" });
    const prev = header.createEl("button", { cls: "puyan-cal-nav", text: "‹" });
    prev.setAttribute("type", "button");
    prev.onclick = (e) => {
      e.preventDefault();
      if (isJalali) {
        const nm = month === 1 ? 12 : month - 1;
        const ny = month === 1 ? year - 1 : year;
        const nd = calApi.jalaliToDate(ny, nm, 1);
        if (nd) { this.current = nd; this._render(); }
      } else {
        this.current = new Date(year, month - 2, 1);
        this._render();
      }
    };

    const label = header.createSpan({ cls: "puyan-cal-label" });
    if (isJalali) {
      label.textContent = calApi.jalaliMonthName(month, this.settings.language === "fa" ? "fa" : "en") +
        " " + displayDigits(year, this.settings.outputDigits);
    } else {
      label.textContent = new Intl.DateTimeFormat(
        this.settings.language === "fa" ? "fa-IR" : "en-GB",
        { month: "long", year: "numeric" }
      ).format(this.current);
    }

    const next = header.createEl("button", { cls: "puyan-cal-nav", text: "›" });
    next.setAttribute("type", "button");
    next.onclick = (e) => {
      e.preventDefault();
      if (isJalali) {
        const nm = month === 12 ? 1 : month + 1;
        const ny = month === 12 ? year + 1 : year;
        const nd = calApi.jalaliToDate(ny, nm, 1);
        if (nd) { this.current = nd; this._render(); }
      } else {
        this.current = new Date(year, month, 1);
        this._render();
      }
    };

    // weekday header
    const grid = pop.createDiv({ cls: "puyan-cal-grid" });
    const weekdaysFa = isJalali ? ["ش","ی","د","س","چ","پ","ج"] : ["ی","د","س","چ","پ","ج","ش"];
    const weekdaysEn = ["S","M","T","W","T","F","S"];
    const weekdays = this.settings.language === "fa" ? weekdaysFa : weekdaysEn;
    weekdays.forEach(w => grid.createSpan({ cls: "puyan-cal-wd", text: w }));

    // first day / days in month
    let firstDay, daysInMonth;
    if (isJalali) {
      const g = calApi.jalaliToDate(year, month, 1);
      firstDay = g ? g.getDay() : 6;
      const leap = (year % 33 === 1 || year % 33 === 5 || year % 33 === 9 || year % 33 === 13 ||
                    year % 33 === 17 || year % 33 === 22 || year % 33 === 26 || year % 33 === 30);
      daysInMonth = month <= 6 ? 31 : (month <= 11 ? 30 : (leap ? 30 : 29));
    } else {
      firstDay = new Date(year, month - 1, 1).getDay();
      daysInMonth = new Date(year, month, 0).getDate();
    }
    const shift = isJalali ? (firstDay + 1) % 7 : firstDay;
    for (let i = 0; i < shift; i++) grid.createSpan({ cls: "puyan-cal-empty" });

    const today = todayLocal();
    const selected = this.current;
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = isJalali
        ? calApi.jalaliToDate(year, month, d)
        : validGregorianLocal(year, month, d);
      const isToday = cellDate && cellDate.toDateString() === today.toDateString();
      const isSel = cellDate && cellDate.toDateString() === selected.toDateString();
      let cls = "puyan-cal-day";
      if (isToday) cls += " is-today";
      if (isSel) cls += " is-selected";
      const btn = grid.createEl("button", { cls, text: displayDigits(d, this.settings.outputDigits) });
      btn.setAttribute("type", "button");
      btn.onclick = (e) => {
        e.preventDefault();
        if (cellDate) {
          this.onPick(cellDate);
          this.close();
        }
      };
    }

    // footer
    const footer = pop.createDiv({ cls: "puyan-cal-footer" });
    const todayBtn = footer.createEl("button", { cls: "puyan-cal-today", text: this.t.today });
    todayBtn.setAttribute("type", "button");
    todayBtn.onclick = (e) => { e.preventDefault(); this.onPick(todayLocal()); this.close(); };
    const closeBtn = footer.createEl("button", { cls: "puyan-cal-close", text: this.t.closeBtn });
    closeBtn.setAttribute("type", "button");
    closeBtn.onclick = (e) => { e.preventDefault(); this.close(); };
  }

  close() {
    if (this.overlay) { this.overlay.remove(); this.overlay = null; }
    if (this.popover) { this.popover.remove(); this.popover = null; }
  }
}
/* ==================================================================== */
/* Compact stepper                                                      */
/* ==================================================================== */
class CompactStepper {
  constructor(parent, opts) {
    this.value = Number(opts.value) || 1;
    this.min = opts.min ?? 1;
    this.max = opts.max ?? 9999;
    this.step = opts.step ?? 1;
    this.onChange = opts.onChange || (() => {});
    this.outputDigits = opts.outputDigits || "en";

    const wrap = parent.createDiv({ cls: "puyan-stepper" });
    const minus = wrap.createEl("button", { cls: "puyan-stepper-btn", text: "−" });
    minus.setAttribute("type", "button");
    minus.onclick = (e) => { e.preventDefault(); this.setValue(this.value - this.step); };

    const input = wrap.createEl("input", { cls: "puyan-stepper-input", type: "text" });
    input.value = displayDigits(this.value, this.outputDigits);
    input.oninput = () => {
      const n = Number(normalizeDigits(input.value));
      if (Number.isFinite(n)) {
        this.value = Math.min(this.max, Math.max(this.min, n));
        this.onChange(this.value);
      }
    };
    input.onblur = () => { input.value = displayDigits(this.value, this.outputDigits); };

    const plus = wrap.createEl("button", { cls: "puyan-stepper-btn", text: "+" });
    plus.setAttribute("type", "button");
    plus.onclick = (e) => { e.preventDefault(); this.setValue(this.value + this.step); };

    this.input = input;
  }
  setValue(v) {
    this.value = Math.min(this.max, Math.max(this.min, v));
    this.input.value = displayDigits(this.value, this.outputDigits);
    this.onChange(this.value);
  }
}

/* ==================================================================== */
/* Template builder widget                                              */
/* ==================================================================== */
class TemplateBuilder {
  constructor(parent, opts) {
    this.parent = parent;
    this.t = opts.t;
    this.settings = opts.settings || {};
    this.value = opts.initial || "- [ ] {n}";
    this.onChange = opts.onChange || (() => {});
    this.render();
  }
  render() {
    const { parent, t } = this;
    parent.empty();
    const wrap = parent.createDiv({ cls: "puyan-tpl-builder" });
    const ta = wrap.createEl("textarea", { cls: "puyan-tpl-input" });
    ta.rows = 3;
    ta.value = this.value;
    ta.oninput = () => { this.value = ta.value; this.updatePreview(); this.onChange(this.value); };
    const insert = (text) => {
      const start = ta.selectionStart ?? ta.value.length;
      const end = ta.selectionEnd ?? ta.value.length;
      ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
      const caret = start + text.length;
      ta.focus();
      ta.setSelectionRange(caret, caret);
      this.value = ta.value;
      this.updatePreview();
      this.onChange(this.value);
    };
    const tokenRow = wrap.createDiv({ cls: "puyan-tpl-row" });
    tokenRow.createSpan({ cls: "puyan-tpl-label", text: t.tplTokensLabel });
    [
      { tok: "{n}", title: t.tplTokenN }, { tok: "{total}", title: t.tplTokenTotal },
      { tok: "{title}", title: t.tplTokenTitle }, { tok: "{date}", title: t.tplTokenDate }
    ].forEach(({ tok, title }) => {
      const btn = tokenRow.createEl("button", { cls: "puyan-tpl-btn", text: tok });
      btn.setAttribute("type", "button");
      btn.title = title;
      btn.onclick = (e) => { e.preventDefault(); insert(tok); };
    });
    const sepRow = wrap.createDiv({ cls: "puyan-tpl-row" });
    sepRow.createSpan({ cls: "puyan-tpl-label", text: t.tplTextLabel });
    [
      { txt: "- [ ] ", title: t.tplTextCheckbox }, { txt: " — ", title: "—" },
      { txt: " | ", title: "|" }, { txt: " " + t.tplTextOf + " ", title: t.tplTextOf },
      { txt: " / ", title: "/" }, { txt: "\n", title: t.tplTextNewline }
    ].forEach(({ txt, title }) => {
      const btn = sepRow.createEl("button", { cls: "puyan-tpl-btn", text: txt === "\n" ? "↵" : txt });
      btn.setAttribute("type", "button");
      btn.title = title;
      btn.onclick = (e) => { e.preventDefault(); insert(txt); };
    });
    const presetRow = wrap.createDiv({ cls: "puyan-tpl-row" });
    presetRow.createSpan({ cls: "puyan-tpl-label", text: t.tplPresetsLabel });
    [
      { tpl: "- [ ] {n}", title: t.tplPresetSimple },
      { tpl: "- [ ] {title} — {n} " + t.tplTextOf + " {total}", title: t.tplPresetWithTitle },
      { tpl: "- [ ] {date} | {n}", title: t.tplPresetWithDate },
      { tpl: "{n}", title: t.tplPresetBare }
    ].forEach(({ tpl, title }) => {
      const btn = presetRow.createEl("button", { cls: "puyan-tpl-btn puyan-tpl-preset", text: title });
      btn.setAttribute("type", "button");
      btn.onclick = (e) => {
        e.preventDefault();
        this.value = tpl;
        ta.value = tpl;
        this.updatePreview();
        this.onChange(this.value);
      };
    });
    this.previewEl = wrap.createDiv({ cls: "puyan-tpl-preview" });
    this.updatePreview();
  }
  updatePreview() {
    if (!this.previewEl) return;
    const sample = { n: 3, total: 10, title: this.t.tplSampleTitle, date: "1405/09/13" };
    const rendered = String(this.value || "")
      .replace(/\{n\}/g, displayDigits(sample.n, this.settings.outputDigits))
      .replace(/\{total\}/g, displayDigits(sample.total, this.settings.outputDigits))
      .replace(/\{title\}/g, sample.title)
      .replace(/\{date\}/g, sample.date);
    this.previewEl.empty();
    this.previewEl.createSpan({ cls: "puyan-tpl-preview-label", text: this.t.tplPreviewLabel + " " });
    this.previewEl.createEl("code", { text: rendered });
  }
}

/* ==================================================================== */
/* Checklist preset modal (add / edit)                                  */
/* ==================================================================== */
class ChecklistPresetModal extends Modal {
  constructor(app, plugin, preset, done) {
    super(app); this.plugin = plugin; this.preset = preset; this.done = done;
    this.t = TEXT[plugin.settings.language];
  }
  onOpen() {
    const el = this.contentEl, t = this.t, p = this.plugin, old = this.preset;
    el.addClass("puyan-modal");
    el.setAttribute("dir", p.settings.language === "fa" ? "rtl" : "ltr");
    el.createEl("h2", { text: old ? t.editList : t.addList });
    let name = old?.name || "", type = old?.type || "fixed", items = (old?.items || []).join(", ");
    let interval = String(old?.interval || 10), dateStep = String(old?.dateStep || 1), template = old?.template || "- [ ] {n}";

    new Setting(el).setName(t.listName).addText(x => x.setValue(name).onChange(v => name = v));
    const typeRow = new Setting(el).setName(t.listType);
    const fields = el.createDiv();
    const render = () => {
      fields.empty();
      if (type === "fixed") {
        new Setting(fields).setName(t.itemsLabel).setDesc(t.itemsDesc).addTextArea(x => {
          x.setValue(items); x.inputEl.rows = 4; x.onChange(v => items = v);
        });
      } else {
        new Setting(fields).setName(t.defaultIntervalLabel).setDesc(t.defaultIntervalDesc)
          .addText(x => x.setValue(interval).onChange(v => interval = v));
        new Setting(fields).setName(t.dateStepLabel).setDesc(t.dateStepDesc)
          .addText(x => x.setValue(dateStep).onChange(v => dateStep = v));
        new Setting(fields).setName(t.templateLabel).setDesc(t.templateDesc);
        const builderHost = fields.createDiv();
        new TemplateBuilder(builderHost, { initial: template, t, settings: p.settings, onChange: v => template = v });
      }
    };
    typeRow.addDropdown(x => x.addOption("fixed", t.listItemsType).addOption("step", t.numericListType)
      .setValue(type).onChange(v => { type = v; render(); }));
    render();
    new Setting(el).addButton(x => x.setButtonText(old ? t.editList : t.addList).setCta().onClick(async () => {
      if (!name.trim()) { new Notice(t.invalid); return; }
      const item = { id: old?.id || "puyan-" + Date.now(), name: name.trim(), type };
      if (type === "fixed") {
        item.items = items.split(",").map(v => v.trim()).filter(Boolean);
        if (!item.items.length) { new Notice(t.listEmpty); return; }
      } else {
        item.interval = Number(normalizeDigits(interval)) || 10;
        item.dateStep = Math.max(1, Number(normalizeDigits(dateStep)) || 1);
        item.template = template || "- [ ] {n}";
        if (!Number.isInteger(item.interval) || item.interval < 1) { new Notice(t.invalid); return; }
      }
      const arr = p.settings.savedChecklists || (p.settings.savedChecklists = []);
      const i = arr.findIndex(v => v.id === item.id);
      if (i < 0) arr.push(item); else arr[i] = item;
      await p.saveSettings();
      p.refreshPresetCommands();
      this.close(); this.done();
    }));
  }
  onClose() { this.contentEl.empty(); }
}

/* ==================================================================== */
/* Two-step wizard                                                      */
/* ==================================================================== */
class ChecklistWizardModal extends Modal {
  constructor(app, plugin, submit, preset = null) {
    super(app); this.plugin = plugin; this.submit = submit; this.preset = preset;
    this.t = TEXT[plugin.settings.language];
    this.step = 1;
  }

  onOpen() {
    const el = this.contentEl, t = this.t, p = this.plugin;
    el.addClass("puyan-modal");
    el.setAttribute("dir", p.settings.language === "fa" ? "rtl" : "ltr");
    const arr = p.settings.savedChecklists || [];
    if (!arr.length) {
      el.createEl("h2", { text: t.modalTitle });
      el.createDiv({ text: t.noSavedLists, cls: "puyan-empty" });
      return;
    }
    this.state = {
      selected: this.preset ? this.preset.id : arr[0].id,
      title: "",
      startDate: todayLocal(),
      stepTotal: "",
      stepInterval: "",
      dateStep: "1",
      widgetBefore: false
    };
    this.headerEl = el.createEl("h2");
    this.bodyEl = el.createDiv();
    this.footerEl = el.createDiv({ cls: "puyan-wizard-footer" });
    this._bindEnter();
    this._renderStep();
  }

  _bindEnter() {
    const handler = (e) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      if (e.target && (e.target.tagName === "TEXTAREA" || e.target.classList.contains("puyan-stepper-input"))) return;
      e.preventDefault();
      if (this.step === 1) this._onContinue();
      else this._onCreate();
    };
    this.bodyEl.addEventListener("keydown", handler);
    this.footerEl.addEventListener("keydown", handler);
  }

  _currentPreset() {
    return (this.plugin.settings.savedChecklists || []).find(v => v.id === this.state.selected) || null;
  }
  _needsDate() {
    const preset = this._currentPreset();
    if (!preset || preset.type !== "step") return false;
    return /\{date\}/.test(preset.template || "");
  }

  _renderStep() {
    const t = this.t, p = this.plugin, arr = p.settings.savedChecklists || [];
    const preset = this._currentPreset();
    this.headerEl.textContent = this.step === 1 ? t.modalTitle : (preset ? preset.name : t.modalTitle);
    this.bodyEl.empty();
    this.footerEl.empty();

    if (this.step === 1) {
      if (!this.preset) {
        new Setting(this.bodyEl).setName(t.chooseList).addDropdown(x => {
          arr.forEach(v => x.addOption(v.id, v.name));
          x.setValue(this.state.selected).onChange(v => {
            this.state.selected = v;
            const pr = this._currentPreset();
            this.state.stepInterval = pr ? String(pr.interval || 10) : "";
            this.state.dateStep = String(pr?.dateStep || 1);
          });
        });
      } else {
        const row = new Setting(this.bodyEl).setName(t.chooseList);
        row.settingEl.createSpan({ text: this.preset.name, cls: "puyan-preset-name" });
      }
      new Setting(this.bodyEl).setName(t.activity)
        .addText(x => x.setValue(this.state.title).onChange(v => this.state.title = v));
      new Setting(this.bodyEl).setName(t.widgetBefore)
        .addToggle(x => x.setValue(this.state.widgetBefore).onChange(v => this.state.widgetBefore = v));

      const btn = this.footerEl.createEl("button", { cls: "mod-cta", text: t.continueBtn });
      btn.setAttribute("type", "button");
      btn.onclick = () => this._onContinue();
    } else {
      new Setting(this.bodyEl).setName(t.totalLabel).setDesc(t.totalDesc)
        .addText(x => x.setValue(this.state.stepTotal).onChange(v => this.state.stepTotal = v));
      new Setting(this.bodyEl).setName(t.intervalLabel).setDesc(t.intervalDesc)
        .addText(x => x.setValue(this.state.stepInterval).onChange(v => this.state.stepInterval = v));

      if (this._needsDate()) {
        const dateSetting = new Setting(this.bodyEl).setName(t.startDate).setDesc(t.startDateDesc);
        const ctrl = dateSetting.controlEl;
        const dateInput = ctrl.createEl("input", { type: "text", cls: "puyan-date-input" });
        dateInput.value = formatDate(this.state.startDate, p.settings, p.calApi);
        dateInput.placeholder = p.settings.calendar === "jalali" ? "1405/09/13" : "2026/12/04";
        dateInput.oninput = () => {
          const parsed = parseDateValue(dateInput.value, p.settings.calendar, p.calApi);
          if (parsed) this.state.startDate = parsed;
        };

        const pickBtn = ctrl.createEl("button", { cls: "puyan-date-pick" });
        pickBtn.setAttribute("type", "button");
        pickBtn.title = t.pickDate;
        pickBtn.setAttribute("aria-label", t.pickDate);
        calendarIcon(pickBtn);
        pickBtn.onclick = (e) => {
          e.preventDefault();
          new PopoverCalendar(pickBtn, p, this.state.startDate, (d) => {
            this.state.startDate = d;
            dateInput.value = formatDate(d, p.settings, p.calApi);
          });
        };

        const stepSetting = new Setting(this.bodyEl).setName(t.dateStepLabel).setDesc(t.dateStepDesc);
        const stepCtrl = stepSetting.controlEl;
        new CompactStepper(stepCtrl, {
          value: Number(this.state.dateStep) || 1,
          min: 1, max: 365, step: 1,
          outputDigits: p.settings.outputDigits,
          onChange: v => this.state.dateStep = String(v)
        });
      }

      const back = this.footerEl.createEl("button", { text: t.backBtn });
      back.setAttribute("type", "button");
      back.onclick = () => { this.step = 1; this._renderStep(); };
      const create = this.footerEl.createEl("button", { cls: "mod-cta", text: t.create });
      create.setAttribute("type", "button");
      create.onclick = () => this._onCreate();
    }
  }

  _onContinue() {
    const t = this.t;
    const preset = this._currentPreset();
    if (!preset) { new Notice(t.invalid); return; }
    if (preset.type === "fixed") { this._onCreate(); return; }
    this.state.stepTotal = "";
    this.state.stepInterval = String(preset.interval || 10);
    this.state.dateStep = String(preset.dateStep || 1);
    this.state.startDate = todayLocal();
    this.step = 2;
    this._renderStep();
  }

  _onCreate() {
    const t = this.t, p = this.plugin;
    const preset = this._currentPreset();
    if (!preset) { new Notice(t.invalid); return; }
    let entries = [];
    if (preset.type === "fixed") {
      entries = (preset.items || []).map((v, i) => ({ value: v, n: i + 1, total: preset.items.length }));
    } else {
      const total = Number(normalizeDigits(this.state.stepTotal));
      const interval = Number(normalizeDigits(this.state.stepInterval)) || Number(preset.interval) || 10;
      if (!Number.isInteger(total) || total < 1 || !Number.isInteger(interval) || interval < 1) {
        new Notice(t.invalid); return;
      }
      for (let n = interval; n < total; n += interval) entries.push({ n, total });
      entries.push({ n: total, total });
    }
    if (!entries.length) { new Notice(t.listEmpty); return; }

    let base = this.state.startDate instanceof Date && !isNaN(this.state.startDate.getTime())
      ? this.state.startDate : todayLocal();
    const stepDays = Math.max(1, Number(normalizeDigits(this.state.dateStep)) || 1);
    const hasDate = preset.type === "step" && /\{date\}/.test(preset.template || "");

    const lines = entries.map((v, i) => {
      const date = (hasDate || preset.type === "fixed")
        ? formatDate(new Date(base.getTime() + i * stepDays * 86400000), p.settings, p.calApi)
        : "";
      if (preset.type === "fixed") return "- [ ] " + v.value + (date ? " — " + date : "");
      return (preset.template || "- [ ] {n}")
        .replace(/\{n\}/g, displayDigits(v.n, p.settings.outputDigits))
        .replace(/\{total\}/g, displayDigits(v.total, p.settings.outputDigits))
        .replace(/\{title\}/g, this.state.title.trim())
        .replace(/\{date\}/g, date);
    });

    this.submit({
      title: this.state.title.trim(),
      lines,
      widgetBefore: this.state.widgetBefore
    });
    this.close();
  }

  onClose() { this.contentEl.empty(); }
}

/* ==================================================================== */
/* Settings tab                                                         */
/* ==================================================================== */
class PuyanSettings extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const el = this.containerEl, p = this.plugin, s = p.settings, t = TEXT[s.language];
    el.empty();
    el.setAttribute("dir", s.language === "fa" ? "rtl" : "ltr");
    el.createEl("h2", { text: t.settings });

    new Setting(el).setName(t.language).addDropdown(d => d
      .addOption("fa", t.fa).addOption("en", t.en).setValue(s.language)
      .onChange(async v => { s.language = v; await p.saveSettings(); p.refreshPresetCommands(); this.display(); }));

    if (s.calendar === "jalali" && !p.calApi.available) {
      el.createEl("p", { text: t.calendarPluginMissing, cls: "puyan-empty" });
    }

    el.createEl("h3", { text: s.language === "fa" ? "فیلدهای یادداشت (Frontmatter)" : "Frontmatter properties" });
    p.textSetting(el, t.startField, "startField", DEFAULT_SETTINGS.startField);
    p.textSetting(el, t.endField, "endField", DEFAULT_SETTINGS.endField);
    p.textSetting(el, t.durationField, "durationField", DEFAULT_SETTINGS.durationField);
    p.textSetting(el, t.progressField, "progressField", DEFAULT_SETTINGS.progressField);

    el.createEl("h3", { text: s.language === "fa" ? "تاریخ و نمایش" : "Dates and display" });
    new Setting(el).setName(t.calendar).addDropdown(d => d
      .addOption("jalali", t.jalali).addOption("gregorian", t.gregorian)
      .setValue(s.calendar).onChange(v => p.changeDateSettings("calendar", v)));
    new Setting(el).setName(t.dateFormat).addDropdown(d => d
      .addOption("numeric", t.numeric).addOption("long", t.long).addOption("iso", t.iso)
      .setValue(s.dateFormat).onChange(v => p.changeDateSettings("dateFormat", v)));
    new Setting(el).setName(t.outputDigits).addDropdown(d => d
      .addOption("fa", t.persianDigits).addOption("en", t.latinDigits)
      .setValue(s.outputDigits).onChange(async v => { s.outputDigits = v; await p.saveSettings(); p.refreshAll(); }));

    el.createEl("h3", { text: s.language === "fa" ? "نمایش ویجت" : "Widget display" });
    p.toggleSetting(el, t.saveProgress, "saveProgress");
    p.toggleSetting(el, t.countSubtasks, "countSubtasks");
    p.toggleSetting(el, t.showCounter, "showCounter");
    p.toggleSetting(el, t.showStartDate, "showStartDate");
    p.toggleSetting(el, t.showEndDate, "showEndDate");
    p.toggleSetting(el, t.showDuration, "showDuration");
    p.toggleSetting(el, t.showNoteTitle, "showNoteTitle");
    p.toggleSetting(el, t.showOpenButton, "showOpenButton");

    el.createEl("h3", { text: t.savedLists });
    const addRow = new Setting(el).setName(t.savedLists).setDesc(
      s.language === "fa"
        ? "قالب‌های ثابت و مرحله‌ای را ذخیره کنید و هنگام اجرای فرمان یکی را انتخاب کنید."
        : "Save fixed and step-based templates, then choose one when running the command."
    );
    addRow.addButton(b => b.setIcon("plus").setTooltip(t.addList)
      .onClick(() => new ChecklistPresetModal(this.app, p, null, () => this.display()).open()));

    (s.savedChecklists || []).forEach((preset, index) => {
      const row = new Setting(el).setName(preset.name).setDesc(
        preset.type === "fixed"
          ? (preset.items || []).join(", ")
          : (t.intervalLabel + ": " + String(preset.interval) + " · " + (preset.template || "- [ ] {n}"))
      );
      row.addButton(b => b.setIcon("pencil").setTooltip(t.editList)
        .onClick(() => new ChecklistPresetModal(this.app, p, preset, () => this.display()).open()));
      row.addButton(b => b.setIcon("trash").setTooltip(t.removeList)
        .onClick(async () => {
          p.settings.savedChecklists.splice(index, 1);
          await p.saveSettings();
          p.refreshPresetCommands();
          this.display();
        }));
    });
    this.addSupportSection(el, s.language === "fa");
  }

  addSupportSection(container, fa) {
    const t = TEXT[this.plugin.settings.language];
    const root = container.createDiv({ cls: "ot-support" });
    root.setAttribute("dir", fa ? "rtl" : "ltr");
    root.setAttribute("aria-label", t.supportAriaLabel);

    root.createEl("h3", { cls: "ot-contact-heading", text: t.supportHeading });
    root.createEl("p", { cls: "ot-contact-intro", text: t.supportIntro });

    const grid = root.createDiv({ cls: "ot-channel-grid" });
    const channels = [
      ["bale", fa ? "بله" : "Bale", "https://ble.ir/obsidiantut"],
      ["telegram", fa ? "تلگرام" : "Telegram", "https://t.me/obsidiantut"],
      ["youtube", fa ? "یوتیوب" : "YouTube", "https://youtube.com/@obsidiantut"]
    ];
    for (const [type, name, url] of channels) {
      const card = grid.createEl("a", { cls: "ot-channel" });
      card.href = url;
      card.setAttribute("target", "_blank");
      card.setAttribute("rel", "noopener noreferrer");
      card.setAttribute("aria-label", (fa ? "عضویت در کانال " : "Join our ") + name);
      const logoSpan = card.createSpan({ cls: "ot-channel-logo" });
      logo(logoSpan, type);
      card.createSpan({ cls: "ot-channel-name", text: name });
      const handle = card.createSpan({ cls: "ot-channel-handle", text: "@obsidiantut" });
      handle.setAttribute("dir", "ltr");
      card.createSpan({ cls: "ot-channel-join", text: t.supportChannelJoin });
    }

    const donate = root.createDiv({ cls: "ot-donation" });
    const sym = donate.createDiv({ cls: "ot-donation-symbol" });
    logo(sym, "heart");
    const copy = donate.createDiv({ cls: "ot-donation-copy" });
    copy.createEl("h4", { cls: "ot-donation-title", text: t.supportDonationTitle });
    copy.createEl("p", { cls: "ot-donation-desc", text: t.supportDonationDesc });
    const btn = donate.createEl("a", { cls: "ot-donation-button", text: t.supportDonateBtn });
    btn.href = "https://reymit.ir/singhaf9270";
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener noreferrer");
    btn.setAttribute("aria-label", t.supportDonateAria);
  }
}

/* ==================================================================== */
module.exports = class PuyanPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!Array.isArray(this.settings.savedChecklists)) this.settings.savedChecklists = DEFAULT_SETTINGS.savedChecklists;

    const hasDated = this.settings.savedChecklists.some(p => p.id === "stepsWithDates");
    if (!hasDated) {
      this.settings.savedChecklists.push(DEFAULT_SETTINGS.savedChecklists.find(p => p.id === "stepsWithDates"));
      await this.saveSettings();
    }
    let migrated = false;
    for (const preset of this.settings.savedChecklists) {
      if (preset && preset.type === "step") {
        if ("total" in preset) { delete preset.total; migrated = true; }
        if (!("dateStep" in preset)) { preset.dateStep = 1; migrated = true; }
      }
    }
    if (migrated) await this.saveSettings();

    this.views = new Map();
    this.updating = new Set();
    this.presetCommandIds = new Set();

    this.calApi = new CalendarApi(this.app);
    this.registerEvent(this.app.workspace.on("layout-ready", () => this.calApi._resolve()));

    this.registerMarkdownCodeBlockProcessor("puyan", async (source, el, ctx) => {
      const options = parseWidgetOptions(source);
      let target = ctx.sourcePath;
      if (options.note) {
        const link = resolveLinkTarget(options.note);
        const destination = this.app.metadataCache.getFirstLinkpathDest(link, ctx.sourcePath);
        if (destination) target = destination.path;
        else {
          el.addClass("puyan");
          el.createDiv({ cls: "puyan-empty", text: TEXT[this.settings.language].targetNotFound + options.note });
          return;
        }
      }
      const path = target;
      const view = { el, path, sourcePath: ctx.sourcePath, refresh: null };
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
    this.addCommand({
      id: "insert-progress-widget", name: t.commandInsert,
      editorCallback: editor => {
        const fence = String.fromCharCode(96).repeat(3);
        editor.replaceRange(fence + "puyan\n\n" + fence + "\n", editor.getCursor());
      }
    });
    this.addCommand({
      id: "create-checklist", name: t.commandChecklist,
      editorCallback: editor => {
        new ChecklistWizardModal(this.app, this, result => this._insertChecklist(editor, result)).open();
      }
    });

    this.refreshPresetCommands();
    this.addSettingTab(new PuyanSettings(this.app, this));
  }

  _insertChecklist(editor, result) {
    const fence = String.fromCharCode(96).repeat(3);
    const heading = result.title ? "## " + result.title + "\n\n" : "";
    const widget = fence + "puyan\n\n" + fence + "\n";
    const body = heading + result.lines.join("\n") + "\n";
    const insertion = result.widgetBefore ? widget + "\n" + body : body + "\n" + widget;
    editor.replaceRange(insertion, editor.getCursor());
  }

  refreshPresetCommands() {
    const t = TEXT[this.settings.language];
    if (this.presetCommandIds) {
      for (const id of this.presetCommandIds) {
        try { this.app.commands.removeCommand(id); } catch (_) {}
      }
    }
    this.presetCommandIds = new Set();
    for (const preset of (this.settings.savedChecklists || [])) {
      const id = "create-checklist-" + preset.id;
      this.addCommand({
        id,
        name: t.commandChecklistPrefix + " " + preset.name,
        editorCallback: editor => {
          new ChecklistWizardModal(this.app, this, result => this._insertChecklist(editor, result), preset).open();
        }
      });
      this.presetCommandIds.add(id);
    }
  }

  onunload() {
    this.views.clear();
    document.querySelectorAll(".puyan-cal-popover").forEach(n => n.remove());
  }
  async saveSettings() { await this.saveData(this.settings); }

  textSetting(container, label, key, fallback) {
    new Setting(container).setName(label).addText(input => input
      .setValue(this.settings[key])
      .onChange(async value => { this.settings[key] = value.trim() || fallback; await this.saveSettings(); }));
  }
  toggleSetting(container, label, key) {
    new Setting(container).setName(label).addToggle(toggle => toggle
      .setValue(this.settings[key])
      .onChange(async value => { this.settings[key] = value; await this.saveSettings(); this.refreshAll(); }));
  }
  refreshAll() {
    for (const set of this.views.values()) for (const view of set) view.refresh();
  }

  async changeDateSettings(key, value) {
    if (this.settings[key] === value) return;
    if (value === "jalali" && !this.calApi.available) {
      new Notice(TEXT[this.settings.language].calendarPluginMissing);
      return;
    }
    const old = { calendar: this.settings.calendar, dateFormat: this.settings.dateFormat };
    this.settings[key] = value;
    await this.saveSettings();
    let changed = 0, skipped = 0;
    const touchedPaths = new Set();
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
      if (!fm) continue;
      const fields = [this.settings.startField, this.settings.endField];
      const candidates = fields.filter(field => fm[field] !== undefined && fm[field] !== null && fm[field] !== "");
      if (!candidates.length) continue;
      touchedPaths.add(file.path);
      this.updating.add(file.path);
      try {
        await this.app.fileManager.processFrontMatter(file, front => {
          for (const field of candidates) {
            const parsed = parseDateValue(front[field], old.calendar, this.calApi);
            if (!parsed) { skipped++; continue; }
            const formatted = formatDate(parsed, this.settings, this.calApi);
            if (formatted && String(front[field]) !== formatted) { front[field] = formatted; changed++; }
          }
        });
      } catch (_) {}
    }
    window.setTimeout(() => { touchedPaths.forEach(p => this.updating.delete(p)); }, 500);
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
    const today = formatDate(new Date(), s, this.calApi);

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
        finally { window.setTimeout(() => this.updating.delete(file.path), 500); }
      }
    }

    const latest = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || fm;
    view.el.empty();
    view.el.addClass("puyan");
    view.el.setAttribute("dir", s.language === "fa" ? "rtl" : "ltr");
    if (!total) { view.el.createDiv({ cls: "puyan-empty", text: t.noTasks }); return; }

    if (s.showNoteTitle) view.el.createDiv({ cls: "puyan-note-title", text: "📄 " + file.basename });

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
    if (s.showCounter) header.createSpan({
      cls: "puyan-counter",
      text: displayDigits(done, s.outputDigits) + " / " + displayDigits(total, s.outputDigits) + " " + t.tasks
    });

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

    if (s.showCounter) {
      const stats = view.el.createDiv("puyan-stats");
      stats.createSpan({ text: displayDigits(done, s.outputDigits) + " " + t.completedTasks });
      stats.createSpan({ text: displayDigits(total - done, s.outputDigits) + " " + t.remaining });
    }

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

    if (s.showOpenButton) {
      const openBtn = view.el.createEl("button", { cls: "puyan-open-btn", text: t.openNote });
      openBtn.setAttribute("type", "button");
      openBtn.onclick = (e) => { e.preventDefault(); this.app.workspace.openLinkText(file.path, view.sourcePath, false); };
    }
  }

  durationInDays(start, end) {
    const a = parseDateValue(start, this.settings.calendar, this.calApi);
    const b = parseDateValue(end, this.settings.calendar, this.calApi);
    if (!a || !b) return null;
    return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
  }
};
/* nosourcemap */