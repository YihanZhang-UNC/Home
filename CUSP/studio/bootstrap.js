// Only the same-origin parent gallery can configure this viewer.
const embedded=document.documentElement.classList.contains('embedded');
const params=new URLSearchParams(location.search);
let configuration={language:params.get('lang')||'en',theme:params.get('theme')||'light',material:params.get('material')||'forest',visible:true};
function apply(){document.documentElement.dataset.theme=configuration.theme==='dark'?'dark':'light';window.cuspSetLanguage?.(configuration.language);if(window.cusp){if(['leather','forest','campus'].includes(configuration.material)&&window.cusp.getEdition()!==configuration.material)window.cusp.setColor(configuration.material);window.cusp.setVisible(configuration.visible!==false&&!document.hidden)}}
if(embedded){document.querySelector('.hint').textContent='拖动旋转 · 按钮或双指缩放';window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='cusp:configure')return;configuration={...configuration,...event.data};apply()})}
document.addEventListener('visibilitychange',apply);
try{await import('./studio-ui.js?v=20261002-3d');await import('./model.js?v=20261002-3d');apply();if(embedded)parent.postMessage({type:'cusp:ready'},location.origin)}catch(error){document.getElementById('loading').textContent=configuration.language==='zh'?'无法加载 3D 模型，请重新加载或使用支持 WebGL 的浏览器。':'Unable to load 3D. Reload or use a browser with WebGL support.';if(embedded)parent.postMessage({type:'cusp:error'},location.origin);console.error('CUSP 3D viewer:',error)}
