const MAIN_STORE_KEY = "hiroEnglishCoach.stable.v5";
const DASH_STORE_KEY = "hiroEnglishDashboard.v1";

function el(id){return document.getElementById(id)}
function text(id,v){if(el(id))el(id).innerText=v}
function html(id,v){if(el(id))el(id).innerHTML=v}
function val(id){return el(id)?el(id).value:""}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(msg){const t=el("toast"); if(!t)return; t.innerText=msg; t.style.display="block"; setTimeout(()=>t.style.display="none",2600)}

function readMainData(){
  try{return JSON.parse(localStorage.getItem(MAIN_STORE_KEY)||'{"sessions":[],"settings":{},"savedPhrases":[],"scriptArchive":[]}')}
  catch(e){return {sessions:[],settings:{},savedPhrases:[],scriptArchive:[]}}
}
function readDashData(){
  try{return JSON.parse(localStorage.getItem(DASH_STORE_KEY)||'{"feedbackLogs":[],"scriptTags":{}}')}
  catch(e){return {feedbackLogs:[],scriptTags:{}}}
}
function saveDashData(d){
  localStorage.setItem(DASH_STORE_KEY,JSON.stringify(d));
  refreshAll();
}
function dateKey(d){
  const x=new Date(d);
  if(isNaN(x.getTime()))return "";
  return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0");
}
function displayDate(d){
  const x=new Date(d);
  if(isNaN(x.getTime()))return "日付不明";
  return x.getFullYear()+"/"+String(x.getMonth()+1).padStart(2,"0")+"/"+String(x.getDate()).padStart(2,"0");
}
function todayKey(){return dateKey(new Date())}
function daysAgo(n){const d=new Date(); d.setDate(d.getDate()-n); return d}
function inLastDays(date,n){
  const d=new Date(date);
  if(isNaN(d.getTime()))return false;
  const from=daysAgo(n-1); from.setHours(0,0,0,0);
  return d>=from;
}
function tagsOf(id){
  const d=readDashData();
  return (d.scriptTags&&d.scriptTags[id])||[];
}
function setTags(id,tags){
  const d=readDashData();
  d.scriptTags=d.scriptTags||{};
  d.scriptTags[id]=tags.map(x=>x.trim()).filter(Boolean);
  saveDashData(d);
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    btn.classList.add("active");
    el(btn.dataset.target).classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
  });
});

function refreshOverview(){
  const m=readMainData();
  const today=todayKey();
  const todayScripts=(m.scriptArchive||[]).filter(x=>dateKey(x.date)===today);
  const todaySessions=(m.sessions||[]).filter(x=>dateKey(x.date)===today);
  const todayBest=todaySessions.length?Math.max(...todaySessions.map(x=>x.wpm||0)):0;

  const weekScripts=(m.scriptArchive||[]).filter(x=>inLastDays(x.date,7));
  const weekSessions=(m.sessions||[]).filter(x=>inLastDays(x.date,7));
  const weekBest=weekSessions.length?Math.max(...weekSessions.map(x=>x.wpm||0)):0;

  text("todayScripts",todayScripts.length);
  text("todaySessions",todaySessions.length);
  text("todayBest",todayBest);
  text("weekScripts",weekScripts.length);
  text("weekSessions",weekSessions.length);
  text("weekBest",weekBest);

  text("todaySummary",
    todayScripts.length
      ? "今日の保存スクリプトがあります。Daily Reviewで内容を確認できます。"
      : "今日の保存スクリプトはまだありません。本体アプリで作成・保存するとここに表示されます。"
  );
  text("weekSummary",
    `直近7日：スクリプト ${weekScripts.length}件，WPM記録 ${weekSessions.length}件，Best ${weekBest} WPM`
  );

  const actions=[];
  if(!todayScripts.length)actions.push("今日の英文スクリプトを1つ保存する");
  if(!todaySessions.length)actions.push("Conv. または Shadow でWPMを1回測定する");
  actions.push("保存済みスクリプトにタグを付ける");
  actions.push("Feedback Logに今日の気づきを1つ残す");
  html("nextActions",actions.map(a=>`<div class="item">✅ ${esc(a)}</div>`).join(""));
}

function renderDailyReview(){
  const m=readMainData();
  const d=readDashData();
  const today=todayKey();
  const scripts=(m.scriptArchive||[]).filter(x=>dateKey(x.date)===today);
  const sessions=(m.sessions||[]).filter(x=>dateKey(x.date)===today);
  const best=sessions.length?Math.max(...sessions.map(x=>x.wpm||0)):0;
  const feedback=(d.feedbackLogs||[]).filter(x=>dateKey(x.date)===today);

  let out=`<div class="metric">
    <div><b>${scripts.length}</b><span>Scripts</span></div>
    <div><b>${sessions.length}</b><span>WPM</span></div>
    <div><b>${best}</b><span>Best</span></div>
  </div>`;

  if(!scripts.length){
    out += `<div class="out">今日の保存スクリプトはまだありません。</div>`;
  }else{
    out += scripts.map(item=>`
      <div class="item">
        <div class="itemHead"><div class="title">${esc(item.title||"Untitled")}</div><div class="date">${esc(displayDate(item.date))}</div></div>
        <div class="bodyBlock"><b>English Script</b><br>${esc(item.script||"")}</div>
        <div class="bodyBlock"><b>Japanese Translation</b><br>${esc(item.translation||"")}</div>
      </div>
    `).join("");
  }

  out += `<h3>今日のFeedback</h3>`;
  out += feedback.length ? feedback.map(f=>`
    <div class="item"><div class="title">${esc(f.theme||"Untitled")}</div>
    <div class="preview">${esc(f.point||"")}</div></div>`).join("") : `<div class="out">今日のFeedbackはまだありません。</div>`;

  html("dailyReview",out);
}

function saveFeedback(){
  const d=readDashData();
  d.feedbackLogs=d.feedbackLogs||[];
  const tags=val("fbTags").split(",").map(x=>x.trim()).filter(Boolean);
  const item={
    id:String(Date.now())+"-"+Math.random().toString(36).slice(2),
    date:new Date().toISOString(),
    theme:val("fbTheme"),
    original:val("fbOriginal"),
    corrected:val("fbCorrected"),
    point:val("fbPoint"),
    tags:tags
  };
  d.feedbackLogs.unshift(item);
  localStorage.setItem(DASH_STORE_KEY,JSON.stringify(d));
  ["fbTheme","fbOriginal","fbCorrected","fbPoint","fbTags"].forEach(id=>{if(el(id))el(id).value=""});
  text("feedbackStatus","保存しました: "+(item.theme||"Untitled"));
  toast("Feedbackを保存しました");
  refreshAll();
}
function renderFeedback(){
  const d=readDashData();
  const q=val("feedbackSearch").toLowerCase();
  let logs=d.feedbackLogs||[];
  if(q)logs=logs.filter(x=>JSON.stringify(x).toLowerCase().includes(q));
  if(!logs.length){html("feedbackList",'<div class="out">Feedbackはまだありません。</div>');return}
  html("feedbackList",logs.map(f=>`
    <div class="item">
      <div class="itemHead">
        <div><div class="title">${esc(f.theme||"Untitled")}</div><div class="date">${esc(displayDate(f.date))}</div></div>
        <button class="danger deleteFeedback" data-id="${esc(f.id)}">削除</button>
      </div>
      <div class="bodyBlock"><b>Original</b><br>${esc(f.original||"")}</div>
      <div class="bodyBlock"><b>Better</b><br>${esc(f.corrected||"")}</div>
      <div class="bodyBlock"><b>Point</b><br>${esc(f.point||"")}</div>
      <div class="tagBar">${(f.tags||[]).map(t=>`<span class="tag">#${esc(t)}</span>`).join("")}</div>
    </div>
  `).join(""));
  document.querySelectorAll(".deleteFeedback").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const d=readDashData();
      d.feedbackLogs=(d.feedbackLogs||[]).filter(x=>x.id!==btn.dataset.id);
      saveDashData(d);
      toast("Feedbackを削除しました");
    });
  });
}

function renderWeekly(){
  const m=readMainData(), d=readDashData();
  const sessions=(m.sessions||[]).filter(x=>inLastDays(x.date,7));
  const scripts=(m.scriptArchive||[]).filter(x=>inLastDays(x.date,7));
  const feedback=(d.feedbackLogs||[]).filter(x=>inLastDays(x.date,7));
  const wpms=sessions.map(x=>x.wpm||0).filter(Boolean);
  const best=wpms.length?Math.max(...wpms):0;
  const avg=wpms.length?Math.round(wpms.reduce((a,b)=>a+b,0)/wpms.length):0;

  const tagCount={};
  scripts.forEach(s=>tagsOf(s.id).forEach(t=>tagCount[t]=(tagCount[t]||0)+1));
  feedback.forEach(f=>(f.tags||[]).forEach(t=>tagCount[t]=(tagCount[t]||0)+1));
  const tags=Object.entries(tagCount).sort((a,b)=>b[1]-a[1]).slice(0,8);

  html("weeklyReport",`
    <div class="metric">
      <div><b>${scripts.length}</b><span>Scripts</span></div>
      <div><b>${sessions.length}</b><span>Sessions</span></div>
      <div><b>${best}</b><span>Best WPM</span></div>
    </div>
    <div class="out">平均WPM: ${avg}
Feedback: ${feedback.length}件
よく使ったタグ: ${tags.length?tags.map(x=>"#"+x[0]+"("+x[1]+")").join("，"):"まだありません"}

来週のおすすめ:
- 保存済みScriptを1つ選んで再シャドーイング
- Feedback Logから苦手表現を1つ選んで言い直し
- タグが少ないテーマを1つ選んで話す</div>
  `);
}

const THEME_POOL=[
  ["子ども","My child did something new today.","子どもの成長や大変だったことを話す"],
  ["仕事","I worked from home today.","在宅勤務・会議・集中できたことを話す"],
  ["天気","A typhoon is approaching our area.","天気や予定変更について話す"],
  ["英語学習","I want to improve my speaking skills.","英語学習の目標や悩みを話す"],
  ["旅行","I want to visit a new place with my family.","旅行したい場所や準備を話す"],
  ["ガジェット","I recently used a new device.","イヤホン・スマホ・アプリの感想を話す"],
  ["健康","I felt a little tired today.","体調や生活リズムについて話す"],
  ["うれしかったこと","Something made me happy today.","小さな成功や良かった出来事を話す"]
];
function suggestThemes(){
  const picks=[...THEME_POOL].sort(()=>Math.random()-0.5).slice(0,5);
  html("themeIdeas",picks.map(p=>`
    <div class="item">
      <div class="title">#${esc(p[0])}</div>
      <div class="preview"><b>Starter:</b> ${esc(p[1])}<br>${esc(p[2])}</div>
    </div>
  `).join(""));
  const prompt="以下のテーマ候補から1つ選んで，TOEIC700程度の英語スピーキング練習用スクリプトを作ってください。\n\n"+
    picks.map((p,i)=>`${i+1}. ${p[0]} - ${p[2]}`).join("\n");
  text("themePromptBox",prompt);
}
async function copyThemePrompt(){
  const t=el("themePromptBox").innerText;
  if(!t){toast("先にテーマを提案してください");return}
  try{await navigator.clipboard.writeText(t);toast("テーマ用プロンプトをコピーしました")}
  catch(e){toast("コピーできませんでした")}
}

function allTags(){
  const m=readMainData();
  const set=new Set();
  (m.scriptArchive||[]).forEach(a=>tagsOf(a.id).forEach(t=>set.add(t)));
  return [...set].sort();
}
function renderSearch(){
  const m=readMainData();
  const q=val("archiveSearch").toLowerCase();
  const selected=[...document.querySelectorAll(".tag.active")].map(x=>x.dataset.tag);
  const tags=allTags();
  html("tagFilter",tags.map(t=>`<button class="tag ${selected.includes(t)?"active":""}" data-tag="${esc(t)}">#${esc(t)}</button>`).join(""));
  document.querySelectorAll("#tagFilter .tag").forEach(btn=>{
    btn.addEventListener("click",()=>{btn.classList.toggle("active");renderSearch()});
  });

  let list=m.scriptArchive||[];
  if(q)list=list.filter(x=>((x.title||"")+" "+(x.script||"")+" "+(x.translation||"")+" "+tagsOf(x.id).join(" ")).toLowerCase().includes(q));
  if(selected.length)list=list.filter(x=>selected.every(t=>tagsOf(x.id).includes(t)));

  if(!list.length){html("archiveSearchList",'<div class="out">保存済みスクリプトが見つかりません。</div>');return}
  html("archiveSearchList",list.map(item=>{
    const tg=tagsOf(item.id);
    return `<div class="item">
      <div class="itemHead"><div><div class="title">${esc(item.title||"Untitled")}</div><div class="date">${esc(displayDate(item.date))}</div></div></div>
      <div class="preview">${esc((item.script||"").replace(/\s+/g," ").slice(0,140))}</div>
      <div class="tagBar">${tg.map(t=>`<span class="tag">#${esc(t)}</span>`).join("")}</div>
      <label>タグ編集（カンマ区切り）</label>
      <input class="tagInput" data-id="${esc(item.id)}" value="${esc(tg.join(", "))}">
      <div class="row"><button class="secondary saveTags" data-id="${esc(item.id)}">タグ保存</button></div>
    </div>`;
  }).join(""));
  document.querySelectorAll(".saveTags").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const input=document.querySelector('.tagInput[data-id="'+btn.dataset.id+'"]');
      setTags(btn.dataset.id,(input.value||"").split(","));
      toast("タグを保存しました");
    });
  });
}

function exportDashboard(){
  const data=readDashData();
  el("dashboardDataBox").value=JSON.stringify(data,null,2);
  text("settingsStatus","Dashboard専用データを出力しました。");
}
function importDashboard(){
  try{
    const data=JSON.parse(val("dashboardDataBox"));
    localStorage.setItem(DASH_STORE_KEY,JSON.stringify(data));
    text("settingsStatus","Dashboard専用データを取り込みました。");
    toast("Dashboardデータを取り込みました");
    refreshAll();
  }catch(e){
    text("settingsStatus","取り込みエラー: "+e.message);
  }
}
function renderStatus(){
  const m=readMainData(), d=readDashData();
  text("dataStatus",`既存アプリデータ読取:
Scripts: ${(m.scriptArchive||[]).length}
WPM sessions: ${(m.sessions||[]).length}
Cards: ${(m.savedPhrases||[]).length}

Dashboard専用データ:
Feedback: ${(d.feedbackLogs||[]).length}
Tag records: ${Object.keys(d.scriptTags||{}).length}`);
}

function refreshAll(){
  refreshOverview();
  renderDailyReview();
  renderFeedback();
  renderWeekly();
  renderSearch();
  renderStatus();
}

el("saveFeedback").addEventListener("click",saveFeedback);
el("feedbackSearch").addEventListener("input",renderFeedback);
el("suggestThemes").addEventListener("click",suggestThemes);
el("copyThemePrompt").addEventListener("click",copyThemePrompt);
el("archiveSearch").addEventListener("input",renderSearch);
el("clearSearch").addEventListener("click",()=>{el("archiveSearch").value="";renderSearch()});
el("exportDashboard").addEventListener("click",exportDashboard);
el("importDashboard").addEventListener("click",importDashboard);

refreshAll();
suggestThemes();
