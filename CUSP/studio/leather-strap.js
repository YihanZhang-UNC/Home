import * as T from 'three';
// Appearance study: actual perforated geometry, not a validated leather pattern.
export function buildLeatherStrap(parent,materials,{ry,rz,a0,a1}){
 const names=[],ag=1.48,R=(ry+rz)/2;
 const at=(a,r=0,x=0)=>new T.Vector3(x,(ry+r)*Math.sin(a),(rz+r)*Math.cos(a)-.25);
 const add=(name,g,m)=>{const o=new T.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);names.push(name);return o;};
 const tube=(name,pts,r,m)=>add(name,new T.TubeGeometry(new T.CatmullRomCurve3(pts),Math.max(16,pts.length*3),r,8,false),m);
 function web(name,start,end,radial,holes=false){
  const length=Math.abs(end-start)*R,shape=new T.Shape();shape.moveTo(-11,0);shape.lineTo(11,0);shape.lineTo(11,length-3);shape.quadraticCurveTo(11,length,8,length);shape.lineTo(-8,length);shape.quadraticCurveTo(-11,length,-11,length-3);shape.closePath();
  if(holes)for(let j=0;j<6;j++){const u=length-6-j*5;if(u>3){const h=new T.Path();h.absellipse(0,u,.7,1.05,0,Math.PI*2,true);shape.holes.push(h);}}
  // Dense longitudinal contour points permit bending while keeping real through holes.
  // Shape triangulation alone has long triangles: subdivide every triangle before bending.
  const raw=new T.ExtrudeGeometry(shape,{depth:1.1,bevelEnabled:false,curveSegments:12,steps:1});
  const src=raw.attributes.position,verts=[],uv=[];
  const emit=(a,b,c,depth=0)=>{if(depth<12&&Math.max(Math.abs(a.y-b.y),Math.abs(b.y-c.y),Math.abs(c.y-a.y))>1.2){const ab=Math.abs(a.y-b.y),bc=Math.abs(b.y-c.y),ca=Math.abs(c.y-a.y);if(ab>=bc&&ab>=ca){const m=a.clone().lerp(b,.5);emit(a,m,c,depth+1);emit(m,b,c,depth+1);}else if(bc>=ca){const m=b.clone().lerp(c,.5);emit(a,b,m,depth+1);emit(a,m,c,depth+1);}else{const m=c.clone().lerp(a,.5);emit(a,b,m,depth+1);emit(m,b,c,depth+1);}return;}for(const v of[a,b,c]){const angle=start+(end-start)*v.y/length,q=at(angle,radial+v.z,v.x);verts.push(q.x,q.y,q.z);uv.push(v.x/22+.5,v.y/length);}};
  for(let i=0;i<src.count;i+=3)emit(new T.Vector3().fromBufferAttribute(src,i),new T.Vector3().fromBufferAttribute(src,i+1),new T.Vector3().fromBufferAttribute(src,i+2));raw.dispose();
  const welded=[],tex=[],indices=[],seen=new Map();for(let i=0;i<verts.length/3;i++){const key=verts.slice(i*3,i*3+3).map(v=>Math.round(v*10000)).join(',');let n=seen.get(key);if(n===undefined){n=welded.length/3;seen.set(key,n);welded.push(...verts.slice(i*3,i*3+3));tex.push(...uv.slice(i*2,i*2+2));}indices.push(n);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(welded,3));g.setAttribute('uv',new T.Float32BufferAttribute(tex,2));g.setIndex(indices);g.computeVertexNormals();add(name,g,materials.fabric);
  for(const x of[-9.5,9.5])for(let u=2;u<length-2;u+=2.1){const aa=start+(end-start)*u/length,bb=start+(end-start)*Math.min(u+1.15,length-2)/length;tube('Leather_edge_stitch',[at(aa,radial+1.15,x),at(bb,radial+1.15,x)],.075,materials.selvedge);}
 }
 web('Leather_short_buckle_half',a0,ag,.2);
 web('Leather_perforated_adjustment_half',a1,ag-.48,1.55,true);
 const center=at(ag,2.35),tangent=new T.Vector3(0,ry*Math.cos(ag),-rz*Math.sin(ag)).normalize(),normal=new T.Vector3(0,-tangent.z,tangent.y);
 const local=(x,s,n=0)=>center.clone().add(new T.Vector3(x,0,0)).addScaledVector(tangent,s).addScaledVector(normal,n);
 const corners=[[-11.9,-4.5],[11.9,-4.5],[12.4,-4],[12.4,4],[11.9,4.5],[-11.9,4.5],[-12.4,4],[-12.4,-4],[-11.9,-4.5]];
 tube('Rounded_silver_tang_buckle',corners.map(([x,s])=>local(x,s)),.7,materials.edge);
 tube('Buckle_crossbar',[local(-12,-3.8),local(12,-3.8)],.55,materials.edge);
 tube('Articulated_buckle_pin',[local(0,-3.8,.25),local(0,-1,1.6),local(0,4.2,.1)],.38,materials.edge);
 for(const a of [ag-.24,ag-.39]){
  const pts=[at(a,.1,-11.7),at(a,3.1,-11.7),at(a,3.1,11.7),at(a,.1,11.7),at(a,.1,-11.7)];
  tube('Leather_tail_keeper',pts,.65,materials.fabric);
 }
 return {parts:names,peel:0,closure:'Tang buckle, six through holes and two tail keepers',modelScope:'Appearance topology; hole placement, pin engagement and durability require pattern development'};
}
