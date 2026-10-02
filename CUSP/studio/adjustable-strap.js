import * as T from 'three';

// Dimensioned topology study, not deformable-body/contact simulation. Units mm.
export const closureSpec={width:22,webThickness:1.0,guideInnerWidth:23.2,guideInnerHeight:3.2,guideRod:1.2,tailReturn:60,hookWidth:18,hookLength:40};
export function buildAdjustableStrap(parent,materials,{ry,rz,a0,a1,peel=0}){
  const meshes=[];
  const add=(name,g,m)=>{const o=new T.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);meshes.push(o);return o;};
  const at=(a,r=0)=>new T.Vector3(0,(ry+r)*Math.sin(a),(rz+r)*Math.cos(a)-.25);
  const ag=1.48,guide=at(ag,2.65),tangent=new T.Vector3(0,ry*Math.cos(ag),-rz*Math.sin(ag)).normalize(),normal=new T.Vector3(0,-tangent.z,tangent.y);
  const local=(s,n)=>guide.clone().addScaledVector(tangent,s).addScaledVector(normal,n);
  const ribbon=(name,points,width,thickness,material)=>{
    const p=[],idx=[],uv=[],N=points.length;
    for(let j=0;j<N;j++){
      const d=points[Math.min(N-1,j+1)].clone().sub(points[Math.max(0,j-1)]).normalize();
      const n=new T.Vector3(0,-d.z,d.y);
      for(const side of [-1,1])for(const x of [-width/2,width/2]){const q=points[j].clone().addScaledVector(n,side*thickness/2);p.push(x,q.y,q.z);uv.push(x/width+.5,j/(N-1));}
    }
    for(let j=0;j<N-1;j++)for(const [a,b] of [[0,1],[1,3],[3,2],[2,0]]){const q=j*4;idx.push(q+a,q+b,q+4+a,q+b,q+4+b,q+4+a);}
    idx.push(0,2,1,1,2,3);const e=(N-1)*4;idx.push(e,e+1,e+2,e+1,e+3,e+2);
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return add(name,g,material);
  };
  const arc=(start,end,r)=>Array.from({length:130},(_,i)=>at(start+(end-start)*i/129,r));
  // Guide lies in the x / normal plane. Main web passes through its opening,
  // turns around its outer crossbar and returns over the web's OUTER surface.
  const guidePoints=[];const w=23.2/2+.6,h=3.2/2+.6;
  for(const [x,n] of [[-w,-h],[w,-h],[w,h],[-w,h],[-w,-h]])guidePoints.push(local(0,n).add(new T.Vector3(x,0,0)));
  // Straight bars preserve a measurable clear aperture; small edge radius from tube.
  const line=new T.CurvePath();for(let i=1;i<guidePoints.length;i++)line.add(new T.LineCurve3(guidePoints[i-1],guidePoints[i]));
  const ring=add('Guide_loop_23p2_clear_width',new T.TubeGeometry(line,120,.6,10,false),materials.edge);
  ring.userData={innerWidth:23.2,innerHeight:3.2,requiresEdgeFinishing:true};
  const anchor=arc(a0,ag-.17,.5);anchor.push(local(-2,-3.4),local(0,-3.4));
  for(let i=1;i<=24;i++){const u=Math.PI*i/24;anchor.push(local(1.2*Math.sin(u),-2.2-1.2*Math.cos(u)));}
  anchor.push(...arc(ag-.08,ag-.4,1.8));
  ribbon('Fixed_anchor_wrapped_and_sewn_to_guide',anchor,22,1,materials.fabric);
  const main=arc(a1,ag+.15,.5);main.push(local(2.5,0),local(0,0));
  // 180-degree turn has 2.2 mm centerline bend radius around outer crossbar.
  for(let i=1;i<=32;i++){const u=Math.PI*i/32;main.push(local(-2.2*Math.sin(u),2.2-2.2*Math.cos(u)));}
  const ae=Math.min(a1-.25,ag+60/((ry+rz)/2));
  const ret=Array.from({length:130},(_,i)=>at(ag+.08+(ae-ag-.08)*i/129,1.95+3.45*Math.exp(-i/8)));
  for(let i=0;i<ret.length;i++){const f=Math.max(0,(i/(ret.length-1)-.6)/.4);ret[i].addScaledVector(normal,peel*11*f*f);}
  main.push(...ret);ribbon('Continuous_main_web_through_guide_and_foldback',main,22,1,materials.fabric);
  const hooks=ret.slice(Math.floor(ret.length*.22),Math.floor(ret.length*.88)).map(p=>p.clone().addScaledVector(new T.Vector3(0,p.y,p.z+.25).normalize(),-.6));
  const dark=new T.MeshStandardMaterial({color:'#515454',roughness:1,side:T.DoubleSide});
  ribbon('Hook_patch_on_return_underside',hooks,18,.25,dark);
  ribbon('Soft_loop_landing_on_outward_web',arc(ag+.22,ae,1.12),20,.18,materials.selvedge);
  ribbon('Rounded_grip_tab_no_hook',ret.slice(-16),21,.5,materials.edge);
  for(const a of [a0+.12,ag-.27]){
    const c=at(a,1.6);const pts=[c.clone().add(new T.Vector3(-9,0,0)),c.clone().add(new T.Vector3(9,0,0))];
    add('Bar_tack_seam',new T.TubeGeometry(new T.LineCurve3(...pts),1,.16,6,false),materials.selvedge);
  }
  return {guide:guide.toArray(),spec:closureSpec,parts:meshes.map(m=>m.name),peel,modelScope:'Web route and peel illustration; not contact or strength simulation'};
}
