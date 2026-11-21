import {createClient} from '@supabase/supabase-js'
const U=import.meta.env.VITE_SUPABASE_URL,K=import.meta.env.VITE_SUPABASE_ANON_KEY
let C=null,E=''
try{if(U&&K)C=createClient(U.trim(),K.trim(),{auth:{lock:async(_n,_t,fn)=>await fn()}})}catch(e){E=e.message}
export const sb=C,ok=!!C,cfgErr=E
const T=s=>s?Date.parse(s):0
export async function loadAll(uid){
 const q=t=>sb.from(t).select('*'),R=await Promise.all(['profiles','drivers','reviews','routes','tickets','trips'].map(q)),e=R.find(x=>x.error);if(e)throw e.error
 const[p,d,r,ro,t,tr]=R.map(x=>x.data),pm=Object.fromEntries(p.map(x=>[x.id,x])),dm=Object.fromEntries(d.map(x=>[x.id,x.plate]))
 const dr=d.map(x=>({id:x.id,role:'conductor',name:x.name,phone:pm[x.id]?.phone||'',plate:x.plate,zone:x.zone,addr:x.addr||'',from:x.from_time.slice(0,5),to:x.to_time.slice(0,5),estado:x.estado,share:x.share_location,pos:x.lat==null?null:[x.lat,x.lng],eta:x.eta,pay:x.pay||[],seen:T(x.seen),off:x.suspended,ver:x.verified,avatar:x.avatar_url}))
 const ot=p.filter(x=>x.role!=='conductor').map(x=>({id:x.id,role:x.role,name:x.name,phone:x.phone||'',off:x.suspended,avatar:x.avatar_url}))
 return{session:uid,users:[...dr,...ot],reviews:r.map(x=>({id:x.id,p:x.plate,s:x.stars,c:x.comment||'',by:x.user_id,t:T(x.created_at)})),routes:ro.map(x=>({id:x.id,n:x.name,a:x.zone_a,b:x.zone_b})),
  tickets:t.map(x=>({id:x.id,by:x.user_id,n:pm[x.user_id]?.name||'Usuario',m:x.message,r:x.reply||'',p:x.plate,t:T(x.created_at)})),trips:tr.map(x=>({id:x.id,p:dm[x.driver_id],a:x.amount,t:T(x.created_at)}))}}
const DF={zone:'zone',addr:'addr',from:'from_time',to:'to_time',estado:'estado',share:'share_location',eta:'eta',pay:'pay'}
// Compara el estado anterior con el nuevo y envía solo lo que cambió.
export async function sync(a,b){
 const run=[],J=JSON.stringify
 for(const u of b.users){const o=a.users.find(x=>x.id===u.id);if(!o)continue;const ch=k=>J(u[k])!==J(o[k])
  const p={};if(ch('name'))p.name=u.name;if(ch('phone'))p.phone=u.phone
  if(Object.keys(p).length)run.push(sb.from('profiles').update(p).eq('id',u.id))
  if(u.role==='conductor'){const d={};for(const k in DF)if(ch(k))d[DF[k]]=u[k]
   if(ch('pos')&&u.pos)[d.lat,d.lng]=u.pos
   if(ch('seen'))d.seen=new Date().toISOString()
   if(Object.keys(d).length)run.push(sb.from('drivers').update(d).eq('id',u.id))
   if(ch('plate'))run.push(sb.rpc('admin_set_plate',{uid:u.id,p:u.plate}))}
  if(ch('off')||ch('ver'))run.push(sb.rpc('admin_set_flags',{uid:u.id,p_suspended:ch('off')?!!u.off:null,p_verified:ch('ver')?!!u.ver:null}))}
 for(const o of a.users)if(!b.users.some(x=>x.id===o.id))run.push(sb.rpc('admin_delete_user',{uid:o.id}))
 for(const r of b.reviews)if(!r.id)run.push(sb.from('reviews').insert({plate:r.p,stars:r.s,comment:r.c}))
 for(const t of b.tickets){if(!t.id)run.push(sb.from('tickets').insert({message:t.m,plate:t.p||null,kind:t.p?'reporte':'soporte'}));else{const o=a.tickets.find(x=>x.id===t.id);if(o&&o.r!==t.r)run.push(sb.from('tickets').update({reply:t.r}).eq('id',t.id))}}
 for(const x of b.trips)if(!x.id)run.push(sb.from('trips').insert({amount:x.a}))
 for(const r of b.routes)if(typeof r.id==='string')run.push(sb.from('routes').insert({name:r.n,zone_a:r.a,zone_b:r.b}))
 for(const r of a.routes)if(!b.routes.some(x=>x.id===r.id))run.push(sb.from('routes').delete().eq('id',r.id))
 const e=(await Promise.all(run)).find(x=>x.error);if(e)throw e.error}
// Recorta la foto a un cuadrado de 256 px (JPEG), la sube y guarda la URL en el perfil.
export async function uploadAvatar(uid,file){
 const img=await createImageBitmap(file),s=256,c=document.createElement('canvas'),m=Math.min(img.width,img.height);c.width=c.height=s
 c.getContext('2d').drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,s,s)
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.85)),path=uid+'/avatar.jpg',up=await sb.storage.from('avatars').upload(path,blob,{upsert:true,contentType:'image/jpeg'});if(up.error)throw up.error
 const url=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl+'?v='+Date.now(),r=await sb.from('profiles').update({avatar_url:url}).eq('id',uid);if(r.error)throw r.error}
