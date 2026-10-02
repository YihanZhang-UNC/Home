import * as T from 'three';
import { buildLeatherStrap } from './leather-strap.js';
import { buildAdjustableStrap, closureSpec } from './adjustable-strap.js';

// Millimetres in the scene. Export root converts to metres for glTF.
const stage=document.querySelector('#stage');
const scene=new T.Scene();
const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;stage.prepend(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','可旋转的 CUSP 3D 模型。方向键旋转，加减键缩放。');
const camera=new T.PerspectiveCamera(34,1,.1,1200);camera.up.set(0,0,1);
scene.add(new T.HemisphereLight(0xffffff,0x8f8491,1.5));
const key=new T.DirectionalLight(0xfff5e7,2.2);key.position.set(-70,-90,150);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-90,right:90,top:100,bottom:-90,near:1,far:400});key.shadow.radius=4;key.shadow.bias=-.0002;key.shadow.normalBias=.25;scene.add(key);
const fill=new T.DirectionalLight(0xe2e7ff,1.2);fill.position.set(85,35,60);scene.add(fill);
const rim=new T.DirectionalLight(0xffffff,1.2);rim.position.set(-20,80,40);scene.add(rim);
const floor=new T.Mesh(new T.PlaneGeometry(600,600),new T.ShadowMaterial({color:0x544c43,opacity:.045}));floor.position.z=-28;floor.receiveShadow=true;scene.add(floor);
const product=new T.Group();product.name='CUSP_Wellness_Basic_Final_05';product.userData={status:'Final image collection revision 5; visual concept, not production CAD',units:'mm',bodyEnvelope:'36 x 24 x 5.5 mm excluding optical island; visual target only'};scene.add(product);
const base=new T.Group(),cap=new T.Group(),pcb=new T.Group(),battery=new T.Group(),strap=new T.Group(),connectors=new T.Group();
base.name='Skin_side_housing';cap.name='Top_cover';pcb.name='PCB_placeholder';battery.name='Battery_placeholder';strap.name='Textile_strap';connectors.name='Replaceable_band_rail_connectors';product.add(base,cap,pcb,battery,strap,connectors);
const mat=(color,roughness=.62,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const materials={shell:mat('#393b3b'),base:mat('#313434'),band:mat('#444443',.95),accent:mat('#b0a0c0',.48),logo:mat('#202323'),seam:mat('#202626'),window:mat('#101918',.19),gold:mat('#cbb77e',.3,.7),pcb:mat('#28473f'),battery:mat('#abaeb1',.4,.5),sensor:mat('#657876',.24,.35)};
const studio=document.createElement('canvas');studio.width=1024;studio.height=512;
const sc=studio.getContext('2d');const grad=sc.createLinearGradient(0,0,0,512);grad.addColorStop(0,'#f3f2f0');grad.addColorStop(.45,'#bbb6b0');grad.addColorStop(.6,'#56565a');grad.addColorStop(1,'#c8c3bc');sc.fillStyle=grad;sc.fillRect(0,0,1024,512);sc.fillStyle='#ffffff';sc.fillRect(100,30,100,310);sc.fillRect(510,70,240,210);sc.fillStyle='#22252b';sc.fillRect(340,0,60,480);sc.fillStyle='#fdfaf5';sc.fillRect(885,50,45,280);
const env=new T.CanvasTexture(studio);env.mapping=T.EquirectangularReflectionMapping;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(env).texture;env.dispose();pmrem.dispose();
materials.shell.roughness=.3;materials.shell.metalness=.8;materials.base.metalness=.85;materials.base.roughness=.23;materials.accent.metalness=1;materials.accent.roughness=.12;
materials.selvedge=mat('#9caec4',.88);materials.silicone=mat('#c77152',.7);
materials.edge=mat('#d4cfc6',.12,1);materials.liner=mat('#34343a',.9);materials.fabric=mat('#37363c',.96);
const parts=[];
function mesh(name,geo,material,parent,position=[0,0,0]){const m=new T.Mesh(geo,material);m.name=name;m.position.set(...position);m.castShadow=true;m.receiveShadow=true;parent.add(m);parts.push(m);return m;}
function outline(w,l,r){let s=new T.Shape(),x=-w/2,y=-l/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+l-r);s.quadraticCurveTo(x+w,y+l,x+w-r,y+l);s.lineTo(x+r,y+l);s.quadraticCurveTo(x,y+l,x,y+l-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function rounded(w,l,h,r,b=.4){const g=new T.ExtrudeGeometry(outline(w-2*b,l-2*b,Math.max(.1,r-b)),{depth:h-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:5,curveSegments:18,steps:1});g.translate(0,0,b);return g;}
mesh('Sealed_housing_lower_floor',rounded(25,38,.7,8,.18),materials.base,base,[0,0,18.5]);
mesh('Sealed_electronics_carrier',rounded(25,31,1.75,5,.3),materials.base,base,[0,0,19.15]);
mesh('Hidden_rail_upper_lip',rounded(25,38,.65,8,.18),materials.base,base,[0,0,20.85]);
// Open transverse rail channels live outside the sealed electronics carrier.
for(const side of [-1,1]){
 const railGroup=new T.Group();railGroup.name='Band_end_rail_'+side;railGroup.userData.side=side;connectors.add(railGroup);
 mesh('Captured_male_rail',rounded(17.2,3.0,1.15,.6,.15),materials.base,railGroup,[0,side*17.1,19.45]);
 mesh('Recessed_band_terminal',rounded(22,2.2,1.45,1,.2),materials.edge,railGroup,[0,side*19.05,19.3]);
 mesh('Rail_detent',rounded(1.5,.8,.3,.3,.08),materials.edge,railGroup,[0,side*16.8,19.25]);
 const release=mesh('Flush_underside_release_'+side,rounded(6,1.7,.25,.7,.08),materials.seam,base,[0,side*15.8,18.33]);
 mesh('Internal_release_plunger_'+side,rounded(2,1.3,.45,.4,.1),materials.edge,base,[0,side*15.8,18.8]);
}

mesh('Shell_parting_seam',rounded(24.8,37.8,.25,8,.08),materials.seam,base,[0,0,21.4]);
mesh('Polished_perimeter_chamfer',rounded(25,38,.48,8,.15),materials.edge,cap,[0,0,21.6]);
function pillow(){const rings=[[24.7,37.7,8,21.98],[24.8,37.8,8,23],[24.65,37.65,8,24.7],[24.1,37.1,7.8,26.1],[23.0,36.0,7.6,27.1],[21.4,34.4,7.3,27.7],[18,31,7,28.0]],pos=[],index=[];const pts=rings.map(([w,l,r,z])=>outline(w,l,r).getSpacedPoints(96).slice(0,96).map(v=>[v.x,v.y,z]));for(const row of pts)row.forEach(v=>pos.push(...v));for(let j=0;j<pts.length-1;j++)for(let k=0;k<96;k++){const a=j*96+k,b=j*96+(k+1)%96,c=a+96,d=b+96;index.push(a,b,c,b,d,c);}const center=pos.length/3;pos.push(0,0,28.01);for(let k=0;k<96;k++)index.push(center,(pts.length-1)*96+k,(pts.length-1)*96+(k+1)%96);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(index);g.computeVertexNormals();return g;}
mesh('Gently_crowned_top',pillow(),materials.shell,cap);
// Small geometric tone-on-tone CUSP wordmark, modeled as paths for portable GLB.
const glyphs=[[[1,1],[.2,1],[0,.8],[0,.2],[.2,0],[1,0]],[[0,1],[0,.2],[.2,0],[.8,0],[1,.2],[1,1]],[[1,1],[.1,1],[0,.85],[.1,.57],[.85,.43],[1,.16],[.85,0],[0,0]],[[0,0],[0,1],[.8,1],[1,.8],[1,.6],[.8,.5],[0,.5]]];
glyphs.forEach((path,i)=>{const pts=path.map(([x,y])=>new T.Vector3(.925-y*1.85,-3.95+i*2.15+x*1.45,28.02));mesh('CUSP_'+i,new T.TubeGeometry(new T.CatmullRomCurve3(pts,false,'centripetal'),40,.075,5,false),materials.logo,cap);});
mesh('Optical_contact_island',rounded(14,19,.8,4,.2),materials.base,base,[0,0,17.8]);
mesh('Optical_window',rounded(8,10,.24,2,.08),materials.window,base,[0,0,17.62]);
mesh('Photodiode_concept',rounded(2.3,2.8,.07,.35,.02),materials.sensor,base,[0,0,17.57]);
[-1,1].forEach(i=>{mesh('Optical_emitter_'+i,rounded(1.15,1.6,.08,.25,.02),mat('#254936',.35),base,[i*2.5,0,17.54]);const p=mesh('Charging_contact_'+i,new T.CylinderGeometry(.7,.7,.16,28),materials.gold,base,[i*2,-12,18.44]);p.rotation.x=Math.PI/2;});
// Hidden status dot, dark when idle, on the side wall.
const dot=mesh('Status_dot_unlit',new T.SphereGeometry(.33,16,8),materials.window,base,[12.46,-8,20]);dot.scale.x=.24;
mesh('PCB_volume_only',rounded(20,29,.8,3,.12),materials.pcb,pcb,[0,0,21.8]);
mesh('Battery_volume_only_capacity_unverified',rounded(17,23,3.7,2,.35),materials.battery,battery,[0,1,22.7]);
for(const [x,y,w,l]of[[-6,-10,4,4],[6,-9,3,5],[-6,8,4,3]])mesh('Component_placeholder',rounded(w,l,1,.4,.1),mat('#303238'),pcb,[x,y,22.6]);
// A small repeating normal texture encodes interlinked metal weave in exported GLB.
const size=128,heights=new Float32Array(size*size),normal=new Uint8Array(size*size*4);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){const xx=(x+(Math.floor(y/16)%2)*8)%16,yy=y%16;heights[y*size+x]=Math.sin(xx/16*Math.PI)*Math.sin(yy/16*Math.PI);}
for(let y=0;y<size;y++)for(let x=0;x<size;x++){const hx=heights[y*size+(x+1)%size]-heights[y*size+(x+size-1)%size],hy=heights[((y+1)%size)*size+x]-heights[((y+size-1)%size)*size+x];const v=new T.Vector3(-hx*2,-hy*2,1).normalize();normal.set([(v.x*.5+.5)*255,(v.y*.5+.5)*255,(v.z*.5+.5)*255,255],(y*size+x)*4);}
const weave=new T.DataTexture(normal,size,size,T.RGBAFormat);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(5,18);weave.needsUpdate=true;
materials.band.normalMap=weave;materials.band.normalScale.set(.85,.85);materials.band.roughness=.3;materials.band.metalness=.94;materials.band.side=T.DoubleSide;
materials.fabric.side=T.DoubleSide;materials.fabric.normalMap=weave;materials.fabric.normalScale.set(.35,.35);
function arcGeometry(width,ry,rz,thick,start,end,radial=0){const pos=[],uv=[],idx=[],N=Math.max(12,Math.ceil((end-start)*42)),M=12,row=M+1,offset=(N+1)*row;
for(let layer=0;layer<2;layer++)for(let j=0;j<=N;j++){const a=start+(end-start)*j/N;for(let k=0;k<=M;k++){const r=radial+layer*thick;const localWidth=(start<1&&end>5)?width-Math.max(0,width-22)*Math.exp(-Math.min(j,N-j)/7):width;pos.push(-localWidth/2+localWidth*k/M,(ry+r)*Math.sin(a),(rz+r)*Math.cos(a)-.25);uv.push(k/M,j/N*(end-start)/5);}}
for(let layer=0;layer<2;layer++)for(let j=0;j<N;j++)for(let k=0;k<M;k++){const a=layer*offset+j*row+k,b=a+1,c=a+row,d=c+1;if(layer)idx.push(a,c,b,b,c,d);else idx.push(a,b,c,b,d,c);}
for(let j=0;j<N;j++)for(const k of[0,M]){const a=j*row+k,b=a+row;idx.push(a,b,a+offset,b,b+offset,a+offset);}
for(const j of[0,N])for(let k=0;k<M;k++){const a=j*row+k;idx.push(a,a+offset,a+1,a+1,a+offset,a+offset+1);}
const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
let form='wrist',family='air',tone=new URLSearchParams(location.search).get('material')||'forest',lift=23,peel=0,closureState=null;
const palettes={air:{
forest:['#bdbbb2','#8c8c85','#334835','#b7b4a6','#545650','Forest / 森林绿织物'],
campus:['#c4c4c1','#939590','#452440','#c7a56b','#494b49','Campus / 紫绿条纹织物'],
leather:['#e0e1df','#aaaaa6','#bb521f','#d4d5d2','#4d4c49','Atelier / 橙色皮革']}};
const familyNames={air:'FOREST · 森林绿织物'};
const stripeCanvas=document.createElement('canvas');stripeCanvas.width=256;stripeCanvas.height=256;
const stripeCtx=stripeCanvas.getContext('2d');stripeCtx.fillStyle='#452440';stripeCtx.fillRect(0,0,256,256);stripeCtx.fillStyle='#52765b';stripeCtx.fillRect(91,0,74,256);
const stripe=new T.CanvasTexture(stripeCanvas);stripe.colorSpace=T.SRGBColorSpace;stripe.anisotropy=renderer.capabilities.getMaxAnisotropy();
const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=256;const gc=grainCanvas.getContext('2d');let seed=76;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const gd=gc.createImageData(256,256);for(let i=0;i<gd.data.length;i+=4){const n=110+rand()*45;gd.data.set([n,n,n,255],i);}gc.putImageData(gd,0,0);const grain=new T.CanvasTexture(grainCanvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(3,15);
// Subtle brushed-metal variation follows the top surface's object-space XY plane.
const top=cap.getObjectByName('Gently_crowned_top'),pos=top.geometry.attributes.position,uv=[];for(let i=0;i<pos.count;i++)uv.push(pos.getX(i)/25+.5,pos.getY(i)/38+.5);top.geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
const brushCanvas=document.createElement('canvas');brushCanvas.width=brushCanvas.height=512;const bc=brushCanvas.getContext('2d');bc.fillStyle='#888';bc.fillRect(0,0,512,512);for(let i=0;i<1800;i++){bc.strokeStyle=`rgba(${rand()>.5?'255,255,255':'0,0,0'},${.02+rand()*.06})`;bc.beginPath();bc.ellipse(256,256,10+i*.23,15+i*.34,0,0,Math.PI*2);bc.stroke();}const brush=new T.CanvasTexture(brushCanvas);
const schoolCanvas=document.createElement('canvas');schoolCanvas.width=1024;schoolCanvas.height=1024;const schoolCtx=schoolCanvas.getContext('2d');schoolCtx.fillStyle='#40423f';schoolCtx.textAlign='center';schoolCtx.font='42px Arial';schoolCtx.fillText('LEE KONG CHIAN',512,478);schoolCtx.font='31px Arial';schoolCtx.fillText('SCHOOL OF MEDICINE',512,538);const schoolTexture=new T.CanvasTexture(schoolCanvas);schoolTexture.colorSpace=T.SRGBColorSpace;
const school=new T.Mesh(new T.PlaneGeometry(19,19),new T.MeshStandardMaterial({map:schoolTexture,transparent:true,roughness:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));school.name='Campus_typography_crest_pending_vector';school.position.z=28.04;school.rotation.z=Math.PI/2;cap.add(school);
function setColor(name){
 if(!palettes.air[name])return;tone=name;const p=palettes.air[name],leather=name==='leather';
 ['shell','base','band','accent','logo'].forEach((k,i)=>materials[k].color.set(p[i]));materials.edge.color.set(p[3]);materials.liner.color.set(p[2]);materials.fabric.color.set(name==='campus'?'#ffffff':p[2]);materials.fabric.map=name==='campus'?stripe:null;materials.fabric.normalMap=leather?null:weave;materials.fabric.bumpMap=leather?grain:null;materials.fabric.bumpScale=.065;materials.fabric.roughness=leather?.53:.94;materials.fabric.needsUpdate=true;materials.selvedge.color.set(leather?'#753f24':p[2]);materials.shell.metalness=1;materials.shell.roughness=leather?.105:.3;materials.shell.bumpMap=leather?null:brush;materials.shell.bumpScale=.015;materials.shell.needsUpdate=true;materials.base.roughness=leather?.15:.32;materials.edge.roughness=leather?.12:.27;
 familyNames.air={forest:'FOREST · 森林绿织物',campus:'CAMPUS · 紫绿条纹织物',leather:'ATELIER · 橙色皮革'}[name];
 cap.children.filter(o=>o.name.startsWith('CUSP_')).forEach(o=>o.visible=name!=='campus');school.visible=name==='campus';
 document.querySelector('#colorName').textContent=p[5];document.querySelectorAll('[data-color]').forEach(b=>{b.classList.toggle('active',b.dataset.color===name);b.setAttribute('aria-pressed',b.dataset.color===name)});
 document.querySelector('#imageLink').href='../assets/'+name+'.jpg';document.querySelector('#referenceOpen').href='../assets/'+name+'.jpg';document.querySelector('#referenceImage').src='../assets/'+name+'.jpg';document.querySelector('#referenceImage').alt=p[5]+' 用户终稿';
 document.querySelector('#finishCopy').textContent=leather?'镜面银色本体 · 橙色皮革 · 银色针扣':name==='campus'?'拉丝银色本体 · 紫绿中线 · 香槟金扣具':'拉丝钛银本体 · 森林绿织带 · 暖银扣具';
 document.querySelector('#crestNote').hidden=name!=='campus';document.querySelector('#peel').disabled=leather;document.querySelector('#closureCopy').textContent=leather?'针扣穿孔调节，余带由套环收纳。孔距与强度待打样确认。':'穿环回折调节，带尾粘合收纳；滑杆展示掀起状态。';
 if(leather)peel=0;document.querySelector('#peel').value=peel*100;document.querySelector('#peelValue').textContent=Math.round(peel*100)+'%';
 buildBand();
}
function buildBand(){const arm=form==='arm',ry=arm?46:30,rz=arm?42:24,width=22,a0=Math.asin(18/ry),a1=2*Math.PI-a0;const endZ=rz*Math.cos(a0)-.25;lift=endZ-18.5*5.5/9.5;
for(const g of[base,cap,pcb,battery,connectors])g.scale.set(24/25,36/38,5.5/9.5);
while(strap.children.length){const m=strap.children[0];strap.remove(m);m.geometry?.dispose();}
const fabric=family==='mesh'?materials.band:family==='sport'?materials.silicone:materials.fabric;
if(family==='air')closureState=tone==='leather'?buildLeatherStrap(strap,materials,{ry,rz,a0,a1}):buildAdjustableStrap(strap,materials,{ry,rz,a0,a1,peel});
else mesh(familyNames[family],arcGeometry(width,ry,rz,1.25,a0,a1),fabric,strap);
if(family==='braid'){const lanes=arm?22:18;for(let i=0;i<lanes;i++){const pts=[];for(let j=0;j<=340;j++){const a=a0+(a1-a0)*j/340,fade=Math.sin(Math.PI*j/340),wave=a*36+(i%2)*Math.PI;const x=(-width/2+1+(width-2)*i/(lanes-1))*(1-(width-22)/width*Math.exp(-Math.min(j,340-j)/10))+.4*Math.sin(wave)*fade;const r=1.55+.22*Math.cos(wave);pts.push(new T.Vector3(x,(ry+r)*Math.sin(a),(rz+r)*Math.cos(a)-.25));}mesh('Interlaced_stretch_yarn_'+i,new T.TubeGeometry(new T.CatmullRomCurve3(pts),340,.42,6,false),materials.fabric,strap);}}
if(family==='mesh'){for(const side of[-1,1]){const pts=[];for(let j=0;j<=160;j++){const a=a0+(a1-a0)*j/160,w=width-Math.max(0,width-22)*Math.exp(-Math.min(j,160-j)/5);pts.push(new T.Vector3(side*(w/2-.3),(ry+.65)*Math.sin(a),(rz+.65)*Math.cos(a)-.25));}mesh('Soft_selvedge',new T.TubeGeometry(new T.CatmullRomCurve3(pts),200,family==='air'?.38:.22,8,false),family==='air'?materials.selvedge:materials.band,strap);}}
if(family!=='braid'&&family!=='air'){mesh('Low_profile_adjustment',rounded(width,8,1.5,1.6,.4),family==='mesh'?materials.base:fabric,strap,[0,-3,-rz-2.75]);}

if(family==='sport'){for(let j=0;j<6;j++){const a=2.1+j*.14;const m=mesh('Adjustment_recess_concept',new T.CylinderGeometry(.8,.8,.1,20),mat('#593627',.94),strap,[0,(ry+1.3)*Math.sin(a),(rz+1.3)*Math.cos(a)-.25]);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(0,Math.sin(a),Math.cos(a)));}}
// Band-specific terminations attach to the same captured rail, concealed below the top face.
floor.position.z=arm?-47:-28;document.querySelector('#dimensions').textContent='36 × 24 × 5.5 mm';document.querySelector('#bandWidth').textContent='22 mm';document.querySelector('#formCopy').textContent=familyNames[family]+' · '+(arm?'上臂长带':'手腕短带')+'，共用同一本体和隐藏换带接口。';document.querySelector('#familyName').textContent=familyNames[family];explode(explosion);view('hero');}
function setFamily(){family='air';document.querySelector('#colors').innerHTML=Object.entries(palettes.air).map(([k,p])=>`<button class="swatch" data-color="${k}" style="--color:${p[2]}" aria-label="${p[5]}"></button>`).join('');document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>setColor(b.dataset.color));setColor(tone);document.querySelectorAll('[data-form]').forEach(b=>(b.classList.toggle('active',b.dataset.form===form),b.setAttribute('aria-pressed',b.dataset.form===form)));}
function setForm(name){form=name;document.querySelectorAll('[data-form]').forEach(b=>(b.classList.toggle('active',b.dataset.form===form),b.setAttribute('aria-pressed',b.dataset.form===form)));buildBand();}
let phi=-.93,theta=.88,radius=156,target=new T.Vector3(0,0,2),automatic=false,explosion=0;
function explode(v){explosion=v;base.position.z=lift;connectors.position.z=lift;cap.position.z=lift+v*40;battery.position.z=lift+v*25;pcb.position.z=lift+v*12;pcb.visible=battery.visible=v>.015;document.querySelector('#explode').value=Math.round(v*100);document.querySelector('#explodeValue').textContent=Math.round(v*100)+'%';document.querySelector('#explodeQuick').value=Math.round(v*100);document.querySelector('#explodeQuickValue').textContent=Math.round(v*100)+'%';document.querySelector('#layerText').textContent=v>.05?'上盖 / 电池占位 / PCB 占位 / 贴肤底壳':familyNames[family]+' / 隐藏可替换接口';target.z=2+v*17;}
explode(0);
function view(name){const railView=name==='connector';strap.visible=!['sensor','connector'].includes(name);floor.visible=!['sensor','connector'].includes(name);cap.visible=!railView;for(const n of ['Shell_parting_seam','Hidden_rail_upper_lip'])base.getObjectByName(n).visible=!railView;pcb.visible=battery.visible=!railView&&explosion>.015;for(const g of connectors.children)g.position.x=railView?g.userData.side*23:0;automatic=false;document.querySelector('#rotate').textContent='自动旋转 · 关';const v={adjustment:[.15,1.62,125,0,tone==='leather'?'ATELIER / 针扣与调节孔':'织物 / 穿环回折调节'],hero:[-.93,.88,156,2,'日常佩戴形态'],top:[-Math.PI/2,.02,150,8,'无屏幕 · 克制的正面'],sensor:[-Math.PI/2,Math.PI-.12,125,12,'机芯贴肤面 · 已隐藏表带'],side:[0,Math.PI/2,158,0,'侧面 · 低矮的机身比例'],connector:[-1.0,.65,115,16,'连接件剖视 · 上轨唇暂时隐藏']}[name];[phi,theta,radius]=v;radius*=form==='arm'?1.6:1.15;if(name==='sensor')radius=78;if(name==='connector')radius=145;target.set(0,0,v[3]+explosion*17+(['sensor','connector'].includes(name)?lift:0));document.querySelector('#viewLabel').textContent=v[4];document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});}
document.querySelector('#peel').oninput=e=>{peel=+e.target.value/100;buildBand();view('adjustment');document.querySelector('#peelValue').textContent=Math.round(peel*100)+'%';};
document.querySelectorAll('[data-form]').forEach(b=>b.onclick=()=>setForm(b.dataset.form));document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));for(const id of ['explode','explodeQuick'])document.getElementById(id).oninput=e=>{if(document.querySelector('[data-view=connector].active,[data-view=sensor].active'))view('hero');explode(+e.target.value/100);};document.querySelector('#rotate').onclick=()=>{automatic=!automatic;document.querySelector('#rotate').textContent='自动旋转 · '+(automatic?'开':'关');};
document.querySelectorAll('[data-family]').forEach(b=>b.onclick=()=>setFamily(b.dataset.family));
const pointers=new Map();let lastPinch=0;renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});automatic=false;document.querySelector('#rotate').textContent='自动旋转 · 关';});
renderer.domElement.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;const dx=e.clientX-old.x,dy=e.clientY-old.y;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){phi-=dx*.008;theta=Math.max(.02,Math.min(Math.PI-.02,theta-dy*.008));}else{const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(lastPinch)radius=Math.max(80,Math.min(260,radius*lastPinch/d));lastPinch=d;}});for(const ev of['pointerup','pointercancel'])renderer.domElement.addEventListener(ev,e=>{pointers.delete(e.pointerId);lastPinch=0;});
renderer.domElement.addEventListener('wheel',e=>{if(document.documentElement.classList.contains('embedded')&&!e.ctrlKey)return;e.preventDefault();radius=Math.max(80,Math.min(280,radius*Math.exp(e.deltaY*.001)));},{passive:false});
function save(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function render(){camera.position.set(target.x+radius*Math.sin(theta)*Math.cos(phi),target.y+radius*Math.sin(theta)*Math.sin(phi),target.z+radius*Math.cos(theta));camera.lookAt(target);renderer.render(scene,camera);}
document.querySelector('#snapshot').onclick=()=>{render();renderer.domElement.toBlob(b=>save(b,'cusp-'+form+'-'+family+'-'+tone+'-view.png'));};
async function exportGLB(download=true){const clone=product.clone(true);clone.children.find(g=>g.name==='Textile_strap').visible=true;clone.children.find(g=>g.name==='Top_cover').visible=true;for(const n of ['Shell_parting_seam','Hidden_rail_upper_lip'])clone.getObjectByName(n).visible=true;for(const g of clone.children.find(g=>g.name==='Replaceable_band_rail_connectors').children)g.position.x=0;clone.scale.setScalar(.001);clone.rotation.x=-Math.PI/2;clone.updateMatrixWorld(true);const out=await new (await import('./GLTFExporter.js')).GLTFExporter().parseAsync(clone,{binary:true,onlyVisible:true});if(download)save(new Blob([out],{type:'model/gltf-binary'}),'cusp-'+form+'-'+family+'-'+tone+'.glb');return out;}
document.querySelector('#export').onclick=async()=>{const b=document.querySelector('#export');b.disabled=true;b.textContent='正在导出…';try{await exportGLB();}finally{b.disabled=false;b.textContent='导出 GLB';}};
function zoom(factor){radius=Math.max(80,Math.min(280,radius*factor));render();}
document.getElementById('zoomIn').onclick=()=>zoom(.85);document.getElementById('zoomOut').onclick=()=>zoom(1/.85);
renderer.domElement.addEventListener('keydown',event=>{const key=event.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(key))return;event.preventDefault();automatic=false;document.querySelector('#rotate').textContent='自动旋转 · 关';if(key==='ArrowLeft')phi+=.15;if(key==='ArrowRight')phi-=.15;if(key==='ArrowUp')theta=Math.max(.02,theta-.15);if(key==='ArrowDown')theta=Math.min(Math.PI-.02,theta+.15);if(key==='+'||key==='=')zoom(.85);if(key==='-')zoom(1/.85);render();});
new ResizeObserver(()=>{const {width,height}=stage.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}).observe(stage);
let last=performance.now();function animate(now){if(automatic)phi+=Math.min(now-last,100)*.00013;last=now;render();}renderer.setAnimationLoop(animate);
function setVisible(visible){renderer.setAnimationLoop(visible?animate:null);if(visible){last=performance.now();render();}}
setFamily('air');document.querySelector('#loading').hidden=true;
window.cusp={closureSpec,getClosure:()=>closureState,setPeel:v=>{peel=v;buildBand();view('adjustment');document.querySelector('#peel').value=Math.round(v*100);document.querySelector('#peelValue').textContent=Math.round(v*100)+'%'},setForm,setFamily,setColor,getEdition:()=>tone,setVisible,view,explode,exportGLB,render,renderer,scene,product,parts,ready:true};
