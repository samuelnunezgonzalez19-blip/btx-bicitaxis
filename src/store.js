export const Z=['Kennedy','Bosa','Suba','Engativá','Fontibón','Usaquén','Chapinero','Ciudad Bolívar']
export const PAY=['Efectivo','Nequi','Daviplata','Tarjeta']
export const ZC={Kennedy:[4.628,-74.152],Bosa:[4.605,-74.195],Suba:[4.742,-74.083],'Engativá':[4.705,-74.115],'Fontibón':[4.673,-74.143],'Usaquén':[4.7,-74.03],Chapinero:[4.65,-74.06],'Ciudad Bolívar':[4.545,-74.155]}
export const COL={Activo:'#16a34a','En parada':'#f59e0b','Fuera de servicio':'#64748b','Sin señal':'#dc2626'}
const K='btx5'
export const on=e=>e==='Activo'||e==='En parada'
const hm=s=>{const[a,b]=s.split(':');return+a*60+ +b}
export const eff=d=>{if(d.off)return'Fuera de servicio';if(!d.share||(!d.seed&&Date.now()-d.seen>18e5))return'Sin señal';const n=new Date(),m=n.getHours()*60+n.getMinutes(),a=hm(d.from),b=hm(d.to);return(a<=b?m>=a&&m<=b:m>=a||m<=b)?d.estado:'Fuera de servicio'}
export const km=(a,b)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(b[0]-a[0])/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(r(b[1]-a[1])/2)**2;return 12742*Math.asin(Math.sqrt(h))}
export const cop=n=>'$'+n.toLocaleString('es-CO')
export const nm=n=>{const p=n.split(' ');return p[0][0]+'. '+p.slice(1).join(' ')}
export const avg=(db,pl)=>{const r=db.reviews.filter(x=>x.p===pl);return r.length?(r.reduce((a,x)=>a+x.s,0)/r.length).toFixed(1):'—'}
export const pos=d=>{if(d.pos)return d.pos;const c=[...d.plate].reduce((a,x)=>a+x.charCodeAt(0),0),p=ZC[d.zone];return[p[0]+((c*7)%40-20)/1000,p[1]+((c*11)%40-20)/1000]}
export async function hash(p,s){if(!crypto?.subtle)return btoa(s+p);const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
export const load=()=>{try{return JSON.parse(localStorage.getItem(K))}catch{return null}}
export const save=db=>{try{localStorage.setItem(K,JSON.stringify(db))}catch{}}
export async function seed(){
 const N=['Juan Pérez','Luis Gómez','Carlos Rojas','Andrés Mora','Pedro Díaz','Mario Ruiz','José Torres','Camilo León','Iván Soto','Hugo Vargas','Nelson Pardo','Óscar Silva'],P=['KEN','BOS','SUB','ENG','FON','USA','CHA','CBO']
 const us=N.map((n,i)=>({id:'s'+i,role:'conductor',seed:1,name:n,phone:'3100000000',plate:P[i%8]+(10+i*3),zone:Z[i%8],addr:'Cra '+(70+i*4)+' #'+(10+i*3),idn:'—',from:i==7?'06:00':'00:00',to:i==7?'10:00':'23:59',estado:i%3==0?'En parada':'Activo',share:i!=5&&i!=9,ver:i%3!=1,eta:2+(i*5)%16,seen:Date.now(),pay:i%2?['Efectivo','Nequi']:['Efectivo']}))
 Object.assign(us[0],{email:'conductor@btx.co',salt:'s0',pass:await hash('Demo12345','s0')})
 const mk=async(id,role,name,email,pw)=>({id,role,name,email,phone:'3000000000',salt:id,pass:await hash(pw,id)})
 us.push(await mk('a','admin','Administrador','admin@btx.co','Admin2026'),await mk('p0','usuario','Laura Gómez','pasajero@btx.co','Demo12345'))
 const db={users:us,trips:[],reviews:[],tickets:[],session:null,routes:[{id:'r1',n:'Kennedy–Bosa',a:'Kennedy',b:'Bosa'},{id:'r2',n:'Suba–Engativá',a:'Suba',b:'Engativá'},{id:'r3',n:'Chapinero–Usaquén',a:'Chapinero',b:'Usaquén'}]}
 save(db);return db}
