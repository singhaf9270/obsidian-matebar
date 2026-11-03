const { Plugin, PluginSettingTab, Setting, Modal, Notice } = require("obsidian");
const DEFAULT_SETTINGS = { startField: "شروع", endField: "پایان", progressField: "پیشرفت", calendar: "jalali", dateFormat: "numeric", saveProgress: true, countSubtasks: true };
function digits(v) { return String(v).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)); }
function dateText(date, calendar, format) {
  if (calendar === "jalali") {
    const p = new Intl.DateTimeFormat("en-US-u-ca-persian", {year:"numeric",month:"numeric",day:"numeric"}).formatToParts(date);
    const get = t => Number(p.find(x => x.type === t)?.value || 0), y=get("year"), m=get("month"), d=get("day");
    if (format === "iso") return y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0");
    if (format === "long") return d+" "+new Intl.DateTimeFormat("fa-IR-u-ca-persian",{month:"long"}).format(date)+" "+y;
    return y+"/"+String(m).padStart(2,"0")+"/"+String(d).padStart(2,"0");
  }
  if (format === "iso") return date.toISOString().slice(0,10);
  if (format === "long") return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric"}).format(date);
  return new Intl.DateTimeFormat("en-CA").format(date).replace(/-/g,"/");
}
function readTasks(content, countSubtasks) {
  const tasks=[]; let parentIndent=null;
  for (const line of content.split(/\r?\n/)) {
    const m=line.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+.+$/); if(!m) continue;
    const indent=m[1].replace(/\t/g,"    ").length;
    if(!countSubtasks && parentIndent!==null && indent>parentIndent) continue;
    if(!countSubtasks) parentIndent=indent;
    tasks.push(m[2].toLowerCase()==="x");
  }
  return tasks;
}
class ChecklistModal extends Modal {
  constructor(app, submit){super(app);this.submit=submit;}
  onOpen(){
    const el=this.contentEl;el.addClass("matebar-modal");el.createEl("h2",{text:"ساخت چک‌لیست مرحله‌ای"});
    let title="",total="100",step="10";
    new Setting(el).setName("عنوان فعالیت").addText(t=>t.setPlaceholder("مثلاً مطالعه کتاب").onChange(v=>title=v));
    new Setting(el).setName("مقدار کل").setDesc("تعداد صفحات، فصل‌ها یا مراحل").addText(t=>t.setValue(total).onChange(v=>total=v));
    new Setting(el).setName("فاصله مراحل").addText(t=>t.setValue(step).onChange(v=>step=v));
    new Setting(el).addButton(b=>b.setButtonText("ساخت چک‌لیست").setCta().onClick(()=>{
      const n=Number(digits(total)),s=Number(digits(step));
      if(!title.trim()||!Number.isInteger(n)||!Number.isInteger(s)||n<1||s<1){new Notice("اطلاعات واردشده معتبر نیست.");return;}
      this.submit(title.trim(),n,s);this.close();
    }));
  }
  onClose(){this.contentEl.empty();}
}
class MatebarSettings extends PluginSettingTab {
  constructor(app,plugin){super(app,plugin);this.plugin=plugin;}
  display(){
    const el=this.containerEl,p=this.plugin;el.empty();el.createEl("h2",{text:"تنظیمات Matebar"});
    new Setting(el).setName("فیلد تاریخ شروع").addText(t=>t.setValue(p.settings.startField).onChange(async v=>{p.settings.startField=v.trim()||DEFAULT_SETTINGS.startField;await p.saveSettings();}));
    new Setting(el).setName("فیلد تاریخ پایان").addText(t=>t.setValue(p.settings.endField).onChange(async v=>{p.settings.endField=v.trim()||DEFAULT_SETTINGS.endField;await p.saveSettings();}));
    new Setting(el).setName("فیلد درصد پیشرفت").addText(t=>t.setValue(p.settings.progressField).onChange(async v=>{p.settings.progressField=v.trim()||DEFAULT_SETTINGS.progressField;await p.saveSettings();}));
    new Setting(el).setName("تقویم").addDropdown(d=>d.addOption("jalali","شمسی").addOption("gregorian","میلادی").setValue(p.settings.calendar).onChange(async v=>{p.settings.calendar=v;await p.saveSettings();}));
    new Setting(el).setName("قالب تاریخ").addDropdown(d=>d.addOption("numeric","عددی").addOption("long","نام ماه").addOption("iso","ISO").setValue(p.settings.dateFormat).onChange(async v=>{p.settings.dateFormat=v;await p.saveSettings();}));
    new Setting(el).setName("ذخیره درصد در Frontmatter").addToggle(t=>t.setValue(p.settings.saveProgress).onChange(async v=>{p.settings.saveProgress=v;await p.saveSettings();}));
    new Setting(el).setName("شمارش زیرتسک‌ها").addToggle(t=>t.setValue(p.settings.countSubtasks).onChange(async v=>{p.settings.countSubtasks=v;await p.saveSettings();}));
  }
}
module.exports = class MatebarPlugin extends Plugin {
  async onload(){
    this.settings=Object.assign({},DEFAULT_SETTINGS,await this.loadData());this.views=new Map();this.updating=new Set();
    this.registerMarkdownCodeBlockProcessor("matebar",async(source,el,ctx)=>{
      const path=ctx.sourcePath,view={el,path,refresh:null};view.refresh=()=>this.renderWidget(view);
      if(!this.views.has(path))this.views.set(path,new Set());this.views.get(path).add(view);
      ctx.addChild({onunload:()=>{const set=this.views.get(path);if(set){set.delete(view);if(!set.size)this.views.delete(path);}}});
      await this.renderWidget(view);
    });
    this.registerEvent(this.app.vault.on("modify",file=>{
      if(!file||this.updating.has(file.path))return;
      const set=this.views.get(file.path);if(set)for(const view of set)view.refresh();
    }));
    this.addCommand({id:"insert-progress-widget",name:"درج ویجت پیشرفت",editorCallback:editor=>{
      const tick=String.fromCharCode(96).repeat(3);editor.replaceRange(tick+"matebar\n\n"+tick+"\n",editor.getCursor());
    }});
    this.addCommand({id:"create-checklist",name:"ساخت چک‌لیست مرحله‌ای",editorCallback:editor=>{
      new ChecklistModal(this.app,(title,total,interval)=>{
        const steps=[];for(let n=interval;n<total;n+=interval)steps.push(n);steps.push(total);
        const output="## "+title+"\n\n"+steps.map(n=>"- [ ] "+title+" — "+n+" از "+total).join("\n")+"\n";
        editor.replaceRange(output,editor.getCursor());
      }).open();
    }});
    this.addSettingTab(new MatebarSettings(this.app,this));
  }
  onunload(){this.views.clear();}
  async saveSettings(){await this.saveData(this.settings);}
  async renderWidget(view){
    const file=this.app.vault.getAbstractFileByPath(view.path);if(!file)return;
    const content=await this.app.vault.cachedRead(file),tasks=readTasks(content,this.settings.countSubtasks);
    const total=tasks.length,done=tasks.filter(Boolean).length,percent=total?Math.round(done/total*100):0;
    const fm=(this.app.metadataCache.getFileCache(file)||{}).frontmatter||{};
    const sk=this.settings.startField,ek=this.settings.endField,pk=this.settings.progressField;
    const today=dateText(new Date(),this.settings.calendar,this.settings.dateFormat);
    if(total){
      const started=done>0,completed=done===total;
      const change=(started&&!fm[sk])||(completed&&!fm[ek])||(!completed&&!!fm[ek])||(!started&&!!fm[sk])||(this.settings.saveProgress&&Number(fm[pk])!==percent);
      if(change&&!this.updating.has(file.path)){
        this.updating.add(file.path);
        try{await this.app.fileManager.processFrontMatter(file,front=>{
          if(started&&!front[sk])front[sk]=today;if(completed&&!front[ek])front[ek]=today;
          if(!completed)delete front[ek];if(!started){delete front[sk];delete front[ek];}
          if(this.settings.saveProgress)front[pk]=percent;
        });}catch(e){console.error("Matebar frontmatter update failed",e);}
        finally{window.setTimeout(()=>this.updating.delete(file.path),150);}
      }
    }
    const latest=(this.app.metadataCache.getFileCache(file)||{}).frontmatter||fm;
    view.el.empty();view.el.addClass("matebar");
    if(!total){view.el.createDiv({cls:"matebar-empty",text:"برای نمایش پیشرفت، ابتدا در این یادداشت چند تسک بسازید."});return;}
    const header=view.el.createDiv("matebar-header");
    header.createDiv({cls:"matebar-title",text:"پیشرفت فعالیت"});
    header.createDiv({cls:"matebar-percent",text:percent.toLocaleString("fa-IR")+"٪"});
    const track=view.el.createDiv("matebar-track");track.createDiv("matebar-fill").style.width=percent+"%";
    const stats=view.el.createDiv("matebar-stats");
    stats.createSpan({text:done.toLocaleString("fa-IR")+" از "+total.toLocaleString("fa-IR")+" تسک انجام‌شده"});
    stats.createSpan({text:(total-done).toLocaleString("fa-IR")+" باقی‌مانده"});
    const dates=view.el.createDiv("matebar-dates");
    if(latest[sk])dates.createSpan({text:"شروع: "+latest[sk]});if(latest[ek])dates.createSpan({text:"پایان: "+latest[ek]});
    if(percent===100)view.el.createDiv({cls:"matebar-complete",text:"این فعالیت تکمیل شده است."});
  }
};