import { useState, useEffect } from "react";
import { supabase } from './supabase.js'

const C = {
  bg:"#F7F5F0",ink:"#0D0D0D",white:"#FFFFFF",
  orange:"#E85D04",orangeLight:"#FF7B25",orangePale:"#FFF3EC",
  green:"#059669",greenPale:"#ECFDF5",
  red:"#DC2626",redPale:"#FEF2F2",
  blue:"#1D4ED8",bluePale:"#EFF6FF",
  purple:"#7C3AED",purplePale:"#F5F3FF",
  gold:"#D97706",goldPale:"#FFFBEB",
  muted:"#6B7280",mutedLight:"#9CA3AF",border:"#E5E0D5",card:"#FFFFFF",
  vendeurBg:"#1A1A2E",livreurBg:"#E85D04",adminBg:"#0F172A",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body,input,select,button{font-family:'Sora',sans-serif;}
  @keyframes slideUp{from{transform:translateY(70px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#D5D0C5;border-radius:4px}
  input::placeholder{color:#B0A898}
  button:active{transform:scale(0.97);}
`;

/* ═══════ PAIEMENT CONFIG ═══════ */
const PAYMENT_INFO = {
  wave:    { numero: "0759451628", nom: "Propriétaire Livra CI", label: "Wave" },
  orange:  { numero: "0759451628", nom: "Propriétaire Livra CI", label: "Orange Money" },
  mtn:     { numero: "0544796014", nom: "Propriétaire Livra CI", label: "MTN Money" },
  waveAlt: { numero: "0544796014", nom: "Propriétaire Livra CI", label: "Wave (alt)" },
};

const PLANS = [
  {
    id:"semestre", label:"6 mois", price:7000, periode:"6 mois",
    dureesMois: 6,
    desc:"Accès complet pendant 6 mois", color:C.orange, icon:"📅",
    features:["Commandes illimitées","Support WhatsApp","Tableau de bord complet","Renouvellement flexible"]
  },
  {
    id:"annuel", label:"1 an", price:12000, periode:"an",
    dureesMois: 12,
    desc:"La meilleure valeur — économisez 2 000 FCFA", color:C.purple, icon:"💎",
    features:["Commandes illimitées","Support prioritaire","Tableau de bord complet","2 000 FCFA économisés vs 6 mois"],
    popular:true
  },
];

// Alias pour compatibilité avec le reste du code (plus de plans annuels séparés)
const PLANS_ANNUELS = [];

/* ═══════ DONNÉES INITIALES ═══════ */
let ORDERS = [
  {id:"LCI-8472",vendeur:"TekNo Shop",vendeurId:"v1",client:"Adjoua Konan",clientPhone:"0701234567",product:"Robe brodée bleue",pickupAddress:"Cocody Angré Star 11, face pharmacie",deliveryAddress:"Riviera 3, Résidence Les Palmiers, Bât B",amount:15000,status:"disponible",livreurId:null,livreurName:null,livreurPhone:null,createdAt:"10:24",steps:[{label:"Commande créée",time:"10:24",done:true},{label:"Livreur assigné",time:null,done:false},{label:"Récupéré chez vendeur",time:null,done:false},{label:"En route",time:null,done:false},{label:"Livré",time:null,done:false}]},
  {id:"LCI-3391",vendeur:"Mode Abidjan",vendeurId:"v2",client:"Koffi Brou",clientPhone:"0556789012",product:"Chaussures cuir marron",pickupAddress:"Plateau, Rue du Commerce 12",deliveryAddress:"Marcory Zone 4, Immeuble Bleu appt 3",amount:22000,status:"en livraison",livreurId:"l1",livreurName:"Jean Mel.",livreurPhone:"0700111222",createdAt:"09:10",steps:[{label:"Commande créée",time:"09:10",done:true},{label:"Livreur assigné",time:"09:42",done:true},{label:"Récupéré chez vendeur",time:"10:05",done:true},{label:"En route",time:"10:45",done:true},{label:"Livré",time:null,done:false}]},
  {id:"LCI-6614",vendeur:"TekNo Shop",vendeurId:"v1",client:"Fatou Diallo",clientPhone:"0787654321",product:"Sac à main doré",pickupAddress:"Cocody Angré Star 11, face pharmacie",deliveryAddress:"Yopougon Selmer, Bloc K entrée 2",amount:18500,status:"livré",livreurId:"l2",livreurName:"Serge K.",livreurPhone:"0700333444",createdAt:"07:00",steps:[{label:"Commande créée",time:"07:00",done:true},{label:"Livreur assigné",time:"07:18",done:true},{label:"Récupéré chez vendeur",time:"07:45",done:true},{label:"En route",time:"08:30",done:true},{label:"Livré",time:"09:12",done:true}]},
  {id:"LCI-2201",vendeur:"Beauté Plus CI",vendeurId:"v3",client:"Awa Traoré",clientPhone:"0707001122",product:"Kit maquillage complet",pickupAddress:"Abobo Baoulé, derrière le marché",deliveryAddress:"Adjamé 220 logements, bloc 7",amount:9500,status:"disponible",livreurId:null,livreurName:null,livreurPhone:null,createdAt:"11:15",steps:[{label:"Commande créée",time:"11:15",done:true},{label:"Livreur assigné",time:null,done:false},{label:"Récupéré chez vendeur",time:null,done:false},{label:"En route",time:null,done:false},{label:"Livré",time:null,done:false}]},
];

// Dates helpers
function addDays(d, n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function addMonths(d, n){ const r=new Date(d); r.setMonth(r.getMonth()+n); return r; }
function dateStr(d){ return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}); }
function daysLeft(d){ const diff=new Date(d)-new Date(); return Math.max(0,Math.ceil(diff/86400000)); }
const FREE_QUOTA = 8; // Nombre de commandes gratuites avant abonnement obligatoire

// Compter les commandes utilisées par un user (vendeur = créées, livreur = acceptées)
function commandesUtilisees(u, role){
  if(role==="vendeur") return ORDERS.filter(o=>o.vendeurId===u.id).length;
  return ORDERS.filter(o=>o.livreurId===u.id).length;
}

// Un user a accès si : abonnement actif OU quota gratuit non épuisé
function isActive(u){ return u.abonnement && new Date(u.abonnement.expireAt) > new Date(); }
function hasAccess(u, role){
  if(isActive(u)) return true;
  const used = commandesUtilisees(u, role||"vendeur");
  return used < FREE_QUOTA;
}
function quotaRestant(u, role){
  return Math.max(0, FREE_QUOTA - commandesUtilisees(u, role||"vendeur"));
}

const TODAY = new Date();

let VENDEURS = [
  {id:"v1",name:"TekNo Shop",phone:"0769993260",shop:"Mode & Accessoires",joined:"Jan 2026",
   abonnement:{plan:"semestre",startAt:addMonths(TODAY,-1),expireAt:addDays(TODAY,12),montant:7000,periode:"6 mois",valide:true}},
  {id:"v2",name:"Mode Abidjan",phone:"0700998877",shop:"Vêtements Femme",joined:"Fév 2026",
   abonnement:{plan:"semestre",startAt:addMonths(TODAY,-6),expireAt:addDays(TODAY,-3),montant:7000,periode:"6 mois",valide:false}},
  {id:"v3",name:"Beauté Plus CI",phone:"0700112233",shop:"Cosmétiques",joined:"Mar 2026",
   abonnement:{plan:"annuel",startAt:addMonths(TODAY,-1),expireAt:addMonths(TODAY,11),montant:12000,periode:"an",valide:true}},
];
let LIVREURS = [
  {id:"l1",name:"Jean Mel.",phone:"0700111222",rating:4.8,livraisons:47,joined:"Jan 2026",
   abonnement:{plan:"semestre",startAt:addMonths(TODAY,-1),expireAt:addDays(TODAY,18),montant:7000,periode:"6 mois",valide:true}},
  {id:"l2",name:"Serge K.",phone:"0700333444",rating:4.9,livraisons:62,joined:"Fév 2026",
   abonnement:{plan:"annuel",startAt:addMonths(TODAY,-1),expireAt:addMonths(TODAY,11),montant:12000,periode:"an",valide:true}},
  {id:"l3",name:"Paul N.",phone:"0700555666",rating:4.7,livraisons:31,joined:"Mar 2026",
   abonnement:null},
];

// Demandes de validation paiement en attente (admin doit approuver)
let DEMANDES_PAIEMENT = [
  {id:"d1",userId:"l3",userType:"livreur",userName:"Paul N.",userPhone:"0700555666",plan:"semestre",periode:"6 mois",montant:7000,methode:"wave",reference:"WAVE-7823",soumisAt:new Date(Date.now()-3600000),statut:"en_attente"},
];

function genId(){return "LCI-"+Math.floor(1000+Math.random()*8999);}
function now(){return new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});}
function genDemId(){return "D"+Math.floor(10000+Math.random()*89999);}

const ST={
  disponible:{label:"Disponible",color:C.blue,bg:C.bluePale,icon:"📋"},
  "en livraison":{label:"En livraison",color:C.orange,bg:C.orangePale,icon:"🚀"},
  livré:{label:"Livré",color:C.green,bg:C.greenPale,icon:"✅"},
  annulé:{label:"Annulé",color:C.red,bg:C.redPale,icon:"❌"},
};

/* ═══════ COMPOSANTS UI ═══════ */
function Badge({s}){
  const c=ST[s]||ST.disponible;
  return <span style={{background:c.bg,color:c.color,padding:"5px 13px",borderRadius:24,fontSize:12,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,letterSpacing:0.3}}>{c.icon} {c.label}</span>;
}

function BtnBack({onClick,dark=false}){
  return(
    <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:8,background:dark?"rgba(255,255,255,0.15)":C.orange,border:dark?"1.5px solid rgba(255,255,255,0.28)":"none",color:C.white,borderRadius:14,padding:"12px 22px",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"'Sora',sans-serif",letterSpacing:0.2,boxShadow:dark?"none":"0 4px 16px rgba(232,93,4,0.38)"}}>← Retour</button>
  );
}

function Toast({msg,type="success",onClose}){
  useEffect(()=>{const t=setTimeout(onClose,5500);return()=>clearTimeout(t);},[]);
  const col={success:C.green,notif:C.orange,error:C.red,info:C.blue}[type]||C.green;
  const ico={success:"✅",notif:"📲",error:"❌",info:"ℹ️"}[type];
  return(
    <div style={{position:"fixed",bottom:24,left:16,right:16,maxWidth:460,margin:"0 auto",background:"#0D0D0D",border:`2px solid ${col}`,borderRadius:22,padding:"18px 20px",zIndex:9999,boxShadow:"0 20px 60px rgba(0,0,0,0.4)",animation:"slideUp .35s cubic-bezier(.34,1.56,.64,1)"}}>
      <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
        <div style={{width:42,height:42,borderRadius:13,background:col+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ico}</div>
        <div style={{flex:1}}>
          <div style={{color:col,fontWeight:800,fontSize:13,marginBottom:4}}>{type==="notif"?"📲 Notification":type==="success"?"Succès !":type==="error"?"Erreur":"Info"}</div>
          <div style={{color:"#CBD5E1",fontSize:13,lineHeight:1.65}}>{msg}</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#6B7280",cursor:"pointer",fontSize:22,lineHeight:1,padding:0,flexShrink:0}}>×</button>
      </div>
    </div>
  );
}

function Input({label,value,onChange,placeholder,type="text",mono}){
  return(
    <div style={{marginBottom:18}}>
      {label&&<div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:7,letterSpacing:0.8,textTransform:"uppercase"}}>{label}</div>}
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:14,padding:"14px 18px",fontSize:15,color:C.ink,outline:"none",boxSizing:"border-box",fontFamily:mono?"'JetBrains Mono',monospace":"'Sora',sans-serif",fontWeight:mono?700:500,background:C.white}}/>
    </div>
  );
}

/* ═══════ BADGE ABONNEMENT ═══════ */
function AboBadge({user}){
  if(!user.abonnement) return <span style={{background:C.redPale,color:C.red,padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>❌ Sans abonnement</span>;
  const ok = isActive(user);
  const jours = daysLeft(user.abonnement.expireAt);
  if(!ok) return <span style={{background:C.redPale,color:C.red,padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>🔒 Expiré</span>;
  if(jours<=5) return <span style={{background:C.goldPale,color:C.gold,padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>⚠️ {jours}j restants</span>;
  return <span style={{background:C.greenPale,color:C.green,padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>✅ Actif — {jours}j</span>;
}

/* ═══════ BANNIERE QUOTA GRATUIT ═══════ */
function BanniereQuota({user, role, onPayer}){
  if(isActive(user)) return null;
  const restant = quotaRestant(user, role);
  const utilise = commandesUtilisees(user, role);

  if(restant === 0) return null; // Mur géré ailleurs

  const pct = Math.round((utilise / FREE_QUOTA) * 100);
  const urgent = restant <= 2;

  return(
    <div style={{background: urgent ? "#FFF7ED" : C.bluePale, border:`1.5px solid ${urgent?C.orange:C.blue}30`, borderRadius:16, padding:"14px 16px", margin:"0 0 12px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div>
          <div style={{fontWeight:800,fontSize:13,color:urgent?C.orange:C.blue}}>
            {urgent ? "⚠️ Quota bientôt épuisé" : "🎁 Période d'essai gratuite"}
          </div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>
            {utilise}/{FREE_QUOTA} commandes utilisées · <strong style={{color:urgent?C.orange:C.blue}}>{restant} restante{restant>1?"s":""}</strong>
          </div>
        </div>
        <button onClick={onPayer} style={{background:urgent?C.orange:C.blue,color:C.white,border:"none",borderRadius:10,padding:"7px 12px",fontWeight:700,cursor:"pointer",fontSize:11,fontFamily:"'Sora',sans-serif",flexShrink:0,marginLeft:8}}>
          S'abonner
        </button>
      </div>
      <div style={{background:urgent?`${C.orange}25`:`${C.blue}20`,borderRadius:8,height:6,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,background:urgent?`linear-gradient(90deg,${C.orange},${C.orangeLight})`:`linear-gradient(90deg,${C.blue},#60A5FA)`,height:"100%",borderRadius:8,transition:"width .6s"}}/>
      </div>
    </div>
  );
}


function MurAbonnement({user, userType, onPayer, onLogout}){
  const expire = user.abonnement ? new Date(user.abonnement.expireAt) < new Date() : true;
  const quotaEpuise = !user.abonnement && commandesUtilisees(user, userType||"vendeur") >= FREE_QUOTA;
  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Sora',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:420,width:"100%",textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:24,background:C.redPale,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 24px"}}>🔒</div>
        <h2 style={{fontWeight:900,fontSize:24,color:C.ink,marginBottom:12,letterSpacing:-0.5}}>
          {expire && user.abonnement ? "Abonnement expiré" : quotaEpuise ? "Essai gratuit terminé" : "Abonnement requis"}
        </h2>
        <p style={{color:C.muted,fontSize:14,lineHeight:1.8,marginBottom:28}}>
          {expire && user.abonnement
            ? `Votre abonnement a expiré le ${dateStr(user.abonnement.expireAt)}. Renouvelez pour continuer.`
            : quotaEpuise
            ? `Vous avez utilisé vos ${FREE_QUOTA} commandes gratuites 🎉 Pour continuer à utiliser LIVRA CI, souscrivez à un abonnement.`
            : "Pour accéder à la plateforme LIVRA CI, vous devez souscrire à un abonnement mensuel ou annuel."}
        </p>
        {quotaEpuise && (
          <div style={{background:C.greenPale,border:`1px solid #BBF7D0`,borderRadius:14,padding:"12px 16px",marginBottom:20,fontSize:13,color:C.green,textAlign:"left"}}>
            ✅ <strong>{FREE_QUOTA} commandes gratuites</strong> utilisées · Maintenant passez à l'abonnement pour continuer sans limite !
          </div>
        )}
        <button onClick={onPayer} style={{width:"100%",background:C.orange,color:C.white,border:"none",borderRadius:16,padding:17,fontWeight:800,cursor:"pointer",fontSize:16,fontFamily:"'Sora',sans-serif",boxShadow:"0 6px 20px rgba(232,93,4,0.35)",marginBottom:14}}>
          💳 {expire && user.abonnement ? "Renouveler mon abonnement" : "Souscrire maintenant"}
        </button>
        <button onClick={onLogout} style={{width:"100%",background:"transparent",color:C.muted,border:`1.5px solid ${C.border}`,borderRadius:16,padding:14,fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"'Sora',sans-serif"}}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

/* ═══════ PAGE PAIEMENT ABONNEMENT ═══════ */
function PagePaiement({user, userType, onBack, onSubmit}){
  const [periode, setPeriode] = useState("mois");
  const [planChoisi, setPlanChoisi] = useState(null);
  const [etape, setEtape] = useState(1); // 1=choisir plan, 2=choisir methode, 3=instructions, 4=confirmation
  const [methode, setMethode] = useState(null);
  const [reference, setReference] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const plans = periode === "mois" ? PLANS : PLANS_ANNUELS;

  const submit = () => {
    if(!reference.trim()){ return; }
    setEnvoi(true);
    const dem = {
      id: genDemId(),
      userId: user.id,
      userType,
      userName: user.name,
      userPhone: user.phone,
      plan: planChoisi.id,
      periode,
      montant: planChoisi.price,
      methode,
      reference: reference.trim(),
      soumisAt: new Date(),
      statut: "en_attente",
    };
    DEMANDES_PAIEMENT.push(dem);
    setTimeout(()=>{ onSubmit(dem); }, 800);
  };

  const payInfo = methode ? PAYMENT_INFO[methode] : null;

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Sora',sans-serif"}}>
      {/* HEADER */}
      <div style={{background:C.ink,padding:"24px 20px 40px"}}>
        <div style={{marginBottom:22}}><BtnBack onClick={onBack} dark/></div>
        <h2 style={{color:C.white,fontWeight:900,fontSize:24,marginBottom:6,letterSpacing:-0.5}}>💳 Abonnement LIVRA CI</h2>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:13.5}}>Choisissez votre formule et payez en quelques secondes</p>
      </div>

      <div style={{padding:16,marginTop:-16}}>

        {/* ETAPE 1 — CHOISIR LE PLAN */}
        {etape===1 && (
          <div style={{animation:"fadeIn .3s ease"}}>

            {/* Comparatif économies */}
            <div style={{background:"linear-gradient(135deg,#0D0D0D,#1A1A2E)",borderRadius:18,padding:"18px 20px",marginBottom:20,color:C.white,textAlign:"center"}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:6,fontWeight:600,letterSpacing:0.8}}>ACCÈS COMPLET — COMMANDES ILLIMITÉES</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,.7)",lineHeight:1.8}}>
                Choisissez la durée qui vous convient.<br/>
                <strong style={{color:C.orange}}>Économisez 2 000 FCFA</strong> avec l'abonnement annuel.
              </div>
            </div>

            {PLANS.map(plan=>(
              <div key={plan.id} onClick={()=>setPlanChoisi(plan)} style={{background:C.white,borderRadius:20,padding:"22px",marginBottom:14,boxShadow:planChoisi?.id===plan.id?`0 0 0 3px ${plan.color}`:"0 2px 12px rgba(0,0,0,0.07)",cursor:"pointer",position:"relative",transition:"box-shadow .2s",border:`2px solid ${planChoisi?.id===plan.id?plan.color:C.border}`}}>
                {plan.popular&&<div style={{position:"absolute",top:-11,right:18,background:plan.color,color:C.white,fontSize:10,fontWeight:800,padding:"4px 14px",borderRadius:20,letterSpacing:0.5}}>⭐ MEILLEURE OFFRE</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{display:"flex",gap:14,alignItems:"center"}}>
                    <div style={{width:52,height:52,borderRadius:16,background:plan.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{plan.icon}</div>
                    <div>
                      <div style={{fontWeight:900,fontSize:20,color:C.ink}}>{plan.label}</div>
                      <div style={{fontSize:12,color:C.muted,marginTop:3}}>{plan.desc}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,fontSize:24,color:plan.color}}>{plan.price.toLocaleString()}</div>
                    <div style={{fontSize:11,color:C.muted,fontWeight:600}}>FCFA / {plan.periode}</div>
                    {plan.id==="annuel"&&<div style={{fontSize:10,color:C.green,fontWeight:800,marginTop:2}}>= 1 000 FCFA/mois</div>}
                    {plan.id==="semestre"&&<div style={{fontSize:10,color:C.muted,fontWeight:600,marginTop:2}}>≈ 1 167 FCFA/mois</div>}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {plan.features.map((f,i)=>(
                    <div key={i} style={{display:"flex",gap:9,alignItems:"center",fontSize:13.5,color:C.muted}}>
                      <span style={{color:plan.color,fontWeight:900,fontSize:15}}>✓</span> {f}
                    </div>
                  ))}
                </div>
                {planChoisi?.id===plan.id && (
                  <div style={{marginTop:16,background:plan.color+"15",borderRadius:12,padding:"10px 14px",fontSize:13,color:plan.color,fontWeight:800,textAlign:"center"}}>
                    ✅ Plan sélectionné — {plan.price.toLocaleString()} FCFA / {plan.periode}
                  </div>
                )}
              </div>
            ))}

            <button onClick={()=>planChoisi&&setEtape(2)} disabled={!planChoisi} style={{width:"100%",background:planChoisi?C.orange:"#D1D5DB",color:C.white,border:"none",borderRadius:16,padding:17,fontWeight:800,cursor:planChoisi?"pointer":"not-allowed",fontSize:16,fontFamily:"'Sora',sans-serif",boxShadow:planChoisi?"0 6px 20px rgba(232,93,4,0.35)":"none",marginTop:4}}>
              Continuer → Choisir le paiement
            </button>
          </div>
        )}

        {/* ETAPE 2 — CHOISIR MÉTHODE */}
        {etape===2 && planChoisi && (
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{background:C.white,borderRadius:16,padding:"16px 18px",marginBottom:20,boxShadow:"0 2px 10px rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:0.8}}>PLAN CHOISI</div>
                <div style={{fontWeight:900,color:C.ink,fontSize:16,marginTop:3}}>{planChoisi.icon} {planChoisi.label}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,fontSize:20,color:C.orange}}>{planChoisi.price.toLocaleString()}</div>
                <div style={{fontSize:11,color:C.muted}}>FCFA/{planChoisi.periode}</div>
              </div>
            </div>

            <div style={{fontWeight:800,color:C.ink,fontSize:16,marginBottom:16}}>Choisir le moyen de paiement</div>

            {[
              {id:"wave",    label:"Wave",         num:"0759451628", icon:"🌊", color:"#0B5FBF", bg:"#EBF4FF"},
              {id:"orange",  label:"Orange Money", num:"0759451628", icon:"🟠", color:"#FF6600", bg:"#FFF3EB"},
              {id:"mtn",     label:"MTN Money",    num:"0544796014", icon:"💛", color:"#FFCC00", bg:"#FFFCE8"},
              {id:"waveAlt", label:"Wave (alt)",   num:"0544796014", icon:"🌊", color:"#0B5FBF", bg:"#EBF4FF"},
            ].map(m=>(
              <div key={m.id} onClick={()=>setMethode(m.id)} style={{background:methode===m.id?m.bg:C.white,borderRadius:16,padding:"18px 20px",marginBottom:12,cursor:"pointer",border:`2px solid ${methode===m.id?m.color:C.border}`,transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{fontSize:28}}>{m.icon}</div>
                    <div>
                      <div style={{fontWeight:800,fontSize:15,color:C.ink}}>{m.label}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:m.color,fontSize:14,marginTop:2}}>{m.num}</div>
                    </div>
                  </div>
                  <div style={{width:22,height:22,borderRadius:"50%",border:`2.5px solid ${methode===m.id?m.color:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {methode===m.id&&<div style={{width:12,height:12,borderRadius:"50%",background:m.color}}/>}
                  </div>
                </div>
              </div>
            ))}

            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={()=>setEtape(1)} style={{flex:1,background:C.bg,color:C.muted,border:`1.5px solid ${C.border}`,borderRadius:14,padding:14,fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"'Sora',sans-serif"}}>← Retour</button>
              <button onClick={()=>methode&&setEtape(3)} disabled={!methode} style={{flex:2,background:methode?C.orange:"#D1D5DB",color:C.white,border:"none",borderRadius:14,padding:14,fontWeight:800,cursor:methode?"pointer":"not-allowed",fontSize:15,fontFamily:"'Sora',sans-serif",boxShadow:methode?"0 4px 14px rgba(232,93,4,0.3)":"none"}}>
                Voir les instructions →
              </button>
            </div>
          </div>
        )}

        {/* ETAPE 3 — INSTRUCTIONS DE PAIEMENT */}
        {etape===3 && planChoisi && methode && (
          <div style={{animation:"fadeIn .3s ease"}}>
            {/* Récap */}
            <div style={{background:"linear-gradient(135deg,#0D0D0D,#1A1A2E)",borderRadius:20,padding:"22px 20px",marginBottom:20,color:C.white}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",letterSpacing:1,marginBottom:12}}>RÉCAPITULATIF</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{color:"rgba(255,255,255,.7)",fontSize:14}}>Plan</span>
                <span style={{fontWeight:700,fontSize:14}}>{planChoisi.icon} {planChoisi.label}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{color:"rgba(255,255,255,.7)",fontSize:14}}>Durée</span>
                <span style={{fontWeight:700,fontSize:14}}>1 {planChoisi.periode}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:"1px solid rgba(255,255,255,.15)"}}>
                <span style={{color:"rgba(255,255,255,.7)",fontSize:14}}>Montant</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,fontSize:22,color:C.orange}}>{planChoisi.price.toLocaleString()} FCFA</span>
              </div>
            </div>

            {/* Instructions */}
            <div style={{background:C.white,borderRadius:20,padding:"22px 20px",marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
              <div style={{fontWeight:900,color:C.ink,fontSize:16,marginBottom:18}}>
                📱 Comment payer via {PAYMENT_INFO[methode]?.label}
              </div>

              {[
                {n:"1",text:`Ouvrez votre application ${PAYMENT_INFO[methode]?.label} sur votre téléphone`},
                {n:"2",text:`Appuyez sur "Envoyer de l'argent"`},
                {n:"3",text:<>Entrez le numéro : <strong style={{fontFamily:"'JetBrains Mono',monospace",color:C.orange,fontSize:16}}>{PAYMENT_INFO[methode]?.numero}</strong></>},
                {n:"4",text:<>Saisissez le montant : <strong style={{fontFamily:"'JetBrains Mono',monospace",color:C.orange}}>{planChoisi.price.toLocaleString()} FCFA</strong></>},
                {n:"5",text:"Ajoutez comme commentaire : \"LIVRA CI - Abonnement\""},
                {n:"6",text:"Confirmez l'envoi et notez le numéro de référence de transaction"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:C.orange,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,flexShrink:0}}>{s.n}</div>
                  <div style={{fontSize:14,color:C.ink,lineHeight:1.7,paddingTop:4}}>{s.text}</div>
                </div>
              ))}

              <div style={{background:C.orangePale,border:`1px solid ${C.orange}30`,borderRadius:12,padding:"12px 16px",marginTop:8,fontSize:13,color:C.orange,lineHeight:1.7}}>
                ⚠️ <strong>Important :</strong> Votre accès sera activé manuellement après vérification par l'équipe LIVRA CI (sous 24h max).
              </div>
            </div>

            {/* Saisie de la référence */}
            <div style={{background:C.white,borderRadius:20,padding:"22px 20px",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",marginBottom:16}}>
              <div style={{fontWeight:800,color:C.ink,fontSize:15,marginBottom:16}}>📝 Saisir votre référence de paiement</div>
              <Input
                label="Référence de transaction"
                value={reference}
                onChange={setReference}
                placeholder="Ex: WAVE-123456 ou TXN-789012"
                mono
              />
              <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginTop:-8}}>
                Cette référence nous permet de vérifier votre paiement rapidement.
              </div>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setEtape(2)} style={{flex:1,background:C.bg,color:C.muted,border:`1.5px solid ${C.border}`,borderRadius:14,padding:14,fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"'Sora',sans-serif"}}>← Retour</button>
              <button onClick={submit} disabled={!reference.trim()||envoi} style={{flex:2,background:reference.trim()&&!envoi?C.green:"#D1D5DB",color:C.white,border:"none",borderRadius:14,padding:14,fontWeight:800,cursor:reference.trim()&&!envoi?"pointer":"not-allowed",fontSize:15,fontFamily:"'Sora',sans-serif",boxShadow:reference.trim()?"0 4px 14px rgba(5,150,105,0.3)":"none"}}>
                {envoi?"⏳ Envoi...":"✅ Soumettre ma demande"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ═══════ CONFIRMATION PAIEMENT ═══════ */
function ConfirmationPaiement({demande, onBack}){
  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Sora',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:420,width:"100%",textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:24,background:C.goldPale,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 24px"}}>⏳</div>
        <h2 style={{fontWeight:900,fontSize:22,color:C.ink,marginBottom:12}}>Demande soumise !</h2>
        <p style={{color:C.muted,fontSize:14,lineHeight:1.8,marginBottom:24}}>
          Votre paiement est en cours de vérification. L'équipe LIVRA CI activera votre compte sous <strong>24 heures maximum</strong>.
        </p>
        <div style={{background:C.white,borderRadius:18,padding:"20px",marginBottom:24,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",textAlign:"left"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:0.8,marginBottom:12}}>VOTRE DEMANDE</div>
          {[
            ["Plan",`${demande.montant.toLocaleString()} FCFA / ${demande.periode}`],
            ["Méthode",demande.methode.toUpperCase()],
            ["Référence",demande.reference],
            ["Statut","En attente de validation"],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
              <span style={{color:C.muted,fontWeight:600}}>{k}</span>
              <span style={{color:C.ink,fontWeight:700,fontFamily:k==="Référence"?"'JetBrains Mono',monospace":"inherit"}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.greenPale,border:`1px solid #BBF7D0`,borderRadius:14,padding:"14px 16px",marginBottom:24,fontSize:13,color:C.green,lineHeight:1.7}}>
          📲 Une fois validé, vous recevrez un SMS de confirmation sur votre numéro {demande.userPhone}.
        </div>
        <button onClick={onBack} style={{width:"100%",background:C.ink,color:C.white,border:"none",borderRadius:16,padding:16,fontWeight:800,cursor:"pointer",fontSize:15,fontFamily:"'Sora',sans-serif"}}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

/* ═══════ MON ABONNEMENT (dans le dashboard) ═══════ */
function MonAbonnement({user, onRenouveler}){
  const abo = user.abonnement;
  const actif = isActive(user);
  const jours = abo ? daysLeft(abo.expireAt) : 0;
  const planInfo = [...PLANS, ...PLANS_ANNUELS].find(p=>p.id===abo?.plan || p.planRef===abo?.plan);

  return(
    <div style={{background:C.white,borderRadius:22,padding:"22px 20px",boxShadow:"0 4px 24px rgba(0,0,0,0.09)",margin:"0 0 16px"}}>
      <div style={{fontWeight:900,color:C.ink,fontSize:16,marginBottom:18}}>💳 Mon abonnement</div>

      {!abo ? (
        <div style={{textAlign:"center",padding:"24px 0"}}>
          <div style={{fontSize:40,marginBottom:12}}>🔓</div>
          <div style={{fontWeight:700,color:C.ink,marginBottom:16}}>Aucun abonnement actif</div>
          <button onClick={onRenouveler} style={{background:C.orange,color:C.white,border:"none",borderRadius:14,padding:"14px 28px",fontWeight:800,cursor:"pointer",fontSize:15,fontFamily:"'Sora',sans-serif",boxShadow:"0 4px 14px rgba(232,93,4,0.3)"}}>
            Souscrire maintenant →
          </button>
        </div>
      ) : (
        <>
          <div style={{background:actif?C.greenPale:C.redPale,borderRadius:14,padding:"16px 18px",marginBottom:16,border:`1.5px solid ${actif?"#BBF7D0":C.red+"30"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontWeight:800,fontSize:15,color:actif?C.green:C.red}}>
                {actif?"✅ Actif":"❌ Expiré"}
              </div>
              <AboBadge user={user}/>
            </div>
            {[
              ["Plan",planInfo?`${planInfo.icon} ${planInfo.label}`:abo.plan],
              ["Montant",`${abo.montant?.toLocaleString()} FCFA / ${abo.periode}`],
              ["Début",dateStr(abo.startAt)],
              ["Expiration",dateStr(abo.expireAt)],
              actif?["Jours restants",`${jours} jour${jours>1?"s":""}`]:["Statut","Accès bloqué"],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderBottom:`1px solid ${actif?"#BBF7D0":C.red+"20"}`}}>
                <span style={{color:actif?C.green:C.red,opacity:0.7,fontWeight:600}}>{k}</span>
                <span style={{fontWeight:700,color:actif?C.green:C.red}}>{v}</span>
              </div>
            ))}
          </div>

          {/* Barre de progression */}
          {actif && abo.startAt && abo.expireAt && (()=>{
            const total = new Date(abo.expireAt)-new Date(abo.startAt);
            const elapsed = new Date()-new Date(abo.startAt);
            const pct = Math.min(100,Math.max(0,Math.round((elapsed/total)*100)));
            return(
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>
                  <span>Progression</span>
                  <span>{pct}% utilisé</span>
                </div>
                <div style={{background:C.border,borderRadius:10,height:8,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,background:pct>80?`linear-gradient(90deg,${C.red},#F87171)`:`linear-gradient(90deg,${C.green},#34D399)`,height:"100%",borderRadius:10,transition:"width .8s"}}/>
                </div>
              </div>
            );
          })()}

          <button onClick={onRenouveler} style={{width:"100%",background:actif?C.bg:C.orange,color:actif?C.ink:C.white,border:actif?`1.5px solid ${C.border}`:"none",borderRadius:14,padding:"13px",fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"'Sora',sans-serif",boxShadow:actif?"none":"0 4px 14px rgba(232,93,4,0.3)"}}>
            {actif?"🔄 Renouveler en avance":"🔓 Renouveler l'accès"}
          </button>
        </>
      )}
    </div>
  );
}

/* ═══════ LANDING ═══════ */
function Landing({onNav}){
  const [code,setCode]=useState("");
  return(
    <div style={{fontFamily:"'Sora',sans-serif",background:C.bg,minHeight:"100vh"}}>
      <nav style={{background:C.white,borderBottom:`1px solid ${C.border}`,height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 12px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:11,background:C.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🚚</div>
          <span style={{fontWeight:900,fontSize:20,color:C.ink,letterSpacing:-0.5}}>LIVRA<span style={{color:C.orange}}>CI</span></span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>onNav("auth-vendeur")} style={{background:"transparent",border:`1.5px solid ${C.border}`,color:C.ink,borderRadius:12,padding:"8px 14px",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif"}}>Vendeur</button>
          <button onClick={()=>onNav("auth-livreur")} style={{background:C.orange,border:"none",color:C.white,borderRadius:12,padding:"8px 14px",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif",boxShadow:"0 3px 12px rgba(232,93,4,0.35)"}}>Livreur</button>
          <button onClick={()=>onNav("auth-admin")} style={{background:C.adminBg,border:"none",color:C.white,borderRadius:12,padding:"8px 14px",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif"}}>Admin</button>
        </div>
      </nav>

      <div style={{background:"linear-gradient(145deg,#0E1623 0%,#1B0F3A 100%)",padding:"60px 24px 80px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle at 15% 60%,rgba(232,93,4,.2) 0%,transparent 50%),radial-gradient(circle at 85% 20%,rgba(124,58,237,.15) 0%,transparent 45%)`}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(232,93,4,.15)",border:"1px solid rgba(232,93,4,.3)",color:"#FF9A4D",padding:"6px 16px",borderRadius:24,fontSize:11,fontWeight:700,marginBottom:24,letterSpacing:1.2}}>
            🇨🇮 PLATEFORME N°1 EN CÔTE D'IVOIRE
          </div>
          <h1 style={{fontSize:"clamp(32px,8vw,56px)",fontWeight:900,color:C.white,lineHeight:1.08,marginBottom:18,letterSpacing:-1.5}}>
            Vendeurs & Livreurs<br/><span style={{color:C.orange}}>enfin réunis.</span>
          </h1>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:15,maxWidth:400,margin:"0 auto 40px",lineHeight:1.8}}>
            Postez votre commande, n'importe quel livreur sur la plateforme la prend en charge.
          </p>
          <div style={{background:C.white,borderRadius:22,padding:"22px 22px 20px",maxWidth:420,margin:"0 auto 32px",boxShadow:"0 12px 40px rgba(0,0,0,0.25)"}}>
            <div style={{fontWeight:800,color:C.ink,marginBottom:14,fontSize:15,textAlign:"left"}}>📦 Suivre mon colis</div>
            <div style={{display:"flex",gap:10}}>
              <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="LCI-XXXX"
                style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:13,padding:"13px 16px",fontSize:16,color:C.ink,outline:"none",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,letterSpacing:2,background:C.bg}}/>
              <button onClick={()=>code&&onNav("track",code)} style={{background:C.orange,color:C.white,border:"none",borderRadius:13,padding:"13px 22px",fontWeight:800,cursor:"pointer",fontSize:18,fontFamily:"'Sora',sans-serif",boxShadow:"0 4px 14px rgba(232,93,4,0.4)"}}>→</button>
            </div>
          </div>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>onNav("auth-vendeur")} style={{background:C.orange,color:C.white,border:"none",borderRadius:16,padding:"15px 32px",fontWeight:800,cursor:"pointer",fontSize:15,fontFamily:"'Sora',sans-serif",boxShadow:"0 6px 20px rgba(232,93,4,0.45)"}}>🛍️ Je suis Vendeur</button>
            <button onClick={()=>onNav("auth-livreur")} style={{background:"rgba(255,255,255,.09)",color:C.white,border:"2px solid rgba(255,255,255,.25)",borderRadius:16,padding:"15px 32px",fontWeight:700,cursor:"pointer",fontSize:15,fontFamily:"'Sora',sans-serif"}}>🚴 Je suis Livreur</button>
          </div>
        </div>
      </div>

      {/* Tarifs aperçu */}
      <div style={{padding:"40px 20px 24px",maxWidth:580,margin:"0 auto"}}>
        <h2 style={{textAlign:"center",fontWeight:900,fontSize:24,color:C.ink,marginBottom:6}}>Nos abonnements</h2>
        <p style={{textAlign:"center",color:C.muted,marginBottom:28,fontSize:13}}>Accès complet, commandes illimitées — paiement Mobile Money</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,maxWidth:360,margin:"0 auto"}}>
          {PLANS.map(p=>(
            <div key={p.id} style={{background:C.white,borderRadius:20,padding:"22px 16px",textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",border:`2px solid ${p.popular?p.color:C.border}`,position:"relative"}}>
              {p.popular&&<div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:p.color,color:C.white,fontSize:9,fontWeight:800,padding:"3px 12px",borderRadius:20,whiteSpace:"nowrap"}}>⭐ MEILLEURE OFFRE</div>}
              <div style={{fontSize:28,marginBottom:10}}>{p.icon}</div>
              <div style={{fontWeight:900,fontSize:15,color:C.ink,marginBottom:4}}>{p.label}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,fontSize:26,color:p.color,marginBottom:2}}>{(p.price/1000).toFixed(0)}K</div>
              <div style={{fontSize:11,color:C.muted,fontWeight:600}}>FCFA / {p.periode}</div>
              {p.id==="annuel"&&<div style={{fontSize:10,color:C.green,fontWeight:800,marginTop:6,background:C.greenPale,borderRadius:8,padding:"3px 8px",display:"inline-block"}}>= 1 000 FCFA/mois</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{textAlign:"center",padding:"24px 20px",color:C.mutedLight,fontSize:12,borderTop:`1px solid ${C.border}`,marginTop:8}}>
        © 2026 LIVRA CI · Made in 🇨🇮 Abidjan
      </div>
    </div>
  );
}

/* ═══════ AUTH ═══════ */
function Auth({type,onAuth,onBack}){
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({name:"",phone:"",shop:"",password:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const isV=type==="vendeur";
  const isA=type==="admin";
  const hBg=isA?C.adminBg:isV?C.vendeurBg:C.livreurBg;

  const submit=async()=>{
    if(isA){
      if(form.phone==="admin"&&form.password==="admin123"){
        onAuth({id:"admin",name:"Administrateur",phone:"admin"},"admin");
      } return;
    }
    if(!form.phone||!form.password)return;
    if(mode==="register"){
      if(isV){
        const v={id:"v"+Date.now(),name:form.name||"Ma Boutique",phone:form.phone,shop:form.shop||"Boutique en ligne",joined:"Mai 2026",abonnement:null};
        await supabase.from('vendeurs').insert(v);
        onAuth(v,"vendeur");
      }else{
        const l={id:"l"+Date.now(),name:form.name||"Livreur",phone:form.phone,rating:5.0,livraisons:0,joined:"Mai 2026",abonnement:null};
        await supabase.from('livreurs').insert(l);
        onAuth(l,"livreur");
      }
    }else{
      const table=isV?'vendeurs':'livreurs';
      const {data}=await supabase.from(table).select('*').eq('phone',form.phone).single();
      if(data) onAuth(data,type);
      else alert("Numéro introuvable. Vérifiez ou inscrivez-vous.");
    }
  };

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Sora',sans-serif"}}>
      <div style={{background:hBg,padding:"28px 22px 68px"}}>
        <div style={{marginBottom:30}}><BtnBack onClick={onBack} dark/></div>
        <div style={{fontSize:48,marginBottom:14}}>{isA?"🔐":isV?"🛍️":"🚴"}</div>
        <h2 style={{color:C.white,fontWeight:900,fontSize:26,marginBottom:6,letterSpacing:-0.5}}>{isA?"Administration":mode==="register"?"Créer mon compte":"Se connecter"}</h2>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:14}}>Espace {isA?"Admin":isV?"Vendeur":"Livreur"}</p>
      </div>
      <div style={{background:C.white,borderRadius:"28px 28px 0 0",marginTop:-28,padding:"34px 26px 48px",minHeight:"60vh"}}>
        {!isA&&mode==="register"&&<Input label="Nom complet" value={form.name} onChange={v=>set("name",v)} placeholder={isV?"Nom de votre boutique":"Votre prénom et nom"}/>}
        {isV&&mode==="register"&&<Input label="Type de boutique" value={form.shop} onChange={v=>set("shop",v)} placeholder="Ex: Mode femme, Électronique..."/>}
        <Input label={isA?"Identifiant admin":"Numéro de téléphone"} value={form.phone} onChange={v=>set("phone",v)} placeholder={isA?"admin":"07 XX XX XX XX"} type={isA?"text":"tel"} mono/>
        <Input label="Mot de passe" value={form.password} onChange={v=>set("password",v)} placeholder="••••••••" type="password"/>
        {isA&&<div style={{background:C.bluePale,borderRadius:12,padding:"10px 14px",fontSize:12,color:C.blue,marginBottom:18}}>ℹ️ Accès réservé à l'administrateur de la plateforme.</div>}
        <button onClick={submit} style={{width:"100%",background:hBg,color:C.white,border:"none",borderRadius:16,padding:17,fontWeight:800,cursor:"pointer",fontSize:16,marginBottom:18,marginTop:10,fontFamily:"'Sora',sans-serif",letterSpacing:0.3}}>
          {isA?"Accéder →":mode==="register"?"Créer mon compte →":"Se connecter →"}
        </button>
        {!isA&&<div style={{textAlign:"center",color:C.muted,fontSize:14}}>
          {mode==="register"?"Déjà inscrit ? ":"Pas de compte ? "}
          <button onClick={()=>setMode(m=>m==="login"?"register":"login")} style={{background:"none",border:"none",color:isV?C.vendeurBg:C.orange,fontWeight:700,cursor:"pointer",fontSize:14,textDecoration:"underline",fontFamily:"'Sora',sans-serif"}}>
            {mode==="register"?"Se connecter":"S'inscrire"}
          </button>
        </div>}
      </div>
    </div>
  );
}

/* ═══════ ADMIN DASHBOARD ═══════ */
function AdminDash({user, onLogout, onToast}){
  const [tab, setTab] = useState("demandes");
  const [tick, setTick] = useState(0);

  const totalRevenu = [...VENDEURS,...LIVREURS].filter(u=>isActive(u)).reduce((s,u)=>s+(u.abonnement?.montant||0),0);
  const totalActifs = [...VENDEURS,...LIVREURS].filter(u=>isActive(u)).length;
  const totalExpires = [...VENDEURS,...LIVREURS].filter(u=>u.abonnement&&!isActive(u)).length;
  const totalSansAbo = [...VENDEURS,...LIVREURS].filter(u=>!u.abonnement).length;
  const demandesEnAttente = DEMANDES_PAIEMENT.filter(d=>d.statut==="en_attente");

  const valider = (dem) => {
    dem.statut = "validé";
    const db = dem.userType==="vendeur" ? VENDEURS : LIVREURS;
    const u = db.find(x=>x.id===dem.userId);
    if(u){
      const planInfo = PLANS.find(p=>p.id===dem.plan);
      const mois = planInfo?.dureesMois || (dem.periode==="an" ? 12 : 6);
      const start = new Date();
      const expire = addMonths(start, mois);
      u.abonnement = { plan:dem.plan, startAt:start, expireAt:expire, montant:dem.montant, periode:dem.periode, valide:true };
    }
    setTick(t=>t+1);
    onToast(`✅ Abonnement de ${dem.userName} activé !`,"success");
  };

  const rejeter = (dem) => {
    dem.statut = "rejeté";
    setTick(t=>t+1);
    onToast(`Demande de ${dem.userName} rejetée.`,"error");
  };

  const bloquer = (u, type) => {
    if(u.abonnement){ u.abonnement.expireAt = new Date(Date.now()-1); }
    setTick(t=>t+1);
    onToast(`Accès de ${u.name} bloqué.`,"info");
  };

  const debloquer = (u, type) => {
    if(!u.abonnement) u.abonnement = { plan:"semestre", startAt:new Date(), expireAt:addMonths(new Date(),6), montant:0, periode:"6 mois", valide:true };
    else u.abonnement.expireAt = addMonths(new Date(), 6);
    setTick(t=>t+1);
    onToast(`Accès de ${u.name} débloqué (6 mois).`,"success");
  };

  const tabs = [
    {id:"demandes", label:`⏳ Demandes${demandesEnAttente.length>0?` (${demandesEnAttente.length})`:""}`, dot:demandesEnAttente.length>0},
    {id:"vendeurs", label:"🛍️ Vendeurs"},
    {id:"livreurs", label:"🚴 Livreurs"},
    {id:"stats", label:"📊 Stats"},
  ];

  const renderUser = (u, type) => {
    const used = commandesUtilisees(u, type);
    const enEssai = !u.abonnement || !isActive(u);
    return(
    <div key={u.id} style={{background:C.white,borderRadius:16,padding:"16px 18px",marginBottom:10,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontWeight:800,fontSize:15,color:C.ink}}>{u.name}</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:C.muted,fontSize:13}}>{u.phone}</div>
          {type==="vendeur"&&<div style={{fontSize:12,color:C.muted,marginTop:2}}>{u.shop}</div>}
          {type==="livreur"&&<div style={{fontSize:12,color:C.muted,marginTop:2}}>⭐ {u.rating} · {u.livraisons} livraisons</div>}
        </div>
        <AboBadge user={u}/>
      </div>
      {/* Quota gratuit si pas d'abonnement actif */}
      {enEssai && (
        <div style={{background:used>=FREE_QUOTA?C.redPale:C.bluePale,borderRadius:10,padding:"8px 12px",fontSize:12,marginBottom:10,border:`1px solid ${used>=FREE_QUOTA?C.red+"30":C.blue+"30"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{color:used>=FREE_QUOTA?C.red:C.blue,fontWeight:700}}>{used>=FREE_QUOTA?"🔒 Quota épuisé":"🎁 Essai gratuit"}</span>
            <span style={{fontWeight:900,color:used>=FREE_QUOTA?C.red:C.blue}}>{used}/{FREE_QUOTA}</span>
          </div>
          <div style={{background:used>=FREE_QUOTA?`${C.red}30`:`${C.blue}25`,borderRadius:6,height:5}}>
            <div style={{width:`${Math.min(100,Math.round((used/FREE_QUOTA)*100))}%`,background:used>=FREE_QUOTA?C.red:C.blue,height:"100%",borderRadius:6}}/>
          </div>
        </div>
      )}
      {u.abonnement&&(
        <div style={{background:C.bg,borderRadius:10,padding:"8px 12px",fontSize:12,color:C.muted,marginBottom:10}}>
          <div>Plan : <strong style={{color:C.ink}}>{u.abonnement.plan}</strong> · {u.abonnement.montant?.toLocaleString()} FCFA/{u.abonnement.periode}</div>
          <div>Expiration : <strong style={{color:isActive(u)?C.green:C.red}}>{dateStr(u.abonnement.expireAt)}</strong>
            {isActive(u)&&<span style={{color:C.green}}> ({daysLeft(u.abonnement.expireAt)}j restants)</span>}
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        {isActive(u)
          ? <button onClick={()=>bloquer(u,type)} style={{flex:1,background:C.redPale,color:C.red,border:"none",borderRadius:10,padding:"9px",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif"}}>🔒 Bloquer l'accès</button>
          : <button onClick={()=>debloquer(u,type)} style={{flex:1,background:C.greenPale,color:C.green,border:"none",borderRadius:10,padding:"9px",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif"}}>🔓 Débloquer (+1 mois)</button>
        }
      </div>
    </div>
  );}

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Sora',sans-serif"}}>
      {/* HEADER */}
      <div style={{background:C.adminBg,borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"0 20px",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <div>
            <div style={{fontWeight:800,fontSize:15,color:C.white}}>🔐 Admin Panel</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>LIVRA CI · Tableau de bord</div>
          </div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,.1)",border:"none",color:C.white,borderRadius:12,padding:"9px 13px",cursor:"pointer",fontSize:15}}>⏻</button>
        </div>
        {/* Stats rapides */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,paddingBottom:16}}>
          {[
            {label:"Actifs",val:totalActifs,color:"#34D399"},
            {label:"Expirés",val:totalExpires,color:C.red},
            {label:"Sans abo",val:totalSansAbo,color:"rgba(255,255,255,.4)"},
            {label:"En attente",val:demandesEnAttente.length,color:C.orange},
          ].map(s=>(
            <div key={s.label} style={{background:"rgba(255,255,255,.07)",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontWeight:900,fontSize:20,color:s.color}}>{s.val}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2,fontWeight:600}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:C.white,borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:"0 0 auto",padding:"13px 16px",background:"none",border:"none",borderBottom:`3px solid ${tab===t.id?C.orange:"transparent"}`,color:tab===t.id?C.orange:C.muted,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'Sora',sans-serif",position:"relative",whiteSpace:"nowrap"}}>
            {t.label}
            {t.dot&&<span style={{position:"absolute",top:6,right:8,width:7,height:7,borderRadius:"50%",background:C.red}}/>}
          </button>
        ))}
      </div>

      <div style={{padding:16}}>

        {/* DEMANDES DE PAIEMENT */}
        {tab==="demandes"&&(
          <div>
            <div style={{fontWeight:800,color:C.ink,fontSize:16,marginBottom:16}}>
              Demandes de validation paiement
            </div>
            {DEMANDES_PAIEMENT.length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",background:C.white,borderRadius:18}}>
                <div style={{fontSize:40,marginBottom:12}}>📭</div>
                <div style={{fontWeight:700,color:C.ink}}>Aucune demande</div>
              </div>
            )}
            {DEMANDES_PAIEMENT.map(d=>(
              <div key={d.id} style={{background:C.white,borderRadius:18,padding:"18px",marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",border:`2px solid ${d.statut==="en_attente"?C.orange+"40":d.statut==="validé"?C.green+"40":C.red+"40"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{fontWeight:900,fontSize:15,color:C.ink}}>{d.userName}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.muted}}>{d.userPhone}</div>
                    <div style={{fontSize:12,color:C.muted,marginTop:2,textTransform:"capitalize"}}>{d.userType}</div>
                  </div>
                  <div style={{background:d.statut==="en_attente"?C.goldPale:d.statut==="validé"?C.greenPale:C.redPale,color:d.statut==="en_attente"?C.gold:d.statut==="validé"?C.green:C.red,padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:800}}>
                    {d.statut==="en_attente"?"⏳ En attente":d.statut==="validé"?"✅ Validé":"❌ Rejeté"}
                  </div>
                </div>
                <div style={{background:C.bg,borderRadius:12,padding:"12px 14px",fontSize:13,lineHeight:2,marginBottom:d.statut==="en_attente"?12:0}}>
                  <div>Plan : <strong style={{color:C.ink}}>{d.plan}</strong> · <strong style={{color:C.orange,fontFamily:"'JetBrains Mono',monospace"}}>{d.montant.toLocaleString()} FCFA/{d.periode}</strong></div>
                  <div>Méthode : <strong>{d.methode.toUpperCase()}</strong></div>
                  <div>Référence : <strong style={{fontFamily:"'JetBrains Mono',monospace",color:C.blue}}>{d.reference}</strong></div>
                  <div>Soumis : {new Date(d.soumisAt).toLocaleString("fr-FR")}</div>
                </div>
                {d.statut==="en_attente"&&(
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>valider(d)} style={{flex:1,background:C.green,color:C.white,border:"none",borderRadius:12,padding:"11px",fontWeight:800,cursor:"pointer",fontSize:14,fontFamily:"'Sora',sans-serif",boxShadow:"0 3px 10px rgba(5,150,105,0.3)"}}>✅ Valider</button>
                    <button onClick={()=>rejeter(d)} style={{flex:1,background:C.redPale,color:C.red,border:"none",borderRadius:12,padding:"11px",fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"'Sora',sans-serif"}}>❌ Rejeter</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VENDEURS */}
        {tab==="vendeurs"&&(
          <div>
            <div style={{fontWeight:800,color:C.ink,fontSize:16,marginBottom:16}}>Vendeurs inscrits ({VENDEURS.length})</div>
            {VENDEURS.map(u=>renderUser(u,"vendeur"))}
          </div>
        )}

        {/* LIVREURS */}
        {tab==="livreurs"&&(
          <div>
            <div style={{fontWeight:800,color:C.ink,fontSize:16,marginBottom:16}}>Livreurs inscrits ({LIVREURS.length})</div>
            {LIVREURS.map(u=>renderUser(u,"livreur"))}
          </div>
        )}

        {/* STATS */}
        {tab==="stats"&&(
          <div>
            <div style={{fontWeight:800,color:C.ink,fontSize:16,marginBottom:16}}>Statistiques globales</div>
            <div style={{background:C.white,borderRadius:20,padding:"22px",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",marginBottom:14}}>
              <div style={{fontWeight:800,color:C.ink,marginBottom:18}}>💰 Revenus abonnements actifs</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,fontSize:32,color:C.green}}>{totalRevenu.toLocaleString()} FCFA</div>
              <div style={{fontSize:13,color:C.muted,marginTop:4}}>Total encaissé sur les abonnements actifs</div>
            </div>
            {[
              {label:"Total inscrits"          ,val:VENDEURS.length+LIVREURS.length,icon:"👥",color:C.blue},
              {label:"Vendeurs actifs"          ,val:VENDEURS.filter(isActive).length,icon:"🛍️",color:C.vendeurBg},
              {label:"Livreurs actifs"          ,val:LIVREURS.filter(isActive).length,icon:"🚴",color:C.orange},
              {label:"En essai gratuit"         ,val:[...VENDEURS,...LIVREURS].filter(u=>!isActive(u)&&commandesUtilisees(u,VENDEURS.includes(u)?"vendeur":"livreur")<FREE_QUOTA).length,icon:"🎁",color:C.blue},
              {label:"Quota épuisé (à convertir)",val:[...VENDEURS,...LIVREURS].filter(u=>!isActive(u)&&commandesUtilisees(u,VENDEURS.includes(u)?"vendeur":"livreur")>=FREE_QUOTA).length,icon:"🔒",color:C.red},
              {label:"Abonnements expirés"      ,val:[...VENDEURS,...LIVREURS].filter(u=>u.abonnement&&!isActive(u)).length,icon:"⏰",color:C.red},
              {label:"Demandes en attente"      ,val:DEMANDES_PAIEMENT.filter(d=>d.statut==="en_attente").length,icon:"⏳",color:C.gold},
              {label:"Total commandes"          ,val:ORDERS.length,icon:"📦",color:C.ink},
              {label:"Livraisons terminées"     ,val:ORDERS.filter(o=>o.status==="livré").length,icon:"✅",color:C.green},
            ].map(s=>(
              <div key={s.label} style={{background:C.white,borderRadius:14,padding:"14px 18px",marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <span style={{fontSize:20}}>{s.icon}</span>
                  <span style={{fontWeight:600,fontSize:14,color:C.ink}}>{s.label}</span>
                </div>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,fontSize:20,color:s.color}}>{s.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ VENDEUR DASH ═══════ */
function VendeurDash({user,onLogout,onToast,onPayer}){
  const [showModal,setShowModal]=useState(false);
  const [tab,setTab]=useState("commandes");
  const [tick,setTick]=useState(0);
  const mine=ORDERS.filter(o=>o.vendeurId===user.id);
  const stats=[{icon:"📦",label:"Total",val:mine.length,color:C.ink},{icon:"🚀",label:"En cours",val:mine.filter(o=>o.status==="en livraison").length,color:C.orange},{icon:"✅",label:"Livrées",val:mine.filter(o=>o.status==="livré").length,color:C.green}];
  const quotaOk = isActive(user) || quotaRestant(user,"vendeur") > 0;

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Sora',sans-serif"}}>
      <div style={{background:C.vendeurBg,borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,zIndex:50}}>
        <div style={{height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px"}}>
          <div>
            <div style={{fontWeight:800,fontSize:15,color:C.white}}>🛍️ {user.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginTop:1}}>{user.shop} · <AboBadge user={user}/></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>quotaOk?setShowModal(true):onPayer()}
              style={{background:quotaOk?C.orange:"#6B7280",color:C.white,border:"none",borderRadius:12,padding:"9px 14px",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif",boxShadow:quotaOk?"0 3px 12px rgba(232,93,4,0.4)":"none"}}>
              {quotaOk?"+ Commande":"🔒 Quota épuisé"}
            </button>
            <button onClick={onLogout} style={{background:"rgba(255,255,255,.1)",border:"none",color:C.white,borderRadius:12,padding:"9px 13px",cursor:"pointer",fontSize:15}}>⏻</button>
          </div>
        </div>
        <div style={{display:"flex",background:"rgba(0,0,0,.15)",borderRadius:"14px 14px 0 0",overflow:"hidden"}}>
          {[["commandes","📦 Mes commandes"],["abonnement","💳 Abonnement"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,background:tab===id?C.white:"transparent",color:tab===id?C.vendeurBg:"rgba(255,255,255,.7)",border:"none",padding:"12px 8px",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'Sora',sans-serif"}}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:16}}>
        {tab==="commandes"&&(
          <>
            <BanniereQuota user={user} role="vendeur" onPayer={onPayer}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {stats.map(s=>(
                <div key={s.label} style={{background:C.white,borderRadius:14,padding:"14px 8px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontWeight:900,fontSize:22,color:s.color}}>{s.val}</div>
                  <div style={{color:C.muted,fontSize:11,marginTop:2,fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>
            {mine.length===0?(
              <div style={{textAlign:"center",padding:"50px 20px",background:C.white,borderRadius:20}}>
                <div style={{fontSize:48,marginBottom:14}}>📭</div>
                <div style={{fontWeight:800,color:C.ink,marginBottom:8,fontSize:17}}>Aucune commande</div>
                <div style={{color:C.muted,fontSize:14}}>Appuyez sur "+ Commande" pour commencer</div>
              </div>
            ):mine.map(o=>(
              <div key={o.id} style={{background:C.white,borderRadius:18,padding:"18px 20px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,color:C.orange,fontSize:16,marginBottom:3}}>{o.id}</div>
                    <div style={{fontWeight:700,color:C.ink,fontSize:15}}>{o.client}</div>
                    <div style={{color:C.muted,fontSize:12.5,marginTop:2}}>{o.product}</div>
                  </div>
                  <Badge s={o.status}/>
                </div>
                <div style={{background:C.bg,borderRadius:12,padding:"12px 14px",fontSize:13.5,color:C.muted,lineHeight:2}}>
                  <div>📤 <b style={{color:C.ink}}>Retrait :</b> {o.pickupAddress}</div>
                  <div>📍 <b style={{color:C.ink}}>Livraison :</b> {o.deliveryAddress}</div>
                  <div>💰 <b style={{color:C.orange}}>{o.amount.toLocaleString()} FCFA</b></div>
                  {o.livreurName&&<div>🚴 <b style={{color:C.green}}>Livreur :</b> {o.livreurName}</div>}
                </div>
              </div>
            ))}
          </>
        )}

        {tab==="abonnement"&&(
          <MonAbonnement user={user} onRenouveler={onPayer}/>
        )}
      </div>

      {showModal&&<NewOrderModal vendeur={user} onAdd={o=>{ORDERS.push(o);setTick(t=>t+1);onToast(`Commande créée ! 📦 Numéro : ${o.id}`);"notif";setShowModal(false);}} onClose={()=>setShowModal(false)}/>}
    </div>
  );
}

function NewOrderModal({vendeur,onAdd,onClose}){
  const [f,setF]=useState({client:"",clientPhone:"",product:"",pickupAddress:"",deliveryAddress:"",amount:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const ok=f.client&&f.clientPhone&&f.deliveryAddress&&f.amount;
  const submit=async()=>{
    if(!ok)return;
    const id=genId();
    onAdd({id,vendeur:vendeur.name,vendeurId:vendeur.id,client:f.client,clientPhone:f.clientPhone,product:f.product||"Colis",pickupAddress:f.pickupAddress||"Adresse du vendeur",deliveryAddress:f.deliveryAddress,amount:parseInt(f.amount)||0,status:"disponible",livreurId:null,livreurName:null,livreurPhone:null,createdAt:now(),steps:[{label:"Commande créée",time:now(),done:true},{label:"Livreur assigné",time:null,done:false},{label:"Récupéré chez vendeur",time:null,done:false},{label:"En route",time:null,done:false},{label:"Livré",time:null,done:false}]});
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"flex-end",zIndex:100}}>
      <div style={{background:C.white,borderRadius:"26px 26px 0 0",padding:"30px 24px 48px",width:"100%",maxHeight:"94vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontWeight:900,fontSize:20,color:C.ink}}>Nouvelle commande</div>
          <button onClick={onClose} style={{background:C.bg,border:"none",borderRadius:12,padding:"9px 15px",cursor:"pointer",color:C.muted,fontSize:18}}>×</button>
        </div>
        <Input label="Nom du client" value={f.client} onChange={v=>s("client",v)} placeholder="Prénom et nom"/>
        <Input label="📞 Téléphone client" value={f.clientPhone} onChange={v=>s("clientPhone",v)} placeholder="07 XX XX XX XX" type="tel" mono/>
        <Input label="Produit / article" value={f.product} onChange={v=>s("product",v)} placeholder="Ex: Robe brodée bleue"/>
        <Input label="📤 Lieu de retrait" value={f.pickupAddress} onChange={v=>s("pickupAddress",v)} placeholder="Votre adresse complète"/>
        <Input label="📍 Lieu de livraison" value={f.deliveryAddress} onChange={v=>s("deliveryAddress",v)} placeholder="Adresse complète du client"/>
        <Input label="💰 Frais de livraison (FCFA)" value={f.amount} onChange={v=>s("amount",v)} placeholder="Ex: 15000" type="number"/>
        <button onClick={submit} disabled={!ok} style={{width:"100%",background:ok?C.orange:"#D1D5DB",color:C.white,border:"none",borderRadius:16,padding:17,fontWeight:800,cursor:ok?"pointer":"not-allowed",fontSize:16,fontFamily:"'Sora',sans-serif",boxShadow:ok?"0 6px 20px rgba(232,93,4,0.35)":"none"}}>
          🚀 Publier la commande
        </button>
      </div>
    </div>
  );
}

/* ═══════ LIVREUR DASH ═══════ */
function LivreurDash({user,onLogout,onToast,onPayer}){
  const [tab,setTab]=useState("dispo");
  const [tick,setTick]=useState(0);
  const available=ORDERS.filter(o=>o.status==="disponible");
  const mine=ORDERS.filter(o=>o.livreurId===user.id);

  const accept=(order)=>{
    // Bloquer si quota épuisé et pas d'abonnement
    if(!isActive(user) && quotaRestant(user,"livreur")<=0){
      onToast("🔒 Quota gratuit épuisé. Souscrivez un abonnement pour continuer.","error");
      onPayer(); return;
    }
    order.status="en livraison";order.livreurId=user.id;order.livreurName=user.name;order.livreurPhone=user.phone;
    order.steps[1]={label:"Livreur assigné",time:now(),done:true};
    order.steps[2]={label:"Récupéré chez vendeur",time:now(),done:true};
    order.steps[3]={label:"En route",time:now(),done:true};
    setTick(t=>t+1);
    onToast(`Commande ${order.id} acceptée !`,"notif");
  };

  const deliver=(order)=>{
    order.status="livré";order.steps[4]={label:"Livré",time:now(),done:true};
    setTick(t=>t+1);
    onToast(`Livraison ${order.id} confirmée ✅`,"success");
  };

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Sora',sans-serif"}}>
      <div style={{background:C.orange}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px 0"}}>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:C.white}}>🚴 {user.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.65)",marginTop:2}}><AboBadge user={user}/></div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{background:"rgba(255,255,255,.2)",borderRadius:24,padding:"6px 13px",fontSize:13,color:C.white,fontWeight:700}}>⭐ {user.rating}</div>
            <button onClick={onLogout} style={{background:"rgba(255,255,255,.18)",border:"none",color:C.white,borderRadius:12,padding:"9px 13px",cursor:"pointer",fontSize:15}}>⏻</button>
          </div>
        </div>
        <div style={{display:"flex",background:"rgba(0,0,0,.15)",margin:"14px 0 0",borderRadius:"14px 14px 0 0",overflow:"hidden"}}>
          {[["dispo",`📋 Disponibles (${available.length})`],["mine",`📦 Mes livraisons (${mine.length})`],["abonnement","💳 Abonnement"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,background:tab===id?C.white:"transparent",color:tab===id?C.orange:"rgba(255,255,255,.8)",border:"none",padding:"12px 4px",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif"}}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:16}}>
        {tab==="dispo"&&(
          <>
            <BanniereQuota user={user} role="livreur" onPayer={onPayer}/>
            {available.length===0?(
          <div style={{textAlign:"center",padding:"56px 20px",background:C.white,borderRadius:20}}>
            <div style={{fontSize:48,marginBottom:14}}>🌅</div>
            <div style={{fontWeight:800,color:C.ink,fontSize:17}}>Aucune commande disponible</div>
          </div>
        ):available.map(o=>(
          <div key={o.id} style={{background:C.white,borderRadius:20,padding:"20px",marginBottom:16,boxShadow:"0 4px 16px rgba(0,0,0,0.08)",border:`2px solid ${C.orangePale}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,color:C.orange,fontSize:16,marginBottom:3}}>{o.id}</div>
                <div style={{fontWeight:700,color:C.ink,fontSize:15}}>{o.product}</div>
              </div>
              <Badge s={o.status}/>
            </div>
            <div style={{background:C.bg,borderRadius:14,padding:"14px 16px",marginBottom:14,fontSize:13.5,lineHeight:2}}>
              <div>📤 <b style={{color:C.ink}}>Retrait :</b> <span style={{color:C.muted}}>{o.pickupAddress}</span></div>
              <div>📍 <b style={{color:C.ink}}>Livraison :</b> <span style={{color:C.muted}}>{o.deliveryAddress}</span></div>
            </div>
            <button onClick={()=>accept(o)} style={{width:"100%",background:C.orange,color:C.white,border:"none",borderRadius:15,padding:15,fontWeight:800,cursor:"pointer",fontSize:16,fontFamily:"'Sora',sans-serif",boxShadow:"0 5px 18px rgba(232,93,4,0.4)"}}>
              ✋ Accepter cette livraison
            </button>
          </div>
        ))}
          </>
        )}
        {tab==="mine"&&(mine.length===0?(
          <div style={{textAlign:"center",padding:"56px 20px",background:C.white,borderRadius:20}}>
            <div style={{fontSize:48,marginBottom:14}}>🚴</div>
            <div style={{fontWeight:800,color:C.ink,fontSize:17}}>Aucune livraison en cours</div>
          </div>
        ):mine.map(o=>(
          <div key={o.id} style={{background:C.white,borderRadius:20,padding:"20px",marginBottom:14,boxShadow:"0 3px 12px rgba(0,0,0,0.07)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,color:C.orange,fontSize:15}}>{o.id}</div>
                <div style={{fontWeight:700,color:C.ink,fontSize:16,marginTop:2}}>{o.client}</div>
                <div style={{color:C.muted,fontSize:13,marginTop:1}}>{o.product}</div>
              </div>
              <Badge s={o.status}/>
            </div>
            <div style={{background:C.greenPale,border:`1.5px solid #BBF7D0`,borderRadius:14,padding:"14px 16px",marginBottom:14,fontSize:13.5,lineHeight:2}}>
              <div>📞 <b>Client :</b> {o.client} — <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{o.clientPhone}</span></div>
              <div>📍 <b>Livraison :</b> {o.deliveryAddress}</div>
              <div>📤 <b>Retrait :</b> {o.pickupAddress}</div>
              <div>🎫 <b>N° colis :</b> <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,color:C.orange}}>{o.id}</span></div>
            </div>
            {o.status==="en livraison"&&<button onClick={()=>deliver(o)} style={{width:"100%",background:C.green,color:C.white,border:"none",borderRadius:15,padding:15,fontWeight:800,cursor:"pointer",fontSize:16,fontFamily:"'Sora',sans-serif",boxShadow:"0 5px 18px rgba(5,150,105,0.35)"}}>✅ Confirmer la livraison</button>}
            {o.status==="livré"&&<div style={{textAlign:"center",color:C.green,fontWeight:800,fontSize:15,padding:"10px 0"}}>🎉 Livraison confirmée !</div>}
          </div>
        )))}

        {tab==="abonnement"&&(
          <MonAbonnement user={user} onRenouveler={onPayer}/>
        )}
      </div>
    </div>
  );
}

/* ═══════ SUIVI COLIS PUBLIC ═══════ */
function TrackPage({init,onBack}){
  const [code,setCode]=useState(init||"");
  const [order,setOrder]=useState(null);
  const [miss,setMiss]=useState(false);

  const search=(c)=>{
    const o=ORDERS.find(x=>x.id===c.toUpperCase().trim());
    if(o){setOrder(o);setMiss(false);}else{setOrder(null);setMiss(true);}
  };
  useEffect(()=>{if(init)search(init);},[]);

  const done=order?order.steps.filter(s=>s.done).length:0;
  const pct=order?Math.round((done/order.steps.length)*100):0;

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Sora',sans-serif"}}>
      <div style={{background:C.ink,padding:"24px 20px 60px"}}>
        <div style={{marginBottom:28}}><BtnBack onClick={onBack}/></div>
        <h2 style={{color:C.white,fontWeight:900,fontSize:24,marginBottom:8,letterSpacing:-0.5}}>📦 Suivre mon colis</h2>
        <p style={{color:"rgba(255,255,255,.45)",fontSize:13.5,marginBottom:20}}>Entrez le numéro reçu par SMS ou WhatsApp</p>
        <div style={{display:"flex",gap:10}}>
          <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="LCI-XXXX"
            style={{flex:1,background:"rgba(255,255,255,.09)",border:"1.5px solid rgba(255,255,255,.18)",borderRadius:14,padding:"14px 18px",color:C.white,fontSize:19,outline:"none",fontFamily:"'JetBrains Mono',monospace",fontWeight:800,letterSpacing:3}}/>
          <button onClick={()=>search(code)} style={{background:C.orange,color:C.white,border:"none",borderRadius:14,padding:"14px 24px",fontWeight:800,cursor:"pointer",fontSize:19,fontFamily:"'Sora',sans-serif",boxShadow:"0 4px 16px rgba(232,93,4,0.45)"}}>→</button>
        </div>
      </div>

      <div style={{padding:16,marginTop:-30}}>
        {miss&&<div style={{background:C.white,borderRadius:20,padding:"40px 24px",textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,0.09)"}}>
          <div style={{fontSize:48,marginBottom:14}}>🔍</div>
          <div style={{fontWeight:800,color:C.ink,fontSize:18,marginBottom:8}}>Numéro introuvable</div>
          <div style={{color:C.muted,fontSize:14}}>Vérifiez le numéro reçu par SMS ou WhatsApp</div>
        </div>}
        {order&&(
          <div style={{animation:"fadeIn .35s ease"}}>
            <div style={{background:C.white,borderRadius:22,padding:"24px 22px",marginBottom:16,boxShadow:"0 4px 24px rgba(0,0,0,0.09)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:0.8,marginBottom:6,textTransform:"uppercase"}}>Numéro de colis</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,color:C.orange,fontSize:26,letterSpacing:2}}>{order.id}</div>
                </div>
                <Badge s={order.status}/>
              </div>
              <div style={{marginBottom:22}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:12.5,color:C.muted,fontWeight:600}}>Progression</span>
                  <span style={{fontSize:14,fontWeight:900,color:pct===100?C.green:C.orange}}>{pct}%</span>
                </div>
                <div style={{background:C.border,borderRadius:10,height:12,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,background:pct===100?`linear-gradient(90deg,${C.green},#34D399)`:`linear-gradient(90deg,${C.orange},${C.orangeLight})`,height:"100%",borderRadius:10,transition:"width .8s"}}/>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{background:"#FFF8F0",borderRadius:14,border:`1.5px solid ${C.orange}25`,padding:"14px 16px",display:"flex",gap:13,alignItems:"flex-start"}}>
                  <div style={{width:42,height:42,borderRadius:12,background:C.orangePale,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>📤</div>
                  <div><div style={{fontSize:10,fontWeight:800,color:C.orange,letterSpacing:0.8,marginBottom:4,textTransform:"uppercase"}}>Adresse de retrait</div><div style={{fontWeight:700,color:C.ink,fontSize:14,lineHeight:1.6}}>{order.pickupAddress}</div></div>
                </div>
                <div style={{background:C.bluePale,borderRadius:14,border:`1.5px solid ${C.blue}20`,padding:"14px 16px",display:"flex",gap:13,alignItems:"flex-start"}}>
                  <div style={{width:42,height:42,borderRadius:12,background:"#DBEAFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>📍</div>
                  <div><div style={{fontSize:10,fontWeight:800,color:C.blue,letterSpacing:0.8,marginBottom:4,textTransform:"uppercase"}}>Adresse de livraison</div><div style={{fontWeight:700,color:C.ink,fontSize:14,lineHeight:1.6}}>{order.deliveryAddress}</div></div>
                </div>
                <div style={{background:C.greenPale,borderRadius:14,border:`1.5px solid ${C.green}30`,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",gap:13,alignItems:"center"}}>
                    <div style={{width:42,height:42,borderRadius:12,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>💰</div>
                    <div><div style={{fontSize:10,fontWeight:800,color:C.green,letterSpacing:0.8,marginBottom:3,textTransform:"uppercase"}}>Frais de livraison</div><div style={{fontSize:12,color:C.muted}}>À remettre au livreur</div></div>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,color:C.green,fontSize:20}}>{order.amount.toLocaleString()} <span style={{fontSize:13}}>FCFA</span></div>
                </div>
              </div>
            </div>
            <div style={{background:C.white,borderRadius:22,padding:"24px 22px",boxShadow:"0 4px 24px rgba(0,0,0,0.09)"}}>
              <div style={{fontWeight:900,color:C.ink,fontSize:17,marginBottom:24,letterSpacing:-0.3}}>🕐 Étapes de livraison</div>
              {order.steps.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:18}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:32,flexShrink:0}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:step.done?C.orange:C.border,border:`2.5px solid ${step.done?C.orange:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:step.done?C.white:C.mutedLight,fontWeight:900,flexShrink:0,zIndex:1}}>{step.done?"✓":i+1}</div>
                    {i<order.steps.length-1&&<div style={{width:2.5,flex:1,minHeight:34,background:step.done?C.orange+"55":C.border,margin:"4px 0",borderRadius:2}}/>}
                  </div>
                  <div style={{paddingBottom:i<order.steps.length-1?24:0,paddingTop:4}}>
                    <div style={{fontWeight:700,fontSize:15,color:step.done?C.ink:C.muted}}>{step.label}</div>
                    {step.time?<div style={{color:C.orange,fontSize:12.5,fontWeight:700,marginTop:3}}>{step.time}</div>:!step.done&&<div style={{color:C.mutedLight,fontSize:12.5,marginTop:3}}>En attente…</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ APP ROOT ═══════ */
export default function App(){
  const [screen,setScreen]=useState("landing");
  const [data,setData]=useState(null);
  const [user,setUser]=useState(null);
  const [role,setRole]=useState(null);
  const [toast,setToast]=useState(null);
  const [demandePaiement,setDemandePaiement]=useState(null);

  const nav=(to,d=null)=>{setScreen(to);setData(d);};
  const toast_=(msg,type)=>setToast({msg,type});

  const auth=(u,r)=>{
    setUser(u);setRole(r);
    if(r==="admin"){setScreen("admin");return;}
    if(!hasAccess(u,r)){setScreen("mur-abonnement");}
    else{setScreen(r==="vendeur"?"vendeur":"livreur");setToast({msg:`Bienvenue ${u.name} ! 🎉`,type:"success"});}
  };

  const logout=()=>{setUser(null);setRole(null);setScreen("landing");setDemandePaiement(null);};

  const goToPaiement=()=>setScreen("paiement");

  const onSubmitPaiement=(dem)=>{
    setDemandePaiement(dem);
    setScreen("confirmation-paiement");
  };

  return(
    <div>
      <style>{FONTS}</style>
      {screen==="landing"             &&<Landing onNav={nav}/>}
      {screen==="auth-vendeur"        &&<Auth type="vendeur" onAuth={auth} onBack={()=>nav("landing")}/>}
      {screen==="auth-livreur"        &&<Auth type="livreur" onAuth={auth} onBack={()=>nav("landing")}/>}
      {screen==="auth-admin"          &&<Auth type="admin"   onAuth={auth} onBack={()=>nav("landing")}/>}
      {screen==="mur-abonnement"&&user&&<MurAbonnement user={user} userType={role} onPayer={goToPaiement} onLogout={logout}/>}
      {screen==="paiement"      &&user&&<PagePaiement user={user} userType={role} onBack={()=>hasAccess(user,role)?setScreen(role==="vendeur"?"vendeur":"livreur"):setScreen("mur-abonnement")} onSubmit={onSubmitPaiement}/>}
      {screen==="confirmation-paiement"&&demandePaiement&&<ConfirmationPaiement demande={demandePaiement} onBack={logout}/>}
      {screen==="vendeur"&&user&&hasAccess(user,"vendeur")&&<VendeurDash user={user} onLogout={logout} onToast={toast_} onPayer={goToPaiement}/>}
      {screen==="livreur"&&user&&hasAccess(user,"livreur")&&<LivreurDash user={user} onLogout={logout} onToast={toast_} onPayer={goToPaiement}/>}
      {screen==="admin"&&user&&role==="admin"&&<AdminDash user={user} onLogout={logout} onToast={toast_}/>}
      {screen==="track"               &&<TrackPage init={data} onBack={()=>nav("landing")}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}
