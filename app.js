const slides=[...document.querySelectorAll('.slide')];
const prevBtn=document.getElementById('prevBtn');
const nextBtn=document.getElementById('nextBtn');
const counter=document.getElementById('slideCounter');
const title=document.getElementById('slideTitle');
const bar=document.getElementById('progressBar');
const dotNav=document.getElementById('dotNav');
const toast=document.getElementById('toast');
let current=0;

function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),1800)}

slides.forEach((slide,index)=>{const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label',`前往第 ${index+1} 頁：${slide.dataset.title}`);dot.addEventListener('click',()=>goTo(index));dotNav.appendChild(dot)});

function goTo(index){current=Math.max(0,Math.min(slides.length-1,index));slides.forEach((slide,i)=>slide.classList.toggle('active',i===current));[...dotNav.children].forEach((dot,i)=>dot.classList.toggle('active',i===current));counter.textContent=`第 ${current+1} 頁／共 ${slides.length} 頁`;title.textContent=slides[current].dataset.title;bar.style.width=`${((current+1)/slides.length)*100}%`;prevBtn.disabled=current===0;nextBtn.disabled=current===slides.length-1;nextBtn.textContent=current===slides.length-2?'前往總結 →':'下一頁 →';document.querySelector('main').scrollIntoView({behavior:'smooth',block:'start'})}
prevBtn.addEventListener('click',()=>goTo(current-1));nextBtn.addEventListener('click',()=>goTo(current+1));
document.addEventListener('keydown',event=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;if(event.key==='ArrowRight'||event.key==='PageDown')goTo(current+1);if(event.key==='ArrowLeft'||event.key==='PageUp')goTo(current-1)});

document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const source=document.getElementById(button.dataset.copy);const text='value' in source?source.value:source.textContent;try{await navigator.clipboard.writeText(text.trim());button.classList.add('copied');button.textContent='已複製';showToast('已複製，可直接貼到 AI 工具');setTimeout(()=>{button.classList.remove('copied');button.textContent=button.dataset.copy==='narrationText'?'複製文字':'複製提示詞'},1500)}catch{showToast('無法自動複製，請長按文字選取')}}));

const narration=document.getElementById('narrationText');
function updateCount(){const count=narration.value.replace(/\s/g,'').length;document.getElementById('charCount').textContent=`${count} 字`;const hint=document.getElementById('lengthHint');hint.textContent=count<30?'稍短，可補充場景意義':count<=40?'長度適合 8 秒旁白':'稍長，建議刪減或延長畫面';hint.style.color=count>=30&&count<=40?'#277b4b':'#a55a26'}
narration.addEventListener('input',updateCount);updateCount();
document.getElementById('speakBtn').addEventListener('click',()=>{if(!('speechSynthesis'in window)){showToast('此瀏覽器不支援語音試聽');return}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(narration.value);utterance.lang='zh-TW';utterance.rate=.92;speechSynthesis.speak(utterance);showToast('正在試聽旁白')});

const progressInputs=[...document.querySelectorAll('[data-progress]')];
function updateCompletion(){const complete=progressInputs.filter(input=>input.checked).length;const percent=Math.round(complete/progressInputs.length*100);document.getElementById('completionPercent').textContent=`${percent}%`}
progressInputs.forEach(input=>{input.checked=localStorage.getItem(`ai-campus-${input.dataset.progress}`)==='1';input.addEventListener('change',()=>{localStorage.setItem(`ai-campus-${input.dataset.progress}`,input.checked?'1':'0');updateCompletion()})});updateCompletion();

const settingsDialog=document.getElementById('settingsDialog');
const schoolInput=document.getElementById('schoolInput');
const authorInput=document.getElementById('authorInput');
const dateInput=document.getElementById('dateInput');
const stored=JSON.parse(localStorage.getItem('ai-campus-settings')||'{}');
schoolInput.value=stored.school||'示範學校';authorInput.value=stored.author||'研習講師';dateInput.value=stored.date||'2026-11-12';
function formatDate(value){if(!value)return'日期待定';const [y,m,d]=value.split('-');return`${y} 年 ${Number(m)} 月 ${Number(d)} 日`}
function applySettings(){document.getElementById('coverSchool').textContent=schoolInput.value||'我的學校';document.getElementById('coverAuthor').textContent=authorInput.value||'研習講師';document.getElementById('coverDate').textContent=formatDate(dateInput.value);document.getElementById('posterSchool').textContent=schoolInput.value||'我的學校'}
applySettings();
document.getElementById('settingsBtn').addEventListener('click',()=>settingsDialog.showModal());
document.getElementById('saveSettingsBtn').addEventListener('click',()=>{localStorage.setItem('ai-campus-settings',JSON.stringify({school:schoolInput.value,author:authorInput.value,date:dateInput.value}));applySettings();showToast('研習設定已套用')});

document.getElementById('presentBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement){await document.documentElement.requestFullscreen();showToast('已進入簡報模式，按 Esc 可離開')}else await document.exitFullscreen()}catch{showToast('瀏覽器未允許全螢幕模式')}});
document.addEventListener('fullscreenchange',()=>document.getElementById('presentBtn').textContent=document.fullscreenElement?'離開全螢幕':'全螢幕簡報');

const nextAction=document.getElementById('nextAction');nextAction.value=localStorage.getItem('ai-campus-next-action')||'';
document.getElementById('saveActionBtn').addEventListener('click',()=>{localStorage.setItem('ai-campus-next-action',nextAction.value);showToast('行動計畫已儲存在此裝置')});
goTo(0);
