import {useState,useEffect,useRef,useMemo} from 'react'
import L from 'leaflet'
import {Bike,MapPin,Search,Star,LogOut,Power,Navigation,Wallet,Users,LifeBuoy,History,X,Download,Upload,Trash2,Pencil,Clock,CreditCard,TriangleAlert,ShieldCheck,BadgeCheck,Flag,Crosshair,BellRing,Sun,Moon,Camera} from 'lucide-react'
import {Z,PAY,ZC,COL,on,eff,cop,nm,avg,pos,km} from './store'
import {sb,ok,cfgErr,loadAll,sync,uploadAvatar} from './supabase'

const Pill=({e})=><span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{background:COL[e]+'26'}}><i className="h-2 w-2 rounded-full" style={{background:COL[e]}}/>{e}</span>
function Av({u,s=40}){const[e,setE]=useState(false);return u?.avatar&&!e?<img src={u.avatar} alt="" onError={()=>setE(true)} className="shrink-0 rounded-full object-cover" style={{width:s,height:s}}/>:<span className="grid shrink-0 place-items-center rounded-full bg-sun font-bold text-[#101820]" style={{width:s,height:s,fontSize:s*.42}}>{(u?.name||'?').trim()[0]?.toUpperCase()}</span>}
const Theme=({c})=><button className="btn2 !px-3 !py-2" aria-label="Cambiar tema claro u oscuro" onClick={c.tog}>{c.th==='dark'?<Sun size={16}/>:<Moon size={16}/>}</button>
const Fld=({l,...p})=><label className="block text-xs font-medium text-slate-500">{l}<input className="in mt-1 !text-ink" {...p}/></label>
const Sel=({v,on,l,o})=><select className="chip" value={v} onChange={on} aria-label={l}><option value="">{l}</option>{o.map(x=>Array.isArray(x)?<option key={x[0]} value={x[0]}>{x[1]}</option>:<option key={x}>{x}</option>)}</select>
const Alert=({children})=><div className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert"><TriangleAlert size={18} className="mt-0.5 shrink-0"/><div>{children}</div></div>
const Modal=({t,close,children})=><div className="fixed inset-0 z-50 grid place-items-end bg-black/50 fade sm:place-items-center sm:p-4" onClick={close}><div className="sheet w-full max-w-md rounded-t-3xl bg-white p-5 sm:rounded-3xl" onClick={e=>e.stopPropagation()} role="dialog" aria-label={t}><div className="mb-3 flex justify-between"><h3 className="text-lg font-bold">{t}</h3><button onClick={close} aria-label="Cerrar"><X/></button></div>{children}</div></div>
const Top=({c,sub})=><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-sun text-[#101820]"><Bike size={20}/></span><div className="leading-tight"><b className="f text-lg">BTX</b><div className="text-xs text-slate-500">{sub}</div></div></div><div className="flex items-center gap-2"><button aria-label="Mi perfil y foto" onClick={()=>c.setModal({k:'profile'})}><Av u={c.me} s={36}/></button><Theme c={c}/><button className="btn2 !px-3 !py-2" aria-label="Salir" onClick={()=>sb.auth.signOut()}><LogOut size={16}/></button></div></div>
const Big=({k,v})=><div className="card"><div className="f text-2xl font-extrabold">{v}</div><div className="text-xs text-slate-500">{k}</div></div>

function Map({ds,routes,sel,onSel,all,you,className}){
 const el=useRef(),m=useRef(),g=useRef(),tl=useRef(),[th,setTh]=useState(()=>document.documentElement.dataset.theme)
 useEffect(()=>{const f=()=>setTh(document.documentElement.dataset.theme);addEventListener('btx-theme',f);return()=>removeEventListener('btx-theme',f)},[])
 useEffect(()=>{m.current=L.map(el.current,{zoomControl:false}).setView([4.66,-74.1],11);L.control.zoom({position:'topright'}).addTo(m.current)
  Object.entries(ZC).forEach(([z,p])=>L.circle(p,{radius:2600,color:'#94a3b8',weight:1,fillOpacity:.08,interactive:false}).bindTooltip(z,{permanent:true,direction:'center',className:'zl'}).addTo(m.current))
  g.current=L.layerGroup().addTo(m.current)
  return()=>m.current.remove()},[])
 useEffect(()=>{if(!m.current)return;tl.current?.remove();const u=['https://tile.openstreetmap.org/{z}/{x}/{y}.png','https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'];let k=0;const mk=()=>{tl.current=L.tileLayer(u[k],{attribution:'© OpenStreetMap'}).addTo(m.current).on('tileerror',()=>{if(k<u.length-1){k++;tl.current.remove();mk()}});tl.current.bringToBack()};mk()},[th])
 useEffect(()=>{g.current.clearLayers()
  routes.forEach(q=>L.polyline([ZC[q.a],ZC[q.b]],{color:'#101820',weight:4,dashArray:'2 10',lineCap:'round'}).bindTooltip(q.n).addTo(g.current))
  ds.forEach(({d,e})=>{const s=sel===d.plate;if(!all&&!on(e)&&!s)return
   L.marker(pos(d),{icon:L.divIcon({className:'',iconSize:[18,18],html:`<div class="pin ${on(e)&&!s?'pulse':''}" style="--c:${COL[e]}99;background:${COL[e]};${s?'transform:scale(1.5);box-shadow:0 0 0 4px #ffc21a':''}"></div>`})}).bindTooltip(d.plate).on('click',()=>onSel&&onSel(d.plate)).addTo(g.current)})
  you&&L.marker(you,{icon:L.divIcon({className:'',iconSize:[18,18],html:'<div class="pin" style="background:#2563eb;box-shadow:0 0 0 8px #2563eb33"></div>'})}).bindTooltip('Tú').addTo(g.current)},[ds,routes,sel,you])
 useEffect(()=>{const x=ds.find(y=>y.d.plate===sel);if(x)m.current.flyTo(pos(x.d),15,{duration:.8})},[sel])
 useEffect(()=>{you&&m.current.flyTo(you,14)},[you])
 return<div ref={el} className={className}/>}

function Auth({c}){
 const{db,up}=c,[t,setT]=useState('in'),[f,setF]=useState({r:'usuario',z:Z[0],hf:'06:00',ht:'18:00'}),[err,setErr]=useState(''),[ok,setOk]=useState('')
 const s=k=>e=>setF({...f,[k]:e.target.value}),v=k=>(f[k]||'').trim()
 const go=async(em,pw)=>{setErr('');const{error}=await sb.auth.signInWithPassword({email:em.trim().toLowerCase(),password:pw});if(error)setErr('Correo o contraseña incorrectos.')}
 async function reg(){
  const r=f.r,F={Nombre:v('n'),Correo:v('e'),Celular:v('ph'),Contraseña:f.p||''};if(r==='conductor')Object.assign(F,{Identificación:v('idn'),Placa:v('pl').toUpperCase(),'Dirección de ubicación':v('ad')})
  const miss=Object.keys(F).filter(k=>!F[k]);if(miss.length)return setErr('Faltan datos: '+miss.join(', ')+'.')
  if(!/^\S+@\S+\.\S+$/.test(F.Correo))return setErr('El correo no es válido.')
  if(!/^3\d{9}$/.test(F.Celular))return setErr('El celular debe tener 10 dígitos y empezar por 3.')
  if(F.Contraseña.length<8)return setErr('La contraseña debe tener mínimo 8 caracteres.')
  const em=F.Correo.toLowerCase(),md={role:r,name:F.Nombre,phone:F.Celular}
  if(r==='conductor'){if(!/^[A-Z0-9]{5,6}$/.test(F.Placa))return setErr('La placa debe tener 5 o 6 letras o números.');const q=await sb.rpc('plate_free',{p:F.Placa});if(q.data===false)return setErr('Esa placa ya está registrada.');Object.assign(md,{id_number:F.Identificación,plate:F.Placa,zone:f.z,addr:F['Dirección de ubicación'],from:f.hf,to:f.ht})}
  const{data,error}=await sb.auth.signUp({email:em,password:F.Contraseña,options:{data:md}});if(error)return setErr(error.message.includes('already')?'Ese correo ya está registrado.':error.message)
  if(!data.session){setT('in');setOk('Cuenta creada. Revisa tu correo para confirmarla y luego ingresa.')}}
async function rec(){if(!/^\S+@\S+\.\S+$/.test(v('re')))return setErr('Escribe un correo válido.');const{error}=await sb.auth.resetPasswordForEmail(v('re').toLowerCase(),{redirectTo:location.origin});if(error)return setErr(error.message);setT('in');setErr('');setOk('Te enviamos un enlace para cambiar la contraseña. Revisa tu correo.')}
 return<div className="grid min-h-dvh md:grid-cols-[1.1fr_1fr]">
  <section className="relative flex flex-col justify-between gap-10 overflow-hidden bg-[#101820] p-6 text-[#fff] md:p-12">
   <div className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sun text-[#101820]"><Bike/></span><b className="f text-2xl">BTX</b></div>
   <div><h1 className="f max-w-md text-4xl font-extrabold leading-tight md:text-5xl">Mira dónde hay un bicitaxi antes de salir.</h1>
    <p className="mt-4 max-w-md text-[#cbd5e1]">Ubicaciones, rutas, placas y horarios en un mapa. Sin reservas: ves quién está disponible y vas por él.</p></div>
   <svg viewBox="0 0 400 120" className="w-full max-w-md" aria-hidden="true"><path id="rt" d="M10 90C90 10 150 110 230 50S350 30 390 70" fill="none" stroke="#ffc21a" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 10" className="route"/><circle cx="10" cy="90" r="6" fill="#fff"/><circle cx="390" cy="70" r="6" fill="#16a34a"/><circle r="9" fill="#ffc21a" className="rider"><animateMotion dur="7s" repeatCount="indefinite" path="M10 90C90 10 150 110 230 50S350 30 390 70"/></circle></svg>
   <ul className="hidden gap-2 text-sm text-[#cbd5e1] md:grid"><li className="flex gap-2"><ShieldCheck size={18} className="text-sun"/>Conductor identificado por placa</li><li className="flex gap-2"><MapPin size={18} className="text-sun"/>8 localidades de Bogotá</li><li className="flex gap-2"><CreditCard size={18} className="text-sun"/>Efectivo, Nequi, Daviplata o tarjeta</li></ul>
  </section>
  <section className="relative flex flex-col justify-center p-6 md:p-12"><div className="absolute right-4 top-4"><Theme c={c}/></div><div className="mx-auto w-full max-w-sm">
   <div className="mb-5 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">{[['in','Ingresar'],['up','Registrarse'],['rc','Recuperar']].map(([k,l])=><button key={k} onClick={()=>{setT(k);setErr('');setOk('')}} className={`flex-1 rounded-lg py-2 ${t===k?'bg-white shadow':'text-slate-500'}`}>{l}</button>)}</div>
   <div className="space-y-3">{err&&<Alert>{err}</Alert>}{ok&&<div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{ok}</div>}
   {t==='in'&&<><Fld l="Correo" type="email" autoComplete="username" onChange={s('le')}/><Fld l="Contraseña" type="password" autoComplete="current-password" onChange={s('lp')}/>
    <button className="btn w-full" onClick={()=>go(f.le||'',f.lp||'')}>Ingresar</button>
    </>}
   {t==='rc'&&<><p className="text-sm text-slate-500">Te enviaremos un enlace al correo con el que te registraste.</p><Fld l="Correo" type="email" onChange={s('re')}/><button className="btn w-full" onClick={rec}>Enviar enlace</button></>}
   {t==='up'&&<><div className="grid grid-cols-2 gap-2">{[['usuario','Soy pasajero'],['conductor','Soy conductor']].map(([k,l])=><button key={k} onClick={()=>setF({...f,r:k})} className={`rounded-xl border-2 py-2.5 text-sm font-semibold ${f.r===k?'border-ink bg-ink text-white':'border-slate-200'}`}>{l}</button>)}</div>
    <Fld l="Nombre completo" onChange={s('n')}/><Fld l="Correo" type="email" onChange={s('e')}/><Fld l="Celular (10 dígitos)" inputMode="numeric" onChange={s('ph')}/><Fld l="Contraseña (mín. 8)" type="password" autoComplete="new-password" onChange={s('p')}/>
    {f.r==='conductor'&&<><Fld l="Identificación" onChange={s('idn')}/><Fld l="Placa del bicitaxi" maxLength={6} onChange={s('pl')}/><label className="block text-xs font-medium text-slate-500">Localidad<select className="in mt-1 !text-ink" value={f.z} onChange={s('z')}>{Z.map(z=><option key={z}>{z}</option>)}</select></label><Fld l="Dirección de ubicación" onChange={s('ad')}/>
     <div className="grid grid-cols-2 gap-2"><Fld l="Horario desde" type="time" value={f.hf} onChange={s('hf')}/><Fld l="Hasta" type="time" value={f.ht} onChange={s('ht')}/></div></>}
    <button className="btn w-full" onClick={reg}>Crear cuenta</button></>}
   </div>
   <p className="mt-6 text-xs text-slate-400">Tus datos se guardan en la nube (Supabase) y las contraseñas se almacenan cifradas.</p>
  </div></section></div>}

function Profile({c,close}){const{me,up,say}=c,[f,setF]=useState({name:me.name,phone:me.phone||''}),[b,setB]=useState(false),s=k=>e=>setF({...f,[k]:e.target.value})
 const pick=async e=>{const x=e.target.files[0];if(!x)return;setB(true);try{await uploadAvatar(me.id,x);await c.refresh();say('Foto actualizada')}catch(er){say('No pudimos subir la foto: '+er.message)}setB(false)}
 const sv=()=>{if(!f.name.trim())return say('El nombre es obligatorio.');if(f.phone&&!/^3\d{9}$/.test(f.phone))return say('El celular debe tener 10 dígitos y empezar por 3.');up(n=>{Object.assign(n.users.find(x=>x.id===me.id),{name:f.name.trim(),phone:f.phone})});close()}
 return<Modal t="Mi perfil" close={close}><div className="space-y-3"><div className="flex items-center gap-4"><Av u={me} s={72}/><label className="btn2 cursor-pointer"><Camera size={14} className="mr-1 inline"/>{b?'Subiendo…':'Cambiar foto'}<input type="file" accept="image/*" hidden onChange={pick}/></label></div><Fld l="Nombre" value={f.name} onChange={s('name')}/><Fld l="Celular" value={f.phone} onChange={s('phone')}/><button className="btn w-full" onClick={sv}>Guardar cambios</button></div></Modal>}
function NewPw({c,close}){const[p,setP]=useState('');return<Modal t="Nueva contraseña" close={close}><div className="space-y-3"><Fld l="Contraseña (mín. 8)" type="password" onChange={e=>setP(e.target.value)}/><button className="btn w-full" onClick={async()=>{if(p.length<8)return c.say('Mínimo 8 caracteres.');const{error}=await sb.auth.updateUser({password:p});c.say(error?error.message:'Contraseña actualizada');if(!error)close()}}>Guardar</button></div></Modal>}
function Rate({c,p,close}){const[s,setS]=useState(5),[t,setT]=useState('')
 return<Modal t={'Calificar '+p} close={close}><div className="flex gap-1">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setS(n)} aria-label={n+' estrellas'}><Star size={32} className={n<=s?'fill-sun text-sun':'text-slate-300'}/></button>)}</div>
 <textarea className="in mt-3" maxLength={200} placeholder="Comentario (opcional)" value={t} onChange={e=>setT(e.target.value)}/>
 <button className="btn mt-3 w-full" onClick={()=>{c.up(n=>{n.reviews.push({p,s,c:t.trim()||'Sin comentario',by:n.session,t:Date.now()})});c.say('Reseña guardada');close()}}>Guardar reseña</button></Modal>}

function Support({c}){const{db,me,up,say}=c,[t,setT]=useState(''),tk=db.tickets.filter(x=>x.by===me.id).reverse()
 return<div className="space-y-3"><textarea className="in" maxLength={300} placeholder="Cuéntanos qué pasó" value={t} onChange={e=>setT(e.target.value)}/>
 <button className="btn" onClick={()=>{if(!t.trim())return say('Escribe tu mensaje antes de enviarlo.');up(n=>{n.tickets.push({by:me.id,n:me.name,m:t.trim(),r:'',t:Date.now()})});setT('');say('Mensaje enviado al administrador')}}>Enviar mensaje</button>
 {tk.map((x,i)=><div key={i} className="card text-sm">{x.m}<div className="mt-1 font-semibold">{x.r?'Respuesta: '+x.r:'En revisión'}</div></div>)}</div>}

function Passenger({c}){
 const{db,me}=c,[F,setF]=useState({q:'',z:'',e:'',p:'',eta:''}),[tab,setTab]=useState('map'),[sel,setSel]=useState(null),[open,setOpen]=useState(false),[you,setYou]=useState(null),s=k=>e=>setF({...F,[k]:e.target.value})
 const A=useMemo(()=>db.users.filter(x=>x.role==='conductor').map(d=>({d,e:eff(d)})),[db]),q=F.q.trim().toUpperCase()
 const R=useMemo(()=>A.filter(({d,e})=>(!q||d.plate.includes(q))&&(!F.z||d.zone===F.z)&&(!F.e||e===F.e)&&(!F.p||d.pay.includes(F.p))&&(!F.eta||(on(e)&&d.eta<=+F.eta))).sort((a,b)=>you?km(you,pos(a.d))-km(you,pos(b.d)):0),[A,F,you])
 const cur=A.find(x=>x.d.plate===sel),sug=A.filter(x=>x.e==='Activo'&&x.d.plate!==sel).sort((a,b)=>(b.d.zone===cur?.d.zone)-(a.d.zone===cur?.d.zone)||a.d.eta-b.d.eta).slice(0,3)
 const Sg=()=><div className="mt-2 flex flex-wrap gap-2">{sug.map(x=><button key={x.d.plate} className="chip font-semibold" onClick={()=>setSel(x.d.plate)}>{x.d.plate} · {x.d.zone} · {x.d.eta} min</button>)}{!sug.length&&<span>Ninguno por ahora.</span>}</div>
 const mine=db.reviews.filter(r=>r.by===me.id).reverse()
 const loc=()=>{const ok=p=>{setYou(p);setOpen(false)},ko=()=>{ok([4.66,-74.09]);c.say('Sin GPS: usamos una ubicación de ejemplo en Bogotá.')};navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>ok([p.coords.latitude,p.coords.longitude]),ko,{timeout:8000}):ko()}
 const rep=p=>{c.up(n=>{n.tickets.push({by:me.id,n:me.name,m:'Reporte: '+p+' aparece activo pero no está en el lugar.',p,r:'',t:Date.now()})});c.say('Reporte enviado. Gracias por avisar.')}
 return<div className="relative flex h-dvh flex-col md:flex-row">
  <div className="absolute inset-x-3 top-3 z-10 rounded-2xl bg-white/90 p-2 shadow-lg backdrop-blur md:hidden"><Top c={c} sub={me.name}/></div>
  <aside className={`absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-3xl bg-white shadow-[0_-10px_40px_#0003] transition-[height] duration-500 ease-[cubic-bezier(.32,.72,0,1)] md:static md:h-full md:w-[26rem] md:rounded-none md:shadow-none md:ring-1 md:ring-slate-200 ${open?'h-[84%]':'h-[46%]'}`}>
   <div className="hidden p-4 pb-0 md:block"><Top c={c} sub={me.name}/></div>
   <button className="mx-auto my-2 h-1.5 w-12 shrink-0 rounded-full bg-slate-300 md:hidden" onClick={()=>setOpen(!open)} aria-label="Cambiar tamaño del panel"/>
   <nav className="mx-4 mt-1 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">{[['map','Buscar',Search],['his','Historial',History],['sup','Ayuda',LifeBuoy]].map(([k,l,I])=><button key={k} onClick={()=>{setTab(k);setOpen(true)}} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 ${tab===k?'bg-white shadow':'text-slate-500'}`}><I size={15}/>{l}</button>)}</nav>
   <div key={tab} className="fade flex-1 space-y-3 overflow-y-auto p-4">
   {tab==='map'&&<>
    <div className="relative"><Search className="absolute left-3.5 top-3 text-slate-400" size={18}/><input className="in !pl-10" placeholder="Buscar por placa, ej. KEN10" value={F.q} onChange={s('q')}/></div>
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"><button className="chip font-semibold" onClick={loc}><Crosshair size={14} className="mr-1 inline"/>Cerca de mí</button><Sel v={F.z} on={s('z')} l="Localidad" o={Z}/><Sel v={F.e} on={s('e')} l="Estado" o={Object.keys(COL)}/><Sel v={F.p} on={s('p')} l="Pago" o={PAY}/><Sel v={F.eta} on={s('eta')} l="Llega en" o={[['5','≤ 5 min'],['10','≤ 10 min'],['15','≤ 15 min']]}/></div>
    <p className="text-xs text-slate-500"><b className="text-ink">{A.filter(x=>on(x.e)).length}</b> disponibles ahora · ~4.646 bicitaxis estimados en Bogotá (Sec. Movilidad, 2019)</p>
    {cur&&<div key={cur.d.plate} className="card rise" style={{borderLeft:'5px solid '+COL[cur.e]}}><div className="flex items-start justify-between gap-3"><Av u={cur.d} s={56}/><div className="min-w-0 flex-1"><div className="f text-xl font-extrabold">{cur.d.plate}{cur.d.ver&&<span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><BadgeCheck size={15}/>Verificado</span>}</div><div className="text-sm text-slate-500">Conductor: {nm(cur.d.name)}</div></div><Pill e={cur.e}/></div>
     <div className="mt-2 grid gap-1 text-sm"><span className="flex gap-2"><MapPin size={16}/>{cur.d.zone} · {cur.d.addr}</span><span className="flex gap-2"><Clock size={16}/>Horario {cur.d.from}–{cur.d.to}{on(cur.e)&&' · llega en '+cur.d.eta+' min'}</span><span className="flex gap-2"><CreditCard size={16}/>{cur.d.pay.join(', ')}</span><span className="flex gap-2"><Star size={16}/>{avg(db,cur.d.plate)}</span></div>
     {!on(cur.e)&&<div className="mt-3"><Alert><b>No disponible.</b> Prueba con otro bicitaxi en servicio activo:<Sg/></Alert></div>}
     <div className="mt-3 grid grid-cols-2 gap-2"><button className="btn2" onClick={()=>c.setModal({k:'rate',p:cur.d.plate})}>Calificar</button><button className="btn2" onClick={()=>rep(cur.d.plate)}><Flag size={14} className="mr-1 inline"/>No está aquí</button></div></div>}
    {!R.length&&<Alert>Sin resultados: ningún bicitaxi coincide con la búsqueda. Otros en servicio activo:<Sg/></Alert>}
    {R.map(({d,e},i)=><button key={d.id} style={{animationDelay:Math.min(i,8)*45+'ms'}} onClick={()=>{setSel(d.plate);setOpen(false)}} className={`rise flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 transition ${sel===d.plate?'bg-sun/20 ring-ink':'bg-white ring-slate-200 hover:bg-slate-50'}`}>
     <Av u={d} s={44}/>
     <span className="min-w-0 flex-1"><b className="f block text-base">{d.plate}{d.ver&&<BadgeCheck size={15} className="ml-1 inline text-blue-600" aria-label="Verificado"/>}</b><span className="block truncate text-xs text-slate-500">{d.zone} · {nm(d.name)} · ★ {avg(db,d.plate)}{you&&' · '+km(you,pos(d)).toFixed(1)+' km'}</span></span>
     <span className="text-right"><span className="f block text-lg font-extrabold">{on(e)?d.eta+' min':'—'}</span><Pill e={e}/></span></button>)}</>}
   {tab==='his'&&(mine.length?mine.map((r,i)=><div key={i} className="card text-sm"><b>{r.p}</b> · {'★'.repeat(r.s)} <span className="text-slate-400">{new Date(r.t).toLocaleDateString('es-CO')}</span><div>{r.c}</div></div>):<p className="text-sm text-slate-500">Aún no calificas ningún servicio. Elige un bicitaxi en «Buscar» y toca «Calificar servicio».</p>)}
   {tab==='sup'&&<><Support c={c}/><p className="text-xs leading-relaxed text-slate-400">Total ciudad según el estudio de caracterización del bicitaxismo de la Secretaría Distrital de Movilidad (2019). Placas, direcciones y posiciones son datos de ejemplo. Solo ves la inicial y el apellido del conductor. Creado por Isabela Valderrama · Maria Camila Calvache · Samuel Núñez.</p></>}
   </div></aside>
  <Map ds={R} routes={db.routes} sel={sel} onSel={setSel} you={you} className="absolute inset-0 md:relative md:flex-1"/></div>}

function Driver({c}){
 const{db,me:d,up,say}=c,e=eff(d),T=db.trips.filter(t=>t.p===d.plate),day=new Date().toDateString(),hy=T.filter(t=>new Date(t.t).toDateString()===day).reduce((a,t)=>a+t.a,0),tot=T.reduce((a,t)=>a+t.a,0)
 const[f,setF]=useState({name:d.name,phone:d.phone,zone:d.zone,addr:d.addr,from:d.from,to:d.to,pay:d.pay}),[amt,setAmt]=useState(''),s=k=>x=>setF({...f,[k]:x.target.value})
 const set=p=>up(n=>{Object.assign(n.users.find(x=>x.id===d.id),{seen:Date.now(),...p})}),conn=d.estado!=='Fuera de servicio'
 const gps=()=>{if(d.share)return set({share:false});if(!navigator.geolocation)return say('Tu dispositivo no tiene GPS.');navigator.geolocation.getCurrentPosition(p=>{set({share:true,pos:[p.coords.latitude,p.coords.longitude]});say('Ubicación compartida')},()=>say('No pudimos usar el GPS: activa el permiso de ubicación.'),{timeout:8000})}
 const sv=()=>{if(!f.name.trim()||!f.addr.trim())return say('Completa nombre y dirección.');if(!/^3\d{9}$/.test(f.phone))return say('El celular debe tener 10 dígitos y empezar por 3.');if(!f.from||!f.to)return say('Indica el horario.');set(f);say('Datos guardados')}
 return<div className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[1fr_1.1fr]">
  <div className="lg:col-span-2"><Top c={c} sub={'Modo conductor · '+d.plate}/></div>
  <div className="space-y-4">
   <div className={`rounded-3xl p-6 text-[#fff] transition-colors ${conn?'bg-green-700':'bg-[#101820] ring-1 ring-slate-300'}`}><div className="flex items-center justify-between"><div><div className="text-sm opacity-80">Tu estado</div><div className="f text-3xl font-extrabold">{conn?'Conectado':'Desconectado'}</div></div><Pill e={e}/></div>
    <button onClick={()=>set({estado:conn?'Fuera de servicio':'Activo'})} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#fff] py-4 text-lg font-bold text-[#101820] transition active:scale-95"><Power/>{conn?'Desconectarme':'Conectarme'}</button>
    <div className="mt-3 grid grid-cols-2 gap-2"><button disabled={!conn} onClick={()=>set({estado:d.estado==='En parada'?'Activo':'En parada'})} className="rounded-xl bg-[#fff]/15 py-2.5 text-sm font-semibold disabled:opacity-40">{d.estado==='En parada'?'Salir de parada':'Estoy en parada'}</button><button onClick={gps} className="flex items-center justify-center gap-2 rounded-xl bg-[#fff]/15 py-2.5 text-sm font-semibold"><Navigation size={16}/>{d.share?'Dejar de compartir':'Compartir GPS'}</button></div>
    {!d.share&&<button className="mt-2 text-xs underline" onClick={()=>set({share:true})}>Usar ubicación de demo</button>}</div>
   {conn&&e!=='Sin señal'&&Date.now()-d.seen>9e5&&<div className="flex items-center justify-between gap-2 rounded-xl bg-sun/30 p-3 text-sm"><span className="flex gap-2"><BellRing size={18} className="shrink-0"/>¿Sigues disponible? Confirma para no aparecer «sin señal».</span><button className="btn !py-1.5" onClick={()=>set({})}>Sigo activo</button></div>}{e==='Sin señal'&&<Alert>Apareces «sin señal»: comparte tu ubicación y actualiza tu estado al menos cada 30 min. Fuera de tu horario, el sistema te marca «fuera de servicio».</Alert>}
   <Map ds={[{d,e}]} routes={[]} sel={d.plate} all className="h-56 rounded-3xl"/>
   <div className="card"><h3 className="mb-3 flex items-center gap-2 font-bold"><Wallet size={18}/>Panel de ingresos</h3><div className="grid grid-cols-3 gap-2 text-center"><div><b className="f text-xl">{cop(hy)}</b><div className="text-xs text-slate-500">hoy</div></div><div><b className="f text-xl">{cop(tot)}</b><div className="text-xs text-slate-500">{T.length} viajes</div></div><div><b className="f text-xl">{avg(db,d.plate)}</b><div className="text-xs text-slate-500">calificación</div></div></div>
    <div className="mt-3 flex gap-2"><input className="in" type="number" min="1000" step="500" placeholder="Valor del viaje (COP)" value={amt} onChange={x=>setAmt(x.target.value)}/><button className="btn shrink-0" onClick={()=>{if(!(+amt>=1000))return say('Escribe un valor de al menos $1.000.');up(n=>{n.trips.push({p:d.plate,a:+amt,t:Date.now()});n.users.find(x=>x.id===d.id).seen=Date.now()});setAmt('')}}>Registrar</button></div>
    {T.slice(-4).reverse().map((t,i)=><div key={i} className="mt-1 text-xs text-slate-500">{new Date(t.t).toLocaleString('es-CO')} · {cop(t.a)}</div>)}</div></div>
  <div className="card space-y-3"><h3 className="font-bold">Mis datos y horario</h3><Fld l="Nombre" value={f.name} onChange={s('name')}/><Fld l="Celular" value={f.phone} onChange={s('phone')}/>
   <label className="block text-xs font-medium text-slate-500">Localidad<select className="in mt-1 !text-ink" value={f.zone} onChange={s('zone')}>{Z.map(z=><option key={z}>{z}</option>)}</select></label><Fld l="Dirección de ubicación" value={f.addr} onChange={s('addr')}/>
   <div className="grid grid-cols-2 gap-2"><Fld l="Desde" type="time" value={f.from} onChange={s('from')}/><Fld l="Hasta" type="time" value={f.to} onChange={s('to')}/></div>
   <div className="text-xs font-medium text-slate-500">Métodos de pago que aceptas<div className="mt-1 flex flex-wrap gap-2">{PAY.map(p=><button key={p} onClick={()=>setF({...f,pay:f.pay.includes(p)?f.pay.filter(x=>x!==p):[...f.pay,p]})} className={`chip font-semibold ${f.pay.includes(p)?'!border-ink !bg-ink text-white':''}`}>{p}</button>)}</div></div>
   <button className="btn w-full" onClick={sv}>Guardar cambios</button></div></div>}

function Tk({c,t,i}){const[r,setR]=useState('');return<div className="card text-sm"><b>{t.n}</b>: {t.m}{t.r?<div className="mt-1 text-slate-500">Respondido: {t.r}</div>:<div className="mt-2 flex gap-2"><input className="in" placeholder="Escribe la respuesta" value={r} onChange={e=>setR(e.target.value)}/><button className="btn" onClick={()=>r.trim()&&c.up(n=>{n.tickets[i].r=r.trim()})}>Responder</button></div>}</div>}

function Admin({c}){
 const{db,up,say,setModal}=c,D=db.users.filter(x=>x.role==='conductor'),A=D.map(d=>({d,e:eff(d)})),inc=db.trips.reduce((a,t)=>a+t.a,0),mx=Math.max(1,...Z.map(z=>D.filter(d=>d.zone===z).length)),[r,setR]=useState({n:'',a:Z[0],b:Z[1]})
 const dl=(txt,name,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()}
 const csv=()=>dl('\ufeff'+[['Placa','Zona','Direccion','Estado','Llega_en_min','Calificacion','Viajes','Ingresos']].concat(A.map(({d,e})=>{const T=db.trips.filter(t=>t.p===d.plate);return[d.plate,d.zone,d.addr,e,d.eta,avg(db,d.plate),T.length,T.reduce((a,t)=>a+t.a,0)]})).map(x=>x.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'),'reporte_btx.csv','text/csv')
 const rs=f=>f&&f.text().then(t=>{try{const d=JSON.parse(t);if(!d.users)throw 0;d.session=db.session;up(n=>Object.assign(n,d));say('Copia restaurada')}catch{say('Archivo no válido')}})
 return<div className="mx-auto max-w-6xl space-y-4 p-4"><Top c={c} sub="Administrador"/>
  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[['Conductores',D.length],['Pasajeros',db.users.filter(x=>x.role==='usuario').length],['Viajes',db.trips.length],['Ingresos',cop(inc)],['Calificación',db.reviews.length?(db.reviews.reduce((a,x)=>a+x.s,0)/db.reviews.length).toFixed(1):'—']].map(([k,v])=><Big key={k} k={k} v={v}/>)}</div>
  <div className="grid gap-4 lg:grid-cols-2"><div className="card"><h3 className="mb-2 font-bold">Monitoreo en vivo</h3><Map ds={A} routes={db.routes} all className="h-72 rounded-2xl"/></div>
   <div className="card"><h3 className="mb-3 font-bold">Reportes</h3><div className="mb-3 flex flex-wrap gap-2">{Object.keys(COL).map(k=><span key={k} className="text-xs"><Pill e={k}/> {A.filter(x=>x.e===k).length}</span>)}</div>
    {Z.map(z=>{const n=D.filter(d=>d.zone===z).length;return<div key={z} className="flex items-center gap-2 py-0.5 text-sm"><span className="w-28">{z}</span><div className="grow h-2.5 rounded-full bg-sun" style={{width:n/mx*60+'%'}}/><span className="text-xs text-slate-500">{n}</span></div>})}
    <button className="btn2 mt-3" onClick={csv}><Download size={14} className="mr-1 inline"/>Descargar CSV</button></div></div>
  <div className="card"><h3 className="mb-2 font-bold">Gestión de cuentas</h3><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="py-1">Nombre</th><th>Rol</th><th>Placa</th><th>Zona</th><th>Cuenta</th><th/></tr></thead><tbody>{db.users.map(x=><tr key={x.id} className="border-t"><td className="flex items-center gap-2 py-2"><Av u={x} s={28}/>{x.name}</td><td>{x.role}</td><td>{x.plate||'—'}</td><td>{x.zone||'—'}</td><td className="text-xs">{x.off?'Suspendida':'Activa'}{x.ver&&' · Verificado'}</td><td className="space-x-1 text-right">{x.role!=='admin'&&<button className="btn2 !px-2.5 !py-1.5 text-xs" onClick={()=>up(n=>{n.users.find(y=>y.id===x.id).off=!x.off})}>{x.off?'Activar':'Suspender'}</button>}{x.role==='conductor'&&<button className="btn2 !px-2.5 !py-1.5 text-xs" onClick={()=>up(n=>{n.users.find(y=>y.id===x.id).ver=!x.ver})}>{x.ver?'Quitar ✓':'Verificar'}</button>}<button className="btn2 !px-2.5 !py-1.5" aria-label="Editar" onClick={()=>setModal({k:'edit',id:x.id})}><Pencil size={14}/></button>{x.role!=='admin'&&<button className="btn2 !px-2.5 !py-1.5 !text-red-600" aria-label="Eliminar" onClick={()=>setModal({k:'del',id:x.id})}><Trash2 size={14}/></button>}</td></tr>)}</tbody></table></div></div>
  <div className="grid gap-4 lg:grid-cols-2"><div className="card space-y-2"><h3 className="font-bold">Soporte</h3>{db.tickets.length?db.tickets.map((t,i)=><Tk key={i} c={c} t={t} i={i}/>):<p className="text-sm text-slate-500">No hay mensajes de soporte.</p>}</div>
   <div className="card space-y-2"><h3 className="font-bold">Rutas</h3><div className="flex flex-wrap gap-2">{db.routes.map(q=><span key={q.id} className="chip">{q.n} <button aria-label={'Quitar '+q.n} onClick={()=>up(n=>{n.routes=n.routes.filter(y=>y.id!==q.id)})}>✕</button></span>)}</div>
    <input className="in" placeholder="Nombre de la ruta" value={r.n} onChange={e=>setR({...r,n:e.target.value})}/><div className="grid grid-cols-2 gap-2">{['a','b'].map(k=><select key={k} className="in" value={r[k]} onChange={e=>setR({...r,[k]:e.target.value})}>{Z.map(z=><option key={z}>{z}</option>)}</select>)}</div>
    <button className="btn" onClick={()=>{if(!r.n.trim()||r.a===r.b)return say('Escribe un nombre y elige dos localidades distintas.');up(n=>{n.routes.push({id:'r'+Date.now(),n:r.n.trim(),a:r.a,b:r.b})});setR({...r,n:''})}}>Agregar ruta</button>
    <h3 className="pt-3 font-bold">Copia de seguridad</h3><div className="flex flex-wrap items-center gap-2"><button className="btn2" onClick={()=>dl(JSON.stringify(db),'btx_backup.json','application/json')}><Download size={14} className="mr-1 inline"/>Descargar</button></div></div></div></div>}

function Edit({c,id,close}){const x=c.db.users.find(y=>y.id===id),dv=x.role==='conductor',[f,setF]=useState({name:x.name,phone:x.phone,plate:x.plate||'',zone:x.zone||'',addr:x.addr||''}),s=k=>e=>setF({...f,[k]:e.target.value})
 const sv=()=>{if(!f.name.trim()||!f.phone.trim())return c.say('Nombre y celular son obligatorios.');const p=f.plate.toUpperCase();if(dv&&(!/^[A-Z0-9]{5,6}$/.test(p)||c.db.users.some(d=>d.plate===p&&d.id!==id)))return c.say('La placa debe tener 5 o 6 caracteres y no repetirse.')
  c.up(n=>{const u=n.users.find(y=>y.id===id);Object.assign(u,dv?{name:f.name,phone:f.phone,plate:p,zone:f.zone,addr:f.addr}:{name:f.name,phone:f.phone})});close()}
 return<Modal t="Editar cuenta" close={close}><div className="space-y-3"><Fld l="Nombre" value={f.name} onChange={s('name')}/><Fld l="Celular" value={f.phone} onChange={s('phone')}/>{dv&&<><Fld l="Placa" maxLength={6} value={f.plate} onChange={s('plate')}/><label className="block text-xs font-medium text-slate-500">Localidad<select className="in mt-1 !text-ink" value={f.zone} onChange={s('zone')}>{Z.map(z=><option key={z}>{z}</option>)}</select></label><Fld l="Dirección" value={f.addr} onChange={s('addr')}/></>}<button className="btn w-full" onClick={sv}>Guardar cambios</button></div></Modal>}

const EMPTY={users:[],reviews:[],tickets:[],trips:[],routes:[],session:null}
export default function App(){
 const[db,setDb]=useState(null),[toast,setToast]=useState(''),[modal,setModal]=useState(null),[th,setTh]=useState(()=>document.documentElement.dataset.theme||'light')
 const say=m=>{setToast(m);setTimeout(()=>setToast(''),3200)}
 const refresh=async()=>{try{const{data}=await sb.auth.getSession();if(!data.session)return setDb(EMPTY);const d=await loadAll(data.session.user.id),m=d.users.find(x=>x.id===d.session);if(m?.off){await sb.auth.signOut();setDb(EMPTY);say('Tu cuenta está suspendida. Contacta al administrador.')}else setDb(d)}catch(e){setDb(p=>p||EMPTY);say('No pudimos cargar los datos: '+e.message)}}
 useEffect(()=>{if(!ok)return;refresh();const tm=setTimeout(()=>setDb(p=>p||EMPTY),6000);const{data:a}=sb.auth.onAuthStateChange((ev)=>{if(ev==='PASSWORD_RECOVERY')setModal({k:'newpw'});if(ev==='SIGNED_IN'||ev==='SIGNED_OUT')setTimeout(refresh,0)});const ch=sb.channel('btx').on('postgres_changes',{event:'*',schema:'public',table:'drivers'},()=>refresh()).subscribe();return()=>{clearTimeout(tm);a.subscription.unsubscribe();sb.removeChannel(ch)}},[])
 useEffect(()=>{document.documentElement.dataset.theme=th;try{localStorage.setItem('btx-theme',th)}catch{}dispatchEvent(new Event('btx-theme'))},[th])
 if(!ok)return<div className="grid min-h-dvh place-items-center p-6 text-center"><div><h1 className="f text-2xl font-extrabold">Falta configurar Supabase</h1><p className="mt-2 text-sm text-slate-500">Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env (raíz del proyecto) y reinicia npm run dev.{cfgErr&&' Error: '+cfgErr}</p></div></div>
 if(!db)return<div role="status" className="grid min-h-dvh place-items-center text-sm text-slate-500">Cargando…</div>
 const up=f=>{const n=structuredClone(db);f(n);setDb(n);sync(db,n).then(refresh).catch(e=>{say('No se pudo guardar: '+e.message);refresh()})},me=db.users.find(x=>x.id===db.session),c={db,up,say,me,setModal,refresh,th,tog:()=>setTh(t=>t==='dark'?'light':'dark')},close=()=>setModal(null)
 return<><div key={me?.id||0} className="fade">{!me?<Auth c={c}/>:me.role==='admin'?<Admin c={c}/>:me.role==='conductor'?<Driver c={c}/>:<Passenger c={c}/>}</div>
  {modal?.k==='rate'&&<Rate c={c} p={modal.p} close={close}/>}{modal?.k==='edit'&&<Edit c={c} id={modal.id} close={close}/>}{modal?.k==='profile'&&<Profile c={c} close={close}/>}{modal?.k==='newpw'&&<NewPw c={c} close={close}/>}
  {modal?.k==='del'&&<Modal t="¿Eliminar esta cuenta?" close={close}><p className="mb-3 text-sm text-slate-500">Esta acción no se puede deshacer.</p><div className="flex gap-2"><button className="btn !bg-red-700 !text-[#fff]" onClick={()=>{up(n=>{n.users=n.users.filter(x=>x.id!==modal.id)});close()}}>Eliminar</button><button className="btn2" onClick={close}>Cancelar</button></div></Modal>}
  {toast&&<div role="status" className="rise fixed inset-x-4 bottom-6 z-[60] mx-auto max-w-sm rounded-xl bg-ink px-4 py-3 text-center text-sm text-white shadow-xl">{toast}</div>}</>}
