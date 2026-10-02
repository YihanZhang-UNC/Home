(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const C = window.CUSP_CONTENT;
  let language='en', material='leather', mode='basic';
  try {const saved=localStorage.getItem('cusp-site-language');if(saved==='zh')language='zh'} catch {}
  const check='<span class="icon icon-check" aria-hidden="true"></span>';
  const strings={en:{film:'CUSP / The 104-second brand film',studio:'CUSP / Interactive 3D Studio',image:'CUSP / Product concept',filmNote:'Concept film using existing AI-generated project media. Original classroom business figures are illustrative and have not been independently verified.',studioNote:'Interactive exterior concept. Dimensions, fit and engineering are not validated manufacturing specifications.'},zh:{film:'CUSP / 104 秒品牌短片',studio:'CUSP / 交互 3D 产品工作室',image:'CUSP / 产品外观概念',filmNote:'使用既有 AI 项目素材制作的概念影片。原片中的课堂业务数字为情境内容，未经独立核验。',studioNote:'交互外观概念；尺寸、适配与工程结构不代表已验证的量产规格。'}};
  const labels={leather:{en:'LEATHER / ORANGE',zh:'皮革 / 橙色',alt:'Orange leather CUSP concept with a silver body and two strap lengths'},forest:{en:'WEAVE / FOREST',zh:'织物 / 森林绿',alt:'Forest green woven CUSP concept with a silver body and two strap lengths'},campus:{en:'WEAVE / CAMPUS',zh:'织物 / 紫绿校园款',alt:'Purple-green campus woven CUSP concept with a silver body and two strap lengths'}};
  function renderMode(){
    const m=C.modes[mode][language];
    $('#mode-kicker').textContent=m.kicker;$('#mode-title').textContent=m.title;$('#mode-description').textContent=m.description;$('#mode-note').textContent=m.note;
    const list=$('#mode-list');list.replaceChildren();
    m.items.forEach(item=>{const li=document.createElement('li');li.innerHTML=check;const span=document.createElement('span');span.textContent=item;li.append(span);list.append(li)});
    $('#mode-image').src='assets/'+m.image;$('#mode-image').alt=m.alt;$('#mode-panel').setAttribute('aria-labelledby','tab-'+mode);
    $$('[data-mode]').forEach(button=>{const active=button.dataset.mode===mode;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1});
  }
  function applyLanguage(){
    document.documentElement.lang=language;document.title=language==='en'?'CUSP  -  A continuous personal story':'CUSP  -  持续理解同一个人';
    $$('[data-en][data-zh]').forEach(el=>el.textContent=el.dataset[language]);
    $('#language').innerHTML=language==='en'?'EN <span>/</span> 中文':'中文 <span>/</span> EN';
    $('#language').setAttribute('aria-label',language==='en'?'EN / 中文: switch to Chinese':'中文 / EN：切换为英文');
    $('#material-label').textContent=labels[material][language];renderMode();syncProduct3D();
  }
  $('#language').addEventListener('click',()=>{language=language==='en'?'zh':'en';applyLanguage();try{localStorage.setItem('cusp-site-language',language)}catch{}});
  $$('[data-material]').forEach(button=>button.addEventListener('click',()=>{
    material=button.dataset.material;$('#material-label').textContent=labels[material][language];syncProduct3D();
    $$('[data-material]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
  }));
  $$('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;renderMode()}));
  $('.mode-tabs').addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();mode=event.key==='Home'?'basic':event.key==='End'?'enhanced':mode==='basic'?'enhanced':'basic';renderMode();$('#tab-'+mode).focus()}});
  function setApp(button){
    $$('[data-app]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});
    $('#app-image').src=button.dataset.appImage||'assets/app-'+button.dataset.app+'.png';$('#app-panel').dataset.activeApp=button.dataset.app;$('#app-description').hidden=button.dataset.app!=='assistant';$('#app-image').alt=button.querySelector('strong').textContent+'  -  CUSP app prototype';$('#app-panel').setAttribute('aria-labelledby',button.id);
  }
  $$('[data-app]').forEach(button=>button.addEventListener('click',()=>setApp(button)));
  $('.app-selector').addEventListener('keydown',event=>{
    if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const buttons=$$('[data-app]');const index=buttons.indexOf(document.activeElement);if(index<0)return;event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(['ArrowUp','ArrowLeft'].includes(event.key)?-1:1)+buttons.length)%buttons.length;setApp(buttons[next]);buttons[next].focus();
  });
  const dialog=$('#media-dialog'), content=$('#dialog-content');let returnFocus=null;
  function openMedia(kind){
    returnFocus=document.activeElement;content.replaceChildren();$('#dialog-title').textContent=strings[language][kind];
    if(kind==='film'){const video=document.createElement('video');video.src='assets/cusp-brand-v6.mp4';video.controls=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label',strings[language].film);content.append(video);const note=document.createElement('p');note.className='dialog-note';note.textContent=strings[language].filmNote;content.append(note)}
    if(kind==='studio'){const frame=document.createElement('iframe');frame.src='studio/index.html?lang='+language+'&material='+material+'&theme='+document.documentElement.dataset.theme;frame.title='CUSP 3D Product Studio';content.append(frame);const note=document.createElement('p');note.className='dialog-note';note.textContent=strings[language].studioNote;content.append(note)}
    if(kind==='image'){const image=document.createElement('img');image.src='assets/'+material+'.jpg';image.alt=labels[material].alt;content.append(image)}
    dialog.showModal();$('#dialog-close').focus();
  }
  $$('[data-video]').forEach(button=>button.addEventListener('click',()=>openMedia('film')));$$('[data-studio]').forEach(button=>button.addEventListener('click',()=>openMedia('studio')));$('#expand-hardware').addEventListener('click',()=>openMedia('studio'));
  $('#dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
  dialog.addEventListener('close',()=>{const video=$('video',content);if(video){video.pause();video.removeAttribute('src');video.load()}content.replaceChildren();returnFocus?.focus()});
  $('#menu').addEventListener('click',()=>{const expanded=$('#menu').getAttribute('aria-expanded')==='true';$('#menu').setAttribute('aria-expanded',String(!expanded));$('#mobile-menu').hidden=expanded});
  $$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>{$('#mobile-menu').hidden=true;$('#menu').setAttribute('aria-expanded','false')}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#mobile-menu').hidden){$('#mobile-menu').hidden=true;$('#menu').setAttribute('aria-expanded','false');$('#menu').focus()}});
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('.site-header nav a').forEach(a=>a.classList.toggle('current',a.hash==='#'+entry.target.id))}})},{rootMargin:'-15% 0px -65% 0px'});['story','product','intelligence','community','future'].forEach(id=>observer.observe($('#'+id)))}
  $$('.embed-fullscreen').forEach(button=>{const target=$('#'+button.dataset.fullscreen);if(!target?.requestFullscreen){button.hidden=true;return;}button.addEventListener('click',()=>{target.requestFullscreen().catch(()=>{});});});
  let slidePage=1;
  function renderSlide(){const img=$('#slide-image');img.src='assets/slides/slide-'+String(slidePage).padStart(2,'0')+'.jpg';img.alt='CUSP presentation, slide '+slidePage+' of 60';$('#slide-page').value=String(slidePage);$('#slide-prev').disabled=slidePage===1;$('#slide-next').disabled=slidePage===60;}
  $('#slide-prev').addEventListener('click',()=>{slidePage=Math.max(1,slidePage-1);renderSlide();});
  $('#slide-next').addEventListener('click',()=>{slidePage=Math.min(60,slidePage+1);renderSlide();});
  $('#slide-page').addEventListener('change',event=>{slidePage=Number(event.target.value);renderSlide();});
  $('#canva-embed-shell').addEventListener('keydown',event=>{if(event.target.tagName==='SELECT'||$('#slide-preview').hidden||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();slidePage=Math.max(1,Math.min(60,slidePage+(event.key==='ArrowRight'?1:-1)));renderSlide();});
  $$('[data-slide-view]').forEach(button=>button.addEventListener('click',()=>{const live=button.dataset.slideView==='canva';const meta=$('.slide-meta [data-en]');meta.dataset.en=live?'LIVE PRESENTATION · CUSP':'60 SLIDES · OCT 1 SNAPSHOT';meta.dataset.zh=live?'原生演示 · CUSP':'60 页 · 10 月 1 日快照';meta.textContent=meta.dataset[language];$('#slide-preview').hidden=live;const iframe=$('#canva-slides');iframe.hidden=!live;if(live&&!iframe.hasAttribute('src'))iframe.src=iframe.dataset.src;$$('[data-slide-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){const reveal=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');reveal.unobserve(e.target)}})},{threshold:.12});$$('.section-heading,.story-grid,.hardware-gallery,.app-layout,.core-diagram,.community-grid,.business-cards,.roadmap-list,.team-grid').forEach(el=>{el.classList.add('reveal-ready');reveal.observe(el)})}
  $$('img').forEach(img=>img.addEventListener('error',()=>{if(img.closest('#cusp-landscape-23'))return;const note=document.createElement('p');note.className='media-error';note.textContent=language==='en'?'Image unavailable. Please refresh the page.':'图片暂不可用，请刷新页面。';img.after(note);img.hidden=true},{once:true}));
  $$('.embed-shell iframe').forEach(frame=>{const shell=frame.closest('.embed-shell');shell.classList.add('is-loading');shell.setAttribute('aria-busy','true');const finish=()=>{shell.classList.remove('is-loading');shell.setAttribute('aria-busy','false')};frame.addEventListener('load',finish,{once:true});frame.addEventListener('error',finish,{once:true});setTimeout(finish,12000)});
  const productFrame=$('#product-3d'), productStatus=$('#product-3d-status'), productError=$('#product-3d-error');
  let productVisible=false, productTimeout;
  function syncProduct3D(){if(productFrame.dataset.loaded)productFrame.contentWindow?.postMessage({type:'cusp:configure',material,language,theme:document.documentElement.dataset.theme,visible:productVisible&&!document.hidden&&!dialog.open},location.origin)}
  function loadProduct3D(){clearTimeout(productTimeout);productStatus.hidden=false;productError.hidden=true;productFrame.dataset.loaded='true';productFrame.src=productFrame.dataset.src+'&lang='+language+'&material='+material+'&theme='+document.documentElement.dataset.theme+'&v=20261002-rotate';productTimeout=setTimeout(()=>{productStatus.hidden=true;productError.hidden=false},30000)}
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==productFrame.contentWindow)return;if(event.data?.type==='cusp:ready'){clearTimeout(productTimeout);productStatus.hidden=true;productError.hidden=true;syncProduct3D()}else if(event.data?.type==='cusp:error'){clearTimeout(productTimeout);productStatus.hidden=true;productError.hidden=false}});
  $('#retry-product-3d').addEventListener('click',loadProduct3D);
  if('IntersectionObserver'in window){new IntersectionObserver(entries=>{productVisible=entries[0].isIntersecting;if(productVisible&&!productFrame.dataset.loaded)loadProduct3D();syncProduct3D()},{rootMargin:'200px 0px'}).observe(productFrame)}else{productVisible=true;loadProduct3D()}
  new MutationObserver(syncProduct3D).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  new MutationObserver(syncProduct3D).observe(dialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',syncProduct3D);
  renderSlide();applyLanguage();
})();
