import { useState, useEffect } from "react";

// ─── COLORS ────────────────────────────────────────────────────────────────
const C = {
  navy:"#0A1628", navyMid:"#112240", navyLight:"#1B3A6B",
  blue:"#1565C0", blueMid:"#1976D2", bluePale:"#E3F2FD",
  teal:"#00695C", tealPale:"#E0F2F1",
  green:"#2E7D32", greenPale:"#E8F5E9",
  amber:"#E65100", amberPale:"#FFF3E0",
  red:"#B71C1C", redPale:"#FFEBEE",
  gold:"#F9A825", goldPale:"#FFFDE7",
  bg:"#F0F4F8", card:"#FFFFFF",
  text:"#0D1B2A", muted:"#64748B", subtle:"#94A3B8",
  border:"#E2E8F0", borderDark:"#CBD5E1",
};

// ─── DEMO DATA ──────────────────────────────────────────────────────────────
const DEMO = {
  name:"Yash Bhamore", email:"yash.bhamore@unt.edu",
  euid:"ybm0042", age:21, level:"Undergraduate",
  program:"Data Science", semester:3, credits:12,
  gpa:3.7, matchScore:96, nationality:"American", status:"Domestic",
  advisor:"Dr. Sarah Mitchell", advisorEmail:"sarah.mitchell@unt.edu",
  scholarships:["Merit Scholarship","In-State Award"],
  interests:["Healthcare Analytics","Entrepreneurship"],
  photo:null,
};

const COURSES = [
  {code:"INFO 4820",name:"Machine Learning Applications",prof:"Dr. Park",progress:72,grade:"A-",credits:3,color:C.blue,recordings:4,assignments:2},
  {code:"INFO 5082",name:"Data Science Capstone",prof:"Dr. Whitworth",progress:88,grade:"A",credits:3,color:C.green,recordings:6,assignments:1},
  {code:"MATH 3680",name:"Applied Statistics",prof:"Dr. Chen",progress:55,grade:"B+",credits:3,color:C.teal,recordings:3,assignments:3},
  {code:"INFO 4550",name:"Cloud Data Engineering",prof:"Dr. Voss",progress:40,grade:"B",credits:3,color:C.amber,recordings:2,assignments:4},
];

const JOBS = [
  {title:"Research Assistant",dept:"Data Science Dept.",match:94,type:"On-Campus",pay:"$14/hr",hours:"10-15 hrs/wk",skills:["Python","Data Analysis"],why:["Your DS program is a direct match","Strong GPA (3.7) meets the 3.5 threshold","Semester 3 timing aligns with typical hire windows"]},
  {title:"IT Help Desk Specialist",dept:"UNT IT Services",match:88,type:"On-Campus",pay:"$13/hr",hours:"12-20 hrs/wk",skills:["Technical Support","Communication"],why:["Your technical background is a strong fit","Domestic status simplifies employment paperwork","Full-time enrollment preferred — you qualify"]},
  {title:"Student Ambassador",dept:"Office of Admissions",match:82,type:"On-Campus",pay:"$12/hr",hours:"8-12 hrs/wk",skills:["Public Speaking","Campus Knowledge"],why:["Semester 3 = enough campus experience","Data Science major is a growing program to promote","Your age and communication skills are ideal"]},
  {title:"Library Research Aide",dept:"Willis Library",match:76,type:"On-Campus",pay:"$12.50/hr",hours:"10-15 hrs/wk",skills:["Research","Attention to Detail"],why:["Flexible hours fit a 12-credit schedule","Your research interest signals academic motivation","Graduate-adjacent role — builds your CV"]},
];

const SCHOLARSHIPS = [
  {name:"Data Science Excellence Award",amount:"$3,000",deadline:"May 15, 2026",match:92,eligible:true,req:"GPA ≥ 3.5, DS major, Domestic"},
  {name:"UNT Merit Scholarship Renewal",amount:"$2,500",deadline:"Apr 30, 2026",match:95,eligible:true,req:"GPA ≥ 3.5, renewable annually"},
  {name:"STEM Futures Fund",amount:"$1,500",deadline:"Jun 1, 2026",match:80,eligible:true,req:"STEM program, sophomore+"},
  {name:"Texas Public Education Grant",amount:"$4,200",deadline:"Jul 1, 2026",match:70,eligible:false,req:"Financial need-based, FAFSA required"},
];

const ASSIGNMENTS = [
  {course:"INFO 5082",title:"Capstone Final Pitch Presentation",due:"Apr 27, 2026",status:"in-progress",priority:"high"},
  {course:"INFO 4820",title:"Neural Network Lab Report",due:"May 2, 2026",status:"not-started",priority:"high"},
  {course:"MATH 3680",title:"Regression Analysis Problem Set 4",due:"May 5, 2026",status:"not-started",priority:"medium"},
  {course:"INFO 4550",title:"AWS Pipeline Architecture Design",due:"May 8, 2026",status:"not-started",priority:"medium"},
  {course:"INFO 4820",title:"Midterm Reflection Essay",due:"Apr 30, 2026",status:"submitted",priority:"low"},
];

const RECORDINGS = [
  {course:"INFO 5082",title:"Phase 4: XAI Integration Walkthrough",date:"Apr 22, 2026",duration:"52 min"},
  {course:"INFO 4820",title:"Lecture 18: Transformer Architectures",date:"Apr 21, 2026",duration:"68 min"},
  {course:"MATH 3680",title:"Ch 9: Multiple Linear Regression",date:"Apr 20, 2026",duration:"45 min"},
  {course:"INFO 4550",title:"AWS Lambda & Event-Driven Design",date:"Apr 19, 2026",duration:"55 min"},
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
const initials = n => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const matchColor = m => m>=90?C.green:m>=75?C.teal:m>=60?C.amber:C.red;
const matchBg = m => m>=90?C.greenPale:m>=75?C.tealPale:m>=60?C.amberPale:C.redPale;

const Avatar = ({name,size=40,bg=C.blue}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:bg,
    display:"flex",alignItems:"center",justifyContent:"center",
    color:"white",fontWeight:700,fontSize:size*0.35,flexShrink:0}}>
    {initials(name)}
  </div>
);

const Card = ({children,style={}}) => (
  <div style={{background:C.card,borderRadius:16,padding:"20px 24px",
    boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)",
    border:`1px solid ${C.border}`,...style}}>{children}</div>
);

const Pill = ({text,color=C.blue,bg=C.bluePale}) => (
  <span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,
    fontSize:11,fontWeight:600,color,background:bg,marginRight:4,marginBottom:4}}>{text}</span>
);

const MatchBadge = ({score}) => (
  <div style={{display:"flex",alignItems:"center",gap:6}}>
    <div style={{flex:1,height:6,borderRadius:3,background:C.border,overflow:"hidden"}}>
      <div style={{width:`${score}%`,height:"100%",borderRadius:3,
        background:`linear-gradient(90deg,${matchColor(score)},${matchColor(score)}CC)`}}/>
    </div>
    <span style={{fontWeight:700,fontSize:13,color:matchColor(score),minWidth:36}}>{score}%</span>
  </div>
);

const StatusDot = ({status}) => {
  const map = {"in-progress":[C.blue,"In Progress"],"not-started":[C.amber,"To Do"],"submitted":[C.green,"Submitted"]};
  const [col,label] = map[status]||[C.muted,"Unknown"];
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,color:col,fontWeight:600}}>
    <span style={{width:7,height:7,borderRadius:"50%",background:col,display:"inline-block"}}/>
    {label}
  </span>;
};

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [tab,setTab]=useState("login");
  const [form,setForm]=useState({email:"",password:"",name:"",euid:""});
  const [loading,setLoading]=useState(false);

  const handleDemo = () => {
    setLoading(true);
    setTimeout(()=>{setLoading(false);onLogin(DEMO);},1400);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      {/* Left panel */}
      <div style={{width:"44%",background:`linear-gradient(145deg,${C.navy} 0%,${C.navyMid} 50%,${C.navyLight} 100%)`,
        padding:"48px 52px",display:"flex",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
        {/* BG decoration */}
        <div style={{position:"absolute",top:-80,right:-80,width:300,height:300,borderRadius:"50%",
          background:"rgba(21,101,192,0.12)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-60,left:-60,width:240,height:240,borderRadius:"50%",
          background:"rgba(21,101,192,0.08)",pointerEvents:"none"}}/>

        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:48}}>
            <div style={{width:44,height:44,borderRadius:12,background:C.blue,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🎓</div>
            <div>
              <div style={{color:"white",fontWeight:800,fontSize:20,letterSpacing:-0.5}}>UniGuide AI</div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>University of North Texas</div>
            </div>
          </div>
          <h1 style={{color:"white",fontSize:36,fontWeight:800,lineHeight:1.15,margin:"0 0 16px",letterSpacing:-1}}>
            Your personal<br/>campus intelligence.
          </h1>
          <p style={{color:"rgba(255,255,255,0.65)",fontSize:15,lineHeight:1.7,marginBottom:40}}>
            One platform for advising, academics, career matching, and AI-powered guidance — built specifically for UNT students.
          </p>
          {[
            ["🤖","AI Advisor","Get personalized job & scholarship matches based on your profile"],
            ["📚","Smart Academics","All your courses, recordings, and assignments in one place"],
            ["🎯","Career Match","Discover on-campus jobs you actually qualify for"],
          ].map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",gap:14,marginBottom:20}}>
              <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.08)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
              <div>
                <div style={{color:"white",fontWeight:600,fontSize:14}}>{title}</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,lineHeight:1.5}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>
          INFO 5082 · Data Science Capstone · © 2026 UniGuide AI
        </div>
      </div>

      {/* Right panel */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
        background:C.bg,padding:40}}>
        <div style={{width:"100%",maxWidth:420}}>
          <h2 style={{fontSize:26,fontWeight:800,color:C.text,margin:"0 0 6px",letterSpacing:-0.5}}>
            {tab==="login"?"Welcome back":"Create your account"}
          </h2>
          <p style={{color:C.muted,fontSize:14,marginBottom:28}}>
            {tab==="login"?"Log in with your UNT credentials":"Set up your UniGuide AI profile"}
          </p>

          {/* Tabs */}
          <div style={{display:"flex",background:"white",borderRadius:12,padding:4,
            marginBottom:24,border:`1px solid ${C.border}`}}>
            {["login","signup"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"9px 0",borderRadius:9,
                border:"none",cursor:"pointer",fontSize:14,fontWeight:600,
                background:tab===t?C.blue:"transparent",color:tab===t?"white":C.muted,
                transition:"all 0.2s"}}>
                {t==="login"?"Log In":"Sign Up"}
              </button>
            ))}
          </div>

          {tab==="login"?(
            <div>
              {[["EUID or Email","email","ybm0042@my.unt.edu"],["Password","password","••••••••"]].map(([label,type,ph])=>(
                <div key={label} style={{marginBottom:16}}>
                  <label style={{display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6}}>{label}</label>
                  <input type={type} placeholder={ph}
                    style={{width:"100%",padding:"12px 14px",borderRadius:10,fontSize:14,
                      border:`1px solid ${C.border}`,outline:"none",boxSizing:"border-box",
                      background:"white",color:C.text}}/>
                </div>
              ))}
              <button onClick={handleDemo} disabled={loading}
                style={{width:"100%",padding:"13px 0",borderRadius:12,background:C.blue,
                  color:"white",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",
                  marginTop:4,opacity:loading?0.7:1,transition:"all 0.2s"}}>
                {loading?"Signing in...":"Log In"}
              </button>
              <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
                <div style={{flex:1,height:1,background:C.border}}/>
                <span style={{color:C.muted,fontSize:12}}>or try the demo</span>
                <div style={{flex:1,height:1,background:C.border}}/>
              </div>
              <button onClick={handleDemo} disabled={loading}
                style={{width:"100%",padding:"12px 0",borderRadius:12,
                  border:`2px solid ${C.blue}`,background:"white",color:C.blue,
                  fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.2s"}}>
                ⚡ Quick Demo — Yash Bhamore
              </button>
            </div>
          ):(
            <div>
              {[["Full Name","text","Alex Johnson"],["UNT Email","email","abc0001@my.unt.edu"],["EUID","text","abc0001"],["Password","password","Create a password"]].map(([label,type,ph])=>(
                <div key={label} style={{marginBottom:14}}>
                  <label style={{display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6}}>{label}</label>
                  <input type={type} placeholder={ph}
                    style={{width:"100%",padding:"11px 14px",borderRadius:10,fontSize:14,
                      border:`1px solid ${C.border}`,outline:"none",boxSizing:"border-box",background:"white"}}/>
                </div>
              ))}
              <button onClick={handleDemo}
                style={{width:"100%",padding:"13px 0",borderRadius:12,background:C.blue,
                  color:"white",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",marginTop:4}}>
                Create Account & Set Up Profile →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function OnboardingFlow({onComplete}) {
  const [step,setStep]=useState(0);
  const [data,setData]=useState({
    level:"Undergraduate",program:"Data Science",semester:3,
    credits:12,age:21,nationality:"American",status:"Domestic",
    scholarship_merit:true,scholarship_instate:false,scholarship_athlete:false,
    aid_grant:false,interest_health:true,interest_entrep:false,
  });
  const [loading,setLoading]=useState(false);

  const steps=[
    {title:"About you",sub:"Help us personalize your UniGuide AI experience"},
    {title:"Your academics",sub:"So we can surface the right opportunities and help"},
    {title:"Financial & Interests",sub:"To match you with scholarships and career paths"},
  ];

  const finish = () => {
    setLoading(true);
    setTimeout(()=>onComplete({...DEMO,...data}),2000);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:40}}>
        <div style={{width:36,height:36,borderRadius:10,background:C.blue,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎓</div>
        <span style={{fontWeight:800,fontSize:18,color:C.text}}>UniGuide AI</span>
      </div>

      <div style={{width:"100%",maxWidth:520}}>
        {/* Progress */}
        <div style={{display:"flex",gap:8,marginBottom:32}}>
          {steps.map((_,i)=>(
            <div key={i} style={{flex:1,height:4,borderRadius:2,
              background:i<=step?C.blue:C.border,transition:"background 0.3s"}}/>
          ))}
        </div>

        {loading?(
          <Card style={{textAlign:"center",padding:"60px 24px"}}>
            <div style={{fontSize:48,marginBottom:16}}>🤖</div>
            <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8}}>Analyzing your profile...</div>
            <div style={{fontSize:14,color:C.muted}}>UniGuide AI is computing your personalized advisory insights</div>
            <div style={{marginTop:24,display:"flex",justifyContent:"center",gap:6}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:8,height:8,borderRadius:"50%",background:C.blue,
                  animation:`bounce 1s ${i*0.2}s infinite`,opacity:0.7}}/>
              ))}
            </div>
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
          </Card>
        ):(
          <Card>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,color:C.blue,textTransform:"uppercase",
                letterSpacing:"0.1em",marginBottom:6}}>Step {step+1} of {steps.length}</div>
              <h2 style={{fontSize:22,fontWeight:800,color:C.text,margin:"0 0 4px"}}>{steps[step].title}</h2>
              <p style={{fontSize:14,color:C.muted,margin:0}}>{steps[step].sub}</p>
            </div>

            {step===0&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[["Age","number","age","17","45"],["Nationality","select","nationality",null,null,
                  ["American","Indian","Chinese","International","Other"]]].map(([label,type,key,...rest])=>(
                  <div key={key}>
                    <label style={{display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6}}>{label}</label>
                    {type==="select"?(
                      <select value={data[key]} onChange={e=>setData({...data,[key]:e.target.value})}
                        style={{width:"100%",padding:"11px 12px",borderRadius:10,border:`1px solid ${C.border}`,
                          fontSize:14,background:"white",color:C.text,boxSizing:"border-box"}}>
                        {rest[1].map(o=><option key={o}>{o}</option>)}
                      </select>
                    ):(
                      <input type={type} value={data[key]} min={rest[0]} max={rest[1]}
                        onChange={e=>setData({...data,[key]:+e.target.value})}
                        style={{width:"100%",padding:"11px 12px",borderRadius:10,border:`1px solid ${C.border}`,
                          fontSize:14,boxSizing:"border-box",background:"white"}}/>
                    )}
                  </div>
                ))}
                <div>
                  <label style={{display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6}}>Student Status</label>
                  <select value={data.status} onChange={e=>setData({...data,status:e.target.value})}
                    style={{width:"100%",padding:"11px 12px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,background:"white",boxSizing:"border-box"}}>
                    <option>Domestic</option><option>International</option>
                  </select>
                </div>
              </div>
            )}

            {step===1&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[["Program","select","program",null,null,["Data Science","Computer Science","Engineering","Business","Arts","General"]],
                  ["Level","select","level",null,null,["Undergraduate","Graduate"]],
                  ["Semester #","number","semester","1","12"],
                  ["Credits This Semester","number","credits","3","21"]
                ].map(([label,type,key,...rest])=>(
                  <div key={key}>
                    <label style={{display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6}}>{label}</label>
                    {type==="select"?(
                      <select value={data[key]} onChange={e=>setData({...data,[key]:e.target.value})}
                        style={{width:"100%",padding:"11px 12px",borderRadius:10,border:`1px solid ${C.border}`,
                          fontSize:14,background:"white",boxSizing:"border-box"}}>
                        {rest[1].map(o=><option key={o}>{o}</option>)}
                      </select>
                    ):(
                      <input type={type} value={data[key]} min={rest[0]} max={rest[1]}
                        onChange={e=>setData({...data,[key]:+e.target.value})}
                        style={{width:"100%",padding:"11px 12px",borderRadius:10,border:`1px solid ${C.border}`,
                          fontSize:14,boxSizing:"border-box",background:"white"}}/>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step===2&&(
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>Scholarships you receive</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
                  {[["Merit Scholarship","scholarship_merit"],["In-State Award","scholarship_instate"],
                    ["Athlete Scholarship","scholarship_athlete"],["Alumni Award","scholarship_alumni"]].map(([label,key])=>(
                    <label key={key} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                      borderRadius:10,border:`1px solid ${data[key]?C.blue:C.border}`,
                      background:data[key]?C.bluePale:"white",cursor:"pointer",fontSize:13,
                      fontWeight:data[key]?600:400,color:data[key]?C.blue:C.text,transition:"all 0.2s"}}>
                      <input type="checkbox" checked={!!data[key]} onChange={e=>setData({...data,[key]:e.target.checked})}
                        style={{accentColor:C.blue}}/>{label}
                    </label>
                  ))}
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>Areas of Interest</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["Healthcare Analytics","interest_health"],["Entrepreneurship","interest_entrep"],
                    ["AI & Machine Learning","interest_ai"],["Business Strategy","interest_biz"]].map(([label,key])=>(
                    <label key={key} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                      borderRadius:10,border:`1px solid ${data[key]?C.blue:C.border}`,
                      background:data[key]?C.bluePale:"white",cursor:"pointer",fontSize:13,
                      fontWeight:data[key]?600:400,color:data[key]?C.blue:C.text,transition:"all 0.2s"}}>
                      <input type="checkbox" checked={!!data[key]} onChange={e=>setData({...data,[key]:e.target.checked})}
                        style={{accentColor:C.blue}}/>{label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
              <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}
                style={{padding:"11px 24px",borderRadius:10,border:`1px solid ${C.border}`,
                  background:"white",color:step===0?C.subtle:C.text,fontWeight:600,fontSize:14,cursor:step===0?"default":"pointer"}}>
                Back
              </button>
              <button onClick={step<steps.length-1?()=>setStep(s=>s+1):finish}
                style={{padding:"11px 28px",borderRadius:10,background:C.blue,color:"white",
                  fontWeight:700,fontSize:14,border:"none",cursor:"pointer"}}>
                {step<steps.length-1?"Continue →":"Finish Setup 🚀"}
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const NAV = [
  {id:"dashboard",icon:"🏠",label:"Home"},
  {id:"advisor",icon:"🤖",label:"AI Advisor",badge:"NEW"},
  {id:"academics",icon:"📚",label:"Academics"},
  {id:"career",icon:"💼",label:"Career Match"},
  {id:"scholarships",icon:"🎓",label:"Scholarships"},
  {id:"appointments",icon:"📅",label:"Appointments"},
  {id:"profile",icon:"👤",label:"Profile"},
];

function Sidebar({tab,setTab,user}) {
  return (
    <div style={{width:230,background:C.navy,minHeight:"100vh",padding:"0",
      display:"flex",flexDirection:"column",flexShrink:0}}>
      {/* Logo */}
      <div style={{padding:"24px 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:C.blue,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎓</div>
          <div>
            <div style={{color:"white",fontWeight:800,fontSize:16,letterSpacing:-0.3}}>UniGuide AI</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:10}}>UNT Student Portal</div>
          </div>
        </div>
      </div>

      {/* User */}
      <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)",
        display:"flex",alignItems:"center",gap:10}}>
        <Avatar name={user.name} size={36} bg={C.blue}/>
        <div style={{overflow:"hidden"}}>
          <div style={{color:"white",fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{user.euid} · {user.level.slice(0,5)}.</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{padding:"12px 12px",flex:1}}>
        {NAV.map(({id,icon,label,badge})=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
              borderRadius:10,border:"none",cursor:"pointer",textAlign:"left",marginBottom:2,
              background:tab===id?"rgba(21,101,192,0.35)":"transparent",
              transition:"background 0.15s"}}>
            <span style={{fontSize:17}}>{icon}</span>
            <span style={{fontSize:13,fontWeight:tab===id?700:500,
              color:tab===id?"white":"rgba(255,255,255,0.6)"}}>{label}</span>
            {badge&&<span style={{marginLeft:"auto",fontSize:9,fontWeight:700,padding:"2px 6px",
              borderRadius:8,background:C.blue,color:"white"}}>{badge}</span>}
            {tab===id&&<span style={{marginLeft:"auto",width:3,height:18,borderRadius:2,
              background:C.blue,display:badge?"none":"block"}}/>}
          </button>
        ))}
      </nav>

      {/* Stats footer */}
      <div style={{padding:"14px 20px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>AI Match Score</span>
          <span style={{fontSize:11,fontWeight:700,color:C.gold}}>{user.matchScore}%</span>
        </div>
        <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.1)"}}>
          <div style={{width:`${user.matchScore}%`,height:"100%",borderRadius:2,
            background:`linear-gradient(90deg,${C.gold},${C.blue})`}}/>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:8}}>
          GPA {user.gpa} · Sem {user.semester} · {user.credits} credits
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({user,setTab}) {
  const hour=new Date().getHours();
  const greet=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const urgent=ASSIGNMENTS.filter(a=>a.status!=="submitted"&&a.priority==="high");

  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%",boxSizing:"border-box"}}>
      {/* Greeting */}
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:26,fontWeight:800,color:C.text,margin:"0 0 4px",letterSpacing:-0.5}}>
          {greet}, {user.name.split(" ")[0]} 👋
        </h1>
        <p style={{color:C.muted,fontSize:14,margin:0}}>
          {user.program} · Semester {user.semester} · {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
        </p>
      </div>

      {/* AI Hero Card */}
      <div style={{background:`linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 100%)`,
        borderRadius:20,padding:"24px 28px",marginBottom:24,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,width:180,height:180,borderRadius:"50%",
          background:"rgba(21,101,192,0.15)",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20}}>
          <div style={{flex:1}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",
              borderRadius:20,background:"rgba(21,101,192,0.3)",marginBottom:14}}>
              <span style={{fontSize:11}}>🤖</span>
              <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.9)",textTransform:"uppercase",letterSpacing:"0.05em"}}>AI Advisory Update</span>
            </div>
            <h2 style={{color:"white",fontSize:22,fontWeight:800,margin:"0 0 8px",lineHeight:1.2}}>
              You're a <span style={{color:C.gold}}>{user.matchScore}% match</span> for on-campus employment
            </h2>
            <p style={{color:"rgba(255,255,255,0.65)",fontSize:13,lineHeight:1.6,margin:"0 0 18px"}}>
              Based on your age, program, and semester — you're in the ideal profile for Research Assistant and IT Helpdesk roles on campus.
            </p>
            <button onClick={()=>setTab("advisor")}
              style={{padding:"10px 20px",borderRadius:10,background:C.blue,color:"white",
                fontWeight:700,fontSize:13,border:"none",cursor:"pointer"}}>
              See My Matches →
            </button>
          </div>
          <div style={{textAlign:"center",flexShrink:0}}>
            <div style={{width:90,height:90,borderRadius:"50%",
              background:"conic-gradient(#F9A825 0% 96%, rgba(255,255,255,0.15) 96% 100%)",
              display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px"}}>
              <div style={{width:70,height:70,borderRadius:"50%",background:C.navy,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:C.gold,fontWeight:900,fontSize:22,lineHeight:1}}>{user.matchScore}%</span>
                <span style={{color:"rgba(255,255,255,0.4)",fontSize:9}}>AI Score</span>
              </div>
            </div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>Top 8% of students</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {[
          {label:"GPA",val:`${user.gpa}`,sub:"Dean's List eligible",color:C.green},
          {label:"Credits",val:`${user.credits}`,sub:"This semester",color:C.blue},
          {label:"Semester",val:`#${user.semester}`,sub:`of ${user.level==="Graduate"?6:8}`,color:C.teal},
          {label:"Assignments Due",val:`${urgent.length}`,sub:"In the next 2 weeks",color:urgent.length>0?C.amber:C.green},
        ].map(({label,val,sub,color})=>(
          <Card key={label} style={{padding:"16px 18px"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{label}</div>
            <div style={{fontSize:26,fontWeight:800,color,marginBottom:2}}>{val}</div>
            <div style={{fontSize:11,color:C.subtle}}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* Two columns */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {/* Top job matches */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:15,color:C.text}}>🎯 Top Job Matches</div>
            <button onClick={()=>setTab("career")} style={{fontSize:12,color:C.blue,fontWeight:600,
              border:"none",background:"none",cursor:"pointer"}}>View all</button>
          </div>
          {JOBS.slice(0,3).map(j=>(
            <div key={j.title} style={{display:"flex",alignItems:"center",gap:12,
              padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:38,height:38,borderRadius:10,background:matchBg(j.match),
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💼</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,color:C.text}}>{j.title}</div>
                <div style={{fontSize:11,color:C.muted}}>{j.dept} · {j.pay}</div>
              </div>
              <div style={{flexShrink:0}}>
                <span style={{fontWeight:800,fontSize:14,color:matchColor(j.match)}}>{j.match}%</span>
              </div>
            </div>
          ))}
        </Card>

        {/* Upcoming deadlines */}
        <Card>
          <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:16}}>📅 Upcoming Deadlines</div>
          {ASSIGNMENTS.filter(a=>a.status!=="submitted").slice(0,4).map(a=>(
            <div key={a.title} style={{display:"flex",alignItems:"flex-start",gap:10,
              padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:a.priority==="high"?C.amber:C.muted,
                marginTop:6,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:12,color:C.text,
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.title}</div>
                <div style={{fontSize:11,color:C.muted}}>{a.course} · Due {a.due.split(",")[0]}</div>
              </div>
              <StatusDot status={a.status}/>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── AI ADVISOR ───────────────────────────────────────────────────────────────
function AIAdvisor({user}) {
  const [selected,setSelected]=useState(null);
  const SHAP_PLAIN=[
    {factor:"Age (21)",icon:"✅",impact:"high",text:"Students aged 19–23 are the most commonly hired on-campus — you're in the ideal range."},
    {factor:"Data Science Major",icon:"✅",impact:"high",text:"DS students are in high demand across campus departments, especially in research and IT."},
    {factor:"Semester 3 Timing",icon:"✅",impact:"medium",text:"Third-semester students know the campus well enough to work effectively — advisors strongly prefer this stage."},
    {factor:"Full-Time Enrollment",icon:"✅",impact:"medium",text:"Your 12-credit load signals you can balance work responsibilities alongside studies."},
    {factor:"No Current Aid Gap",icon:"⚠️",impact:"low",text:"You have existing scholarships, which is positive. Work-study priority goes to students with greater financial need."},
  ];

  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%",boxSizing:"border-box"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,color:C.text,margin:"0 0 4px",letterSpacing:-0.5}}>🤖 AI Advisor</h1>
        <p style={{color:C.muted,fontSize:14,margin:0}}>Personalized recommendations powered by your profile and our trained advisory model</p>
      </div>

      {/* Score breakdown */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        {[
          {label:"On-Campus Job Match",score:96,icon:"💼",desc:"Research, IT, Library"},
          {label:"Scholarship Eligibility",score:88,icon:"🎓",desc:"2 active, 2 new matches"},
          {label:"Work-Study Match",score:74,icon:"📝",desc:"Need-based priority required"},
        ].map(({label,score,icon,desc})=>(
          <Card key={label} style={{textAlign:"center",padding:"20px 16px"}}>
            <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
            <div style={{fontSize:32,fontWeight:900,color:matchColor(score),marginBottom:4}}>{score}%</div>
            <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:4}}>{label}</div>
            <div style={{fontSize:11,color:C.muted}}>{desc}</div>
            <div style={{marginTop:10}}>
              <MatchBadge score={score}/>
            </div>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {/* Why your score */}
        <Card>
          <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:4}}>Why you scored {user.matchScore}%</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:16}}>These are the factors our AI model used — explained in plain English</div>
          {SHAP_PLAIN.map(({factor,icon,impact,text})=>(
            <div key={factor} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontWeight:700,fontSize:13,color:C.text}}>{factor}</span>
                  <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:8,
                    background:impact==="high"?C.greenPale:impact==="medium"?C.bluePale:C.amberPale,
                    color:impact==="high"?C.green:impact==="medium"?C.blue:C.amber}}>
                    {impact==="high"?"Strong signal":impact==="medium"?"Good signal":"Weak signal"}
                  </span>
                </div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{text}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Job matches */}
        <div>
          <Card style={{marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:16}}>💼 Best Job Matches For You</div>
            {JOBS.map(j=>(
              <div key={j.title} onClick={()=>setSelected(selected?.title===j.title?null:j)}
                style={{padding:"12px",borderRadius:12,border:`1.5px solid ${selected?.title===j.title?C.blue:C.border}`,
                  background:selected?.title===j.title?C.bluePale:"white",cursor:"pointer",marginBottom:10,transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.text}}>{j.title}</div>
                    <div style={{fontSize:11,color:C.muted}}>{j.dept} · {j.pay} · {j.hours}</div>
                  </div>
                  <span style={{fontWeight:900,fontSize:15,color:matchColor(j.match)}}>{j.match}%</span>
                </div>
                <MatchBadge score={j.match}/>
                {selected?.title===j.title&&(
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.blue,marginBottom:6}}>Why you're a good fit:</div>
                    {j.why.map(w=>(
                      <div key={w} style={{display:"flex",gap:6,marginBottom:4}}>
                        <span style={{color:C.green,fontSize:12}}>✓</span>
                        <span style={{fontSize:12,color:C.text}}>{w}</span>
                      </div>
                    ))}
                    <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
                      {j.skills.map(s=><Pill key={s} text={s}/>)}
                    </div>
                    <button style={{width:"100%",marginTop:12,padding:"9px 0",borderRadius:10,
                      background:C.blue,color:"white",fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>
                      Apply Now via MyUNT Portal →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── ACADEMICS ───────────────────────────────────────────────────────────────
function Academics({user}) {
  const [view,setView]=useState("courses");
  const [ask,setAsk]=useState("");
  const [answer,setAnswer]=useState("");
  const [asking,setAsking]=useState(false);

  const handleAsk = () => {
    if(!ask.trim()) return;
    setAsking(true);
    setTimeout(()=>{
      setAnswer(`For your question about "${ask}" — based on your ${user.program} coursework, I'd recommend reviewing the related lecture recordings first (marked below). Key concepts to focus on: data preprocessing pipelines, evaluation metrics specific to your assignment context, and how to frame your analysis narrative. Your advisor Dr. ${user.advisor.split(" ")[1]} can also provide office hours support on this topic.`);
      setAsking(false);
    },1500);
  };

  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%",boxSizing:"border-box"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,color:C.text,margin:"0 0 4px",letterSpacing:-0.5}}>📚 Academics</h1>
        <p style={{color:C.muted,fontSize:14,margin:0}}>Your courses, recordings, assignments, and AI homework help</p>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {["courses","assignments","recordings","help"].map(v=>(
          <button key={v} onClick={()=>setView(v)}
            style={{padding:"8px 18px",borderRadius:10,border:`1px solid ${view===v?C.blue:C.border}`,
              background:view===v?C.bluePale:"white",color:view===v?C.blue:C.muted,
              fontWeight:600,fontSize:13,cursor:"pointer",textTransform:"capitalize"}}>
            {v==="help"?"✨ AI Help":v.charAt(0).toUpperCase()+v.slice(1)}
          </button>
        ))}
      </div>

      {view==="courses"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {COURSES.map(c=>(
            <Card key={c.code}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
                <div style={{width:42,height:42,borderRadius:12,background:c.color+"22",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:18,flexShrink:0}}>📖</div>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:2}}>{c.name}</div>
                  <div style={{fontSize:12,color:C.muted}}>{c.code} · {c.prof}</div>
                </div>
                <span style={{marginLeft:"auto",fontWeight:800,fontSize:18,color:c.color}}>{c.grade}</span>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:C.muted}}>Course progress</span>
                  <span style={{fontSize:12,fontWeight:600,color:C.text}}>{c.progress}%</span>
                </div>
                <div style={{height:6,borderRadius:3,background:C.border}}>
                  <div style={{width:`${c.progress}%`,height:"100%",borderRadius:3,background:c.color}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Pill text={`${c.recordings} recordings`} color={C.blue} bg={C.bluePale}/>
                <Pill text={`${c.assignments} due`} color={c.assignments>2?C.amber:C.green}
                  bg={c.assignments>2?C.amberPale:C.greenPale}/>
              </div>
            </Card>
          ))}
        </div>
      )}

      {view==="assignments"&&(
        <Card>
          {ASSIGNMENTS.map((a,i)=>(
            <div key={a.title} style={{display:"flex",alignItems:"center",gap:16,
              padding:"14px 0",borderBottom:i<ASSIGNMENTS.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{width:4,height:40,borderRadius:2,flexShrink:0,
                background:a.priority==="high"?C.amber:a.priority==="medium"?C.blue:C.muted}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,color:C.text,marginBottom:2}}>{a.title}</div>
                <div style={{fontSize:12,color:C.muted}}>{a.course} · Due: {a.due}</div>
              </div>
              <StatusDot status={a.status}/>
            </div>
          ))}
        </Card>
      )}

      {view==="recordings"&&(
        <Card>
          <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:16}}>Recent Lecture Recordings</div>
          {RECORDINGS.map((r,i)=>(
            <div key={r.title} style={{display:"flex",alignItems:"center",gap:14,
              padding:"14px 0",borderBottom:i<RECORDINGS.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{width:44,height:44,borderRadius:12,background:C.bluePale,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>▶️</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:2}}>{r.title}</div>
                <div style={{fontSize:12,color:C.muted}}>{r.course} · {r.date}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:600,color:C.muted}}>{r.duration}</div>
                <button style={{fontSize:11,color:C.blue,fontWeight:600,border:"none",
                  background:"none",cursor:"pointer",marginTop:2}}>Watch →</button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {view==="help"&&(
        <div>
          <Card style={{marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:4}}>✨ AI Assignment Help</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:16}}>
              Ask anything about your coursework. UniGuide AI uses your course context to give personalized help.
            </div>
            <div style={{display:"flex",gap:10}}>
              <input value={ask} onChange={e=>setAsk(e.target.value)}
                placeholder="e.g. How should I structure my capstone conclusion section?"
                style={{flex:1,padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,
                  fontSize:13,outline:"none",background:"white"}}
                onKeyDown={e=>e.key==="Enter"&&handleAsk()}/>
              <button onClick={handleAsk} disabled={asking||!ask.trim()}
                style={{padding:"12px 20px",borderRadius:10,background:C.blue,color:"white",
                  fontWeight:700,fontSize:13,border:"none",cursor:"pointer",
                  opacity:!ask.trim()?0.5:1}}>
                {asking?"...":"Ask"}
              </button>
            </div>
            {answer&&(
              <div style={{marginTop:16,padding:"14px 16px",borderRadius:12,
                background:C.bluePale,border:`1px solid ${C.blue}22`,fontSize:13,
                color:C.text,lineHeight:1.7}}>
                <span style={{fontWeight:700,color:C.blue}}>UniGuide AI: </span>{answer}
              </div>
            )}
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {["Explain this concept","Help me outline this essay","Check my reasoning"].map(q=>(
              <button key={q} onClick={()=>setAsk(q)}
                style={{padding:"12px 14px",borderRadius:12,border:`1px solid ${C.border}`,
                  background:"white",fontSize:12,fontWeight:600,color:C.text,cursor:"pointer",
                  textAlign:"left"}}>
                💬 {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CAREER ───────────────────────────────────────────────────────────────────
function Career({user}) {
  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%",boxSizing:"border-box"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,color:C.text,margin:"0 0 4px",letterSpacing:-0.5}}>💼 Career Match</h1>
        <p style={{color:C.muted,fontSize:14,margin:0}}>On-campus opportunities matched to your profile by AI — updated weekly</p>
      </div>
      <div style={{display:"grid",gap:16}}>
        {JOBS.map(j=>(
          <Card key={j.title} style={{padding:"20px 24px"}}>
            <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
              <div style={{width:52,height:52,borderRadius:14,background:matchBg(j.match),
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>💼</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:16,color:C.text,marginBottom:2}}>{j.title}</div>
                    <div style={{fontSize:13,color:C.muted}}>{j.dept} · {j.type} · {j.pay} · {j.hours}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:26,fontWeight:900,color:matchColor(j.match),lineHeight:1}}>{j.match}%</div>
                    <div style={{fontSize:10,color:C.muted}}>AI Match</div>
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <MatchBadge score={j.match}/>
                </div>
                <div style={{display:"flex",gap:16,marginBottom:14}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Why you qualify</div>
                    {j.why.map(w=>(
                      <div key={w} style={{display:"flex",gap:6,marginBottom:3}}>
                        <span style={{color:C.green,fontSize:12}}>✓</span>
                        <span style={{fontSize:12,color:C.text}}>{w}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Skills</div>
                    <div>{j.skills.map(s=><Pill key={s} text={s}/>)}</div>
                  </div>
                </div>
                <button style={{padding:"10px 24px",borderRadius:10,background:C.blue,color:"white",
                  fontWeight:700,fontSize:13,border:"none",cursor:"pointer"}}>
                  Apply via MyUNT →
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── SCHOLARSHIPS ────────────────────────────────────────────────────────────
function Scholarships({user}) {
  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%",boxSizing:"border-box"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,color:C.text,margin:"0 0 4px",letterSpacing:-0.5}}>🎓 Scholarships</h1>
        <p style={{color:C.muted,fontSize:14,margin:0}}>Opportunities matched to your program, GPA, and status</p>
      </div>
      <div style={{display:"grid",gap:14}}>
        {SCHOLARSHIPS.map(s=>(
          <Card key={s.name} style={{borderLeft:`4px solid ${s.eligible?C.green:C.border}`}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontWeight:800,fontSize:15,color:C.text}}>{s.name}</span>
                  {s.eligible&&<Pill text="Eligible" color={C.green} bg={C.greenPale}/>}
                </div>
                <div style={{fontSize:13,color:C.muted,marginBottom:8}}>{s.req}</div>
                <div style={{display:"flex",gap:16,alignItems:"center"}}>
                  <span style={{fontSize:11,color:C.amber,fontWeight:600}}>⏰ Deadline: {s.deadline}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:C.muted}}>AI Match:</span>
                    <span style={{fontWeight:700,fontSize:13,color:matchColor(s.match)}}>{s.match}%</span>
                  </div>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:24,fontWeight:900,color:C.green,marginBottom:4}}>{s.amount}</div>
                {s.eligible&&(
                  <button style={{padding:"8px 16px",borderRadius:10,background:C.green,color:"white",
                    fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>Apply →</button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
function Appointments({user}) {
  const slots=[
    {date:"Tue, Apr 29",time:"10:00 AM",available:true},{date:"Tue, Apr 29",time:"2:30 PM",available:true},
    {date:"Wed, Apr 30",time:"11:00 AM",available:false},{date:"Thu, May 1",time:"9:00 AM",available:true},
    {date:"Thu, May 1",time:"3:00 PM",available:true},{date:"Fri, May 2",time:"1:00 PM",available:true},
  ];
  const [booked,setBooked]=useState(null);
  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%",boxSizing:"border-box"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,color:C.text,margin:"0 0 4px",letterSpacing:-0.5}}>📅 Appointments</h1>
        <p style={{color:C.muted,fontSize:14,margin:0}}>Book advising sessions with your assigned advisor</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card>
          <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:20}}>
            <Avatar name={user.advisor} size={52} bg={C.teal}/>
            <div>
              <div style={{fontWeight:700,fontSize:16,color:C.text}}>{user.advisor}</div>
              <div style={{fontSize:13,color:C.muted}}>Academic Advisor · Dept. of Information Science</div>
              <div style={{fontSize:12,color:C.blue,marginTop:2}}>{user.advisorEmail}</div>
            </div>
          </div>
          <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:12}}>Available Slots</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {slots.map((s,i)=>(
              <button key={i} disabled={!s.available} onClick={()=>setBooked(s)}
                style={{padding:"10px 12px",borderRadius:10,textAlign:"left",cursor:s.available?"pointer":"default",
                  border:`1.5px solid ${!s.available?C.border:booked===s?C.blue:C.border}`,
                  background:!s.available?"#F8F9FA":booked===s?C.bluePale:"white",
                  opacity:s.available?1:0.45,transition:"all 0.2s"}}>
                <div style={{fontSize:11,fontWeight:700,color:booked===s?C.blue:C.text}}>{s.date}</div>
                <div style={{fontSize:12,color:C.muted}}>{s.time}</div>
              </button>
            ))}
          </div>
          {booked&&(
            <div style={{marginTop:16,padding:"12px 14px",borderRadius:12,background:C.greenPale,
              border:`1px solid ${C.green}44`}}>
              <div style={{fontWeight:700,fontSize:13,color:C.green}}>✅ Appointment Booked</div>
              <div style={{fontSize:12,color:C.text,marginTop:2}}>{booked.date} at {booked.time} with {user.advisor}</div>
            </div>
          )}
        </Card>
        <Card>
          <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:12}}>Prepare for Your Session</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.6}}>UniGuide AI has prepared a briefing for your advisor based on your current profile and academic standing.</div>
          {[
            ["📊","Your AI advisory score is 96% — top 8% of undergraduates"],
            ["💼","3 on-campus job matches ready to discuss"],
            ["🎓","2 scholarship deadlines coming up (Apr 30, May 15)"],
            ["📚","2 high-priority assignments due this week"],
          ].map(([icon,text])=>(
            <div key={text} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:16}}>{icon}</span>
              <span style={{fontSize:13,color:C.text,lineHeight:1.5}}>{text}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function Profile({user}) {
  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%",boxSizing:"border-box"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,color:C.text,margin:"0 0 4px",letterSpacing:-0.5}}>👤 My Profile</h1>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:20}}>
        <Card style={{textAlign:"center",padding:"28px 20px"}}>
          <Avatar name={user.name} size={80} bg={C.blue}/>
          <div style={{fontWeight:800,fontSize:18,color:C.text,marginTop:14,marginBottom:2}}>{user.name}</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:4}}>{user.email}</div>
          <div style={{fontSize:12,color:C.blue,marginBottom:20}}>EUID: {user.euid}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            {[["GPA",user.gpa,"#2E7D32"],["Sem #",user.semester,"#1565C0"],["Credits",user.credits,"#00695C"],["AI Score",`${user.matchScore}%`,"#F9A825"]].map(([l,v,c])=>(
              <div key={l} style={{background:C.bg,borderRadius:10,padding:"10px 8px"}}>
                <div style={{fontWeight:800,fontSize:18,color:c}}>{v}</div>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase"}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:4}}>
            {(user.scholarships||[]).map(s=><Pill key={s} text={s}/>)}
            {(user.interests||[]).map(s=><Pill key={s} text={s} color={C.teal} bg={C.tealPale}/>)}
          </div>
        </Card>
        <div>
          <Card style={{marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:16}}>Academic Information</div>
            {[
              ["Student Level",user.level],["Program",user.program],
              ["Student Status",user.status],["Nationality",user.nationality],
              ["Academic Advisor",user.advisor],["Advisor Email",user.advisorEmail],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{width:160,fontSize:13,fontWeight:600,color:C.muted,flexShrink:0}}>{k}</span>
                <span style={{fontSize:13,color:C.text}}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:12}}>Notification Preferences</div>
            {[
              ["🔔 Scholarship deadlines","email"],["📅 Appointment reminders","push"],
              ["💼 New job matches","email"],["📊 Weekly AI advisory updates","email"],
            ].map(([label])=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:13,color:C.text}}>{label}</span>
                <div style={{width:36,height:20,borderRadius:10,background:C.blue,
                  position:"relative",cursor:"pointer"}}>
                  <div style={{position:"absolute",right:3,top:3,width:14,height:14,
                    borderRadius:"50%",background:"white"}}/>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function MainApp({user,tab,setTab}) {
  const content = {
    dashboard: <Dashboard user={user} setTab={setTab}/>,
    advisor:   <AIAdvisor user={user}/>,
    academics: <Academics user={user}/>,
    career:    <Career user={user}/>,
    scholarships: <Scholarships user={user}/>,
    appointments: <Appointments user={user}/>,
    profile:   <Profile user={user}/>,
  };
  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",
      fontFamily:"system-ui,-apple-system,BlinkMacSystemFont,sans-serif",background:C.bg}}>
      <Sidebar tab={tab} setTab={setTab} user={user}/>
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {content[tab]||<Dashboard user={user} setTab={setTab}/>}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("login");
  const [tab,setTab]=useState("dashboard");
  const [user,setUser]=useState(null);

  if(screen==="login")
    return <LoginScreen onLogin={u=>{setUser(u||DEMO);setScreen("onboard");}}/>;
  if(screen==="onboard")
    return <OnboardingFlow onComplete={d=>{setUser({...DEMO,...d});setScreen("app");}}/>;
  return <MainApp user={user||DEMO} tab={tab} setTab={setTab}/>;
}
