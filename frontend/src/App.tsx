import { useState, useRef, useMemo } from "react";
import {
  LayoutDashboard, BrainCircuit, BookOpen, Briefcase,
  CalendarDays, UserCircle2, Play, Clock, Zap, Target,
  TrendingUp, CheckCircle2, AlertCircle, Send, Check,
  Bell, Sparkles, ArrowRight, ChevronRight, Award,
  Brain, Cpu, BookMarked, FileText, Video, HelpCircle, Circle,
  Mail, BarChart3, Shield, Layers
} from "lucide-react";
import "../styles/fonts.css";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  ink:      "#0C1523",
  slate:    "#1A2638",
  slateMid: "#213147",
  slateAccent: "#2D4060",
  azure:    "#2563EB",
  azureHover:"#1D4ED8",
  azurePale: "#EFF6FF",
  azureMid:  "#DBEAFE",
  amber:    "#D97706",
  amberPale: "#FFFBEB",
  amberMid:  "#FEF3C7",
  sage:     "#059669",
  sagePale:  "#ECFDF5",
  sageMid:   "#D1FAE5",
  rose:     "#DC2626",
  rosePale:  "#FEF2F2",
  paper:    "#F3F5F8",
  chalk:    "#FFFFFF",
  line:     "#E4E7ED",
  lineDark:  "#CDD2DB",
  mist:     "#6B7280",
  haze:     "#9CA3AF",
  gold:     "#F59E0B",
};

const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Cascadia Code', monospace";

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO = {
  name:"Yash Bhamore", email:"yash.bhamore@unt.edu",
  euid:"ybm0042", age:21, level:"Undergraduate",
  program:"Data Science", semester:3, credits:12,
  gpa:3.7, matchScore:96, nationality:"American", status:"Domestic",
  advisor:"Dr. Sarah Mitchell", advisorEmail:"sarah.mitchell@unt.edu",
  scholarships:["Merit Scholarship","In-State Award"],
  interests:["Healthcare Analytics","Entrepreneurship"],
};

const COURSES = [
  {code:"INFO 4820",name:"Machine Learning Applications",prof:"Dr. Park",progress:72,grade:"A−",credits:3,color:T.azure,recordings:4,assignments:2},
  {code:"INFO 5082",name:"Data Science Capstone",prof:"Dr. Whitworth",progress:88,grade:"A",credits:3,color:T.sage,recordings:6,assignments:1},
  {code:"MATH 3680",name:"Applied Statistics",prof:"Dr. Chen",progress:55,grade:"B+",credits:3,color:"#7C3AED",recordings:3,assignments:3},
  {code:"INFO 4550",name:"Cloud Data Engineering",prof:"Dr. Voss",progress:40,grade:"B",credits:3,color:T.amber,recordings:2,assignments:4},
];

const JOBS = [
  {title:"Research Assistant",dept:"Data Science Dept.",match:94,type:"On-Campus",pay:"$14/hr",hours:"10–15 hrs/wk",
    skills:["Python","Data Analysis"],
    why:["Your DS program is a direct match","Strong GPA (3.7) meets the 3.5 threshold","Semester 3 timing aligns with typical hire windows"]},
  {title:"IT Help Desk Specialist",dept:"UNT IT Services",match:88,type:"On-Campus",pay:"$13/hr",hours:"12–20 hrs/wk",
    skills:["Technical Support","Communication"],
    why:["Your technical background is a strong fit","Domestic status simplifies employment paperwork","Full-time enrollment preferred — you qualify"]},
  {title:"Student Ambassador",dept:"Office of Admissions",match:82,type:"On-Campus",pay:"$12/hr",hours:"8–12 hrs/wk",
    skills:["Public Speaking","Campus Knowledge"],
    why:["Semester 3 = enough campus experience","Data Science major is a growing program to promote","Your age and communication skills are ideal"]},
  {title:"Library Research Aide",dept:"Willis Library",match:76,type:"On-Campus",pay:"$12.50/hr",hours:"10–15 hrs/wk",
    skills:["Research","Attention to Detail"],
    why:["Flexible hours fit a 12-credit schedule","Your research interest signals academic motivation","Graduate-adjacent role — builds your CV"]},
];

const SCHOLARSHIPS = [
  {name:"Data Science Excellence Award",amount:"$3,000",deadline:"May 15, 2026",match:92,eligible:true,req:"Open to UNT Data Science majors with a cumulative GPA of 3.5 or higher and domestic enrollment status."},
  {name:"UNT Merit Scholarship Renewal",amount:"$2,500",deadline:"Apr 30, 2026",match:95,eligible:true,req:"Renewable annually for students maintaining a cumulative GPA of 3.5 or above across all semesters."},
  {name:"STEM Futures Fund",amount:"$1,500",deadline:"Jun 1, 2026",match:80,eligible:true,req:"Available to sophomore-level or higher students enrolled in any STEM-designated program at UNT."},
  {name:"Texas Public Education Grant",amount:"$4,200",deadline:"Jul 1, 2026",match:70,eligible:false,req:"Need-based state grant requiring a completed FAFSA. Priority given to first-generation college students."},
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

const DEFAULT_PORTAL = {
  user: DEMO,
  courses: COURSES,
  jobs: JOBS,
  scholarships: SCHOLARSHIPS,
  assignments: ASSIGNMENTS,
  recordings: RECORDINGS,
  insights: {
    jobMatch: 96,
    scholarshipMatch: 88,
    workStudyMatch: 74,
    signals: [
      { factor:"Age (21)", signal:"Strong", positive:true, text:"Students aged 19-23 are commonly hired on campus." },
      { factor:"Data Science Major", signal:"Strong", positive:true, text:"Your program is a strong signal for technical campus roles." },
      { factor:"Semester 3 Timing", signal:"Good", positive:true, text:"Your current semester suggests enough campus familiarity." },
    ],
    briefing: [
      "AI advisory score is 96% for on-campus work.",
      "3 on-campus job matches are ready to discuss.",
      "2 scholarship opportunities are marked eligible.",
      "2 academic tasks are currently high priority.",
    ],
    topPercentLabel: "Top 8% of students",
  },
};

type PortalData = typeof DEFAULT_PORTAL;
type PortalUser = PortalData["user"];

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const initials = (n: string) => n.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
const matchColor = (m: number) => m>=90?T.sage:m>=75?T.azure:m>=60?T.amber:T.rose;
const matchBg = (m: number) => m>=90?T.sagePale:m>=75?T.azurePale:m>=60?T.amberPale:T.rosePale;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

// SVG Ring Score
const ScoreRing = ({ score, size=88, strokeW=6, color=T.azure }: { score:number; size?:number; strokeW?:number; color?:string }) => {
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", display:"block" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.line} strokeWidth={strokeW}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:FONT_MONO, fontSize:size*0.195, fontWeight:700, color:T.ink, lineHeight:1 }}>{score}%</span>
        <span style={{ fontSize:9, color:T.mist, textTransform:"uppercase", letterSpacing:"0.07em", marginTop:2 }}>AI Score</span>
      </div>
    </div>
  );
};

// Avatar
const Avatar = ({ name, size=36, bg=T.azure }: { name:string; size?:number; bg?:string }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:bg,
    display:"flex", alignItems:"center", justifyContent:"center",
    color:"white", fontFamily:FONT_MONO, fontWeight:700, fontSize:size*0.33, flexShrink:0 }}>
    {initials(name)}
  </div>
);

// Card
const Card = ({ children, style={} }: { children:React.ReactNode; style?:React.CSSProperties }) => (
  <div style={{ background:T.chalk, borderRadius:12, padding:"20px 22px",
    border:`1px solid ${T.line}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </div>
);

// AI Badge
const AIBadge = ({ label="AI-Powered" }: { label?:string }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px",
    borderRadius:20, background:"linear-gradient(135deg, #EFF6FF 0%, #E0E7FF 100%)",
    border:`1px solid #C7D2FE`, fontSize:10, fontWeight:700, color:T.azure,
    textTransform:"uppercase", letterSpacing:"0.06em" }}>
    <Cpu size={9} strokeWidth={2.5}/>{label}
  </span>
);

// Tag Pill
const Pill = ({ text, color=T.azure, bg=T.azurePale }: { text:string; color?:string; bg?:string }) => (
  <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:6,
    fontSize:11, fontWeight:600, color, background:bg, marginRight:4, marginBottom:4 }}>{text}</span>
);

// Match bar
const MatchBar = ({ score }: { score:number }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <div style={{ flex:1, height:4, borderRadius:2, background:T.line, overflow:"hidden" }}>
      <div style={{ width:`${score}%`, height:"100%", borderRadius:2, background:matchColor(score) }}/>
    </div>
    <span style={{ fontFamily:FONT_MONO, fontWeight:700, fontSize:12, color:matchColor(score), minWidth:32 }}>{score}%</span>
  </div>
);

// Status badge
const StatusBadge = ({ status }: { status:string }) => {
  const map: Record<string,[string,string,React.ReactNode]> = {
    "in-progress": [T.azure, T.azurePale, <Clock size={10} key="c"/>],
    "not-started": [T.amber, T.amberPale, <AlertCircle size={10} key="a"/>],
    "submitted":   [T.sage, T.sagePale, <CheckCircle2 size={10} key="s"/>],
  };
  const [col,bg,icon] = map[status]||[T.mist,"#F3F4F6",<Circle size={10} key="x"/>];
  const labels: Record<string,string> = {"in-progress":"In Progress","not-started":"To Do","submitted":"Submitted"};
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px",
      borderRadius:6, background:bg, fontSize:11, fontWeight:600, color:col }}>
      {icon}{labels[status]||status}
    </span>
  );
};

// Section Header
const SectionHeader = ({ title, sub, action, onAction }: { title:string; sub?:string; action?:string; onAction?:()=>void }) => (
  <div style={{ marginBottom:24 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:800, color:T.ink, margin:0, letterSpacing:"-0.03em", fontFamily:FONT_BODY }}>{title}</h1>
        {sub && <p style={{ color:T.mist, fontSize:13, margin:"4px 0 0", fontFamily:FONT_BODY }}>{sub}</p>}
      </div>
      {action && (
        <button onClick={onAction} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 14px",
          borderRadius:8, border:`1px solid ${T.line}`, background:T.chalk, color:T.azure,
          fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONT_BODY }}>
          {action}<ChevronRight size={13}/>
        </button>
      )}
    </div>
  </div>
);

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, loading }: { onLogin:(identifier:string)=>void; loading:boolean }) {
  const [tab, setTab] = useState<"login"|"signup">("login");
  const [loginId, setLoginId] = useState("demo@unt.edu");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupEuid, setSignupEuid] = useState("");

  const handleDemo = () => {
    onLogin("demo@unt.edu");
  };

  const features = [
    { icon:<BrainCircuit size={16}/>, title:"Adaptive AI Advisor", desc:"Job & scholarship recommendations calibrated to your exact profile, GPA, and semester" },
    { icon:<BookOpen size={16}/>, title:"Unified Academic Hub", desc:"Courses, lecture recordings, and assignment deadlines in one structured view" },
    { icon:<Target size={16}/>, title:"Precision Career Match", desc:"On-campus roles ranked by real compatibility — not generic listings" },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:FONT_BODY }}>
      {/* Left panel */}
      <div style={{ width:"46%", background:T.slate, padding:"48px 52px",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        position:"relative", overflow:"hidden" }}>
        {/* Subtle dot-grid background */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:0.06 }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
        {/* Accent blob */}
        <div style={{ position:"absolute", top:-100, right:-100, width:320, height:320, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-80, left:-60, width:260, height:260, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)", pointerEvents:"none" }}/>

        <div style={{ position:"relative" }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:52 }}>
            <div style={{ width:40, height:40, borderRadius:10,
              background:"linear-gradient(135deg, #2563EB, #3B82F6)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Brain size={20} color="white" strokeWidth={1.8}/>
            </div>
            <div>
              <div style={{ color:"white", fontWeight:800, fontSize:17, letterSpacing:"-0.03em" }}>UniGuide AI</div>
              <div style={{ color:"rgba(255,255,255,0.38)", fontSize:10, letterSpacing:"0.05em", textTransform:"uppercase" }}>University of North Texas</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginBottom:12 }}>
            <span style={{ fontSize:10, fontWeight:700, color:T.azure, textTransform:"uppercase", letterSpacing:"0.1em" }}>
              Research Intelligence Platform
            </span>
          </div>
          <h1 style={{ color:"white", fontSize:38, fontWeight:800, lineHeight:1.12,
            margin:"0 0 20px", letterSpacing:"-0.04em", fontFamily:FONT_BODY }}>
            Your academic<br/>intelligence,<br/>
            <span style={{ color:T.gold }}>personalized.</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:14, lineHeight:1.75, marginBottom:44, maxWidth:340 }}>
            One platform for advising, academics, career matching, and explainable AI guidance — built specifically for UNT students.
          </p>

          {features.map(f => (
            <div key={f.title} style={{ display:"flex", gap:14, marginBottom:22 }}>
              <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
                background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.08)",
                display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.7)" }}>
                {f.icon}
              </div>
              <div>
                <div style={{ color:"white", fontWeight:600, fontSize:13 }}>{f.title}</div>
                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, lineHeight:1.55, marginTop:2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position:"relative", color:"rgba(255,255,255,0.25)", fontSize:10, letterSpacing:"0.04em" }}>
          INFO 5082 · Data Science Capstone · © 2026 UniGuide AI
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        background:T.paper, padding:48 }}>
        <div style={{ width:"100%", maxWidth:400 }}>
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:T.ink, margin:"0 0 5px", letterSpacing:"-0.03em" }}>
              {tab==="login" ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ color:T.mist, fontSize:13, margin:0 }}>
              {tab==="login" ? "Sign in with your UNT credentials" : "Set up your UniGuide AI profile"}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", background:"white", borderRadius:10, padding:4,
            marginBottom:22, border:`1px solid ${T.line}` }}>
            {(["login","signup"] as const).map(t => (
              <button key={t} onClick={()=>setTab(t)}
                style={{ flex:1, padding:"8px 0", borderRadius:7, border:"none", cursor:"pointer",
                  fontSize:13, fontWeight:600, transition:"all 0.18s", fontFamily:FONT_BODY,
                  background:tab===t?T.azure:"transparent", color:tab===t?"white":T.mist }}>
                {t==="login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {tab==="login" ? (
            <div>
              {[["EUID or Email","email","ybm0042@my.unt.edu"],["Password","password","••••••••"]].map(([label,type,ph])=>(
                <div key={label} style={{ marginBottom:14 }}>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:T.ink,
                    marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:FONT_BODY }}>{label}</label>
                  <input type={type} placeholder={ph}
                    value={label==="EUID or Email" ? loginId : undefined}
                    onChange={e=>label==="EUID or Email" && setLoginId(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", borderRadius:9, fontSize:13,
                      border:`1px solid ${T.line}`, outline:"none", boxSizing:"border-box",
                      background:"white", color:T.ink, fontFamily:FONT_BODY }}/>
                </div>
              ))}
              <button onClick={()=>onLogin(loginId || "demo@unt.edu")} disabled={loading}
                style={{ width:"100%", padding:"12px 0", borderRadius:9,
                  background:loading?"#93AFEF":T.azure, color:"white", fontWeight:700,
                  fontSize:14, border:"none", cursor:"pointer", marginTop:4, fontFamily:FONT_BODY,
                  transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {loading ? (
                  <>
                    <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)",
                      borderTopColor:"white", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/>
                    Signing in…
                  </>
                ) : "Log In"}
              </button>

              <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0" }}>
                <div style={{ flex:1, height:1, background:T.line }}/>
                <span style={{ color:T.haze, fontSize:11 }}>or try the demo</span>
                <div style={{ flex:1, height:1, background:T.line }}/>
              </div>

              <button onClick={handleDemo} disabled={loading}
                style={{ width:"100%", padding:"11px 0", borderRadius:9,
                  border:`1.5px solid ${T.azure}`, background:"white", color:T.azure,
                  fontWeight:700, fontSize:13, cursor:"pointer", display:"flex",
                  alignItems:"center", justifyContent:"center", gap:8, fontFamily:FONT_BODY }}>
                <Zap size={14}/> Quick Demo — Yash Bhamore
              </button>
            </div>
          ) : (
            <div>
              {[["Full Name","text","Alex Johnson"],["UNT Email","email","abc0001@my.unt.edu"],["EUID","text","abc0001"],["Password","password","Create a password"]].map(([label,type,ph])=>(
                <div key={label} style={{ marginBottom:13 }}>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:T.ink,
                    marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:FONT_BODY }}>{label}</label>
                  <input type={type} placeholder={ph}
                    value={label==="UNT Email" ? signupEmail : label==="EUID" ? signupEuid : undefined}
                    onChange={e=>{
                      if (label==="UNT Email") setSignupEmail(e.target.value);
                      if (label==="EUID") setSignupEuid(e.target.value);
                    }}
                    style={{ width:"100%", padding:"11px 13px", borderRadius:9, fontSize:13,
                      border:`1px solid ${T.line}`, outline:"none", boxSizing:"border-box",
                      background:"white", color:T.ink, fontFamily:FONT_BODY }}/>
                </div>
              ))}
              <button onClick={()=>onLogin(signupEmail || signupEuid || "demo@unt.edu")} disabled={loading}
                style={{ width:"100%", padding:"12px 0", borderRadius:9, background:T.azure,
                  color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer",
                  marginTop:4, fontFamily:FONT_BODY, display:"flex", alignItems:"center",
                  justifyContent:"center", gap:8 }}>
                Create Account <ArrowRight size={15}/>
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function OnboardingFlow({ user, onComplete }: { user:PortalUser; onComplete:(d:Record<string, any>)=>void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    level:user.level, program:user.program, semester:user.semester,
    credits:user.credits, age:user.age, nationality:user.nationality, status:user.status,
    scholarship_merit:(user.scholarships||[]).some(s=>s.includes("Merit")),
    scholarship_instate:(user.scholarships||[]).some(s=>s.includes("State")),
    scholarship_athlete:(user.scholarships||[]).some(s=>s.includes("Athlete")),
    scholarship_alumni:(user.scholarships||[]).some(s=>s.includes("Alumni")),
    aid_grant:false,
    interest_health:(user.interests||[]).some(s=>s.includes("Healthcare")),
    interest_entrep:(user.interests||[]).some(s=>s.includes("Entrepreneur")),
    interest_ai:(user.interests||[]).some(s=>s.includes("AI")),
    interest_biz:(user.interests||[]).some(s=>s.includes("Business")),
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { title:"About You", sub:"Help us personalize your UniGuide AI experience", icon:<UserCircle2 size={18}/> },
    { title:"Your Academics", sub:"So we can surface the right opportunities and guidance", icon:<BookOpen size={18}/> },
    { title:"Financial & Interests", sub:"To match you with scholarships and career paths", icon:<Award size={18}/> },
  ];

  const finish = () => {
    setLoading(true);
    const scholarships = [
      data.scholarship_merit ? "Merit Scholarship" : null,
      data.scholarship_instate ? "In-State Award" : null,
      data.scholarship_athlete ? "Athlete Scholarship" : null,
      data.scholarship_alumni ? "Alumni Award" : null,
    ].filter(Boolean) as string[];
    const interests = [
      data.interest_health ? "Healthcare Analytics" : null,
      data.interest_entrep ? "Entrepreneurship" : null,
      data.interest_ai ? "AI & Machine Learning" : null,
      data.interest_biz ? "Business Strategy" : null,
    ].filter(Boolean) as string[];
    setTimeout(()=>onComplete({
      age:data.age,
      nationality:data.nationality,
      status:data.status,
      program:data.program,
      level:data.level,
      semester:data.semester,
      credits:data.credits,
      scholarships,
      interests,
      schol_merit:data.scholarship_merit ? 1 : 0,
      schol_in_state:data.scholarship_instate ? 1 : 0,
      schol_athlete:data.scholarship_athlete ? 1 : 0,
      schol_alumni:data.scholarship_alumni ? 1 : 0,
      aid_in_state_grant:data.aid_grant ? 1 : 0,
      int_healthcare_analytics:data.interest_health ? 1 : 0,
      int_entrepreneurship:data.interest_entrep ? 1 : 0,
    }), 1200);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.paper, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:24, fontFamily:FONT_BODY }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40 }}>
        <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#2563EB,#3B82F6)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Brain size={18} color="white" strokeWidth={1.8}/>
        </div>
        <span style={{ fontWeight:800, fontSize:17, color:T.ink, letterSpacing:"-0.03em" }}>UniGuide AI</span>
      </div>

      <div style={{ width:"100%", maxWidth:520 }}>
        {/* Step indicators */}
        <div style={{ display:"flex", gap:6, marginBottom:8, alignItems:"center" }}>
          {steps.map((_s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
              <div style={{ flex:1, height:3, borderRadius:2,
                background:i<=step?T.azure:T.line, transition:"background 0.3s" }}/>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:28 }}>
          {steps.map((s,i) => (
            <span key={i} style={{ fontSize:10, fontWeight:600, color:i<=step?T.azure:T.haze,
              textTransform:"uppercase", letterSpacing:"0.06em" }}>
              {i+1}. {s.title}
            </span>
          ))}
        </div>

        {loading ? (
          <Card style={{ textAlign:"center", padding:"52px 24px" }}>
            <div style={{ width:56, height:56, borderRadius:"50%",
              background:T.azurePale, display:"flex", alignItems:"center",
              justifyContent:"center", margin:"0 auto 20px" }}>
              <Brain size={26} color={T.azure}/>
            </div>
            <div style={{ fontSize:17, fontWeight:700, color:T.ink, marginBottom:8 }}>
              Analyzing your profile…
            </div>
            <div style={{ fontSize:13, color:T.mist, marginBottom:28 }}>
              UniGuide AI is computing your personalized advisory insights
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:T.azure,
                  animation:`bounce 1s ${i*0.18}s ease-in-out infinite` }}/>
              ))}
            </div>
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
          </Card>
        ) : (
          <Card>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.azure, textTransform:"uppercase",
                letterSpacing:"0.09em", marginBottom:6 }}>Step {step+1} of {steps.length}</div>
              <h2 style={{ fontSize:20, fontWeight:800, color:T.ink, margin:"0 0 3px", letterSpacing:"-0.03em" }}>
                {steps[step].title}
              </h2>
              <p style={{ fontSize:13, color:T.mist, margin:0 }}>{steps[step].sub}</p>
            </div>

            {step===0 && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[["Age","number","age"],["Nationality","select","nationality"]].map(([label,type,key]) => (
                  <div key={key}>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.ink,
                      marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
                    {type==="select" ? (
                      <select value={(data as any)[key]} onChange={e=>setData({...data,[key]:e.target.value})}
                        style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${T.line}`,
                          fontSize:13, background:"white", color:T.ink, boxSizing:"border-box" as const, fontFamily:FONT_BODY }}>
                        {["American","Indian","Chinese","International","Other"].map(o=><option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={(data as any)[key]} min="17" max="45"
                        onChange={e=>setData({...data,[key]:+e.target.value})}
                        style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${T.line}`,
                          fontSize:13, boxSizing:"border-box" as const, background:"white", fontFamily:FONT_BODY }}/>
                    )}
                  </div>
                ))}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.ink,
                    marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Student Status</label>
                  <select value={data.status} onChange={e=>setData({...data,status:e.target.value})}
                    style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${T.line}`,
                      fontSize:13, background:"white", boxSizing:"border-box" as const, fontFamily:FONT_BODY }}>
                    <option>Domestic</option><option>International</option>
                  </select>
                </div>
              </div>
            )}

            {step===1 && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[["Program","select","program"],["Level","select","level"],["Semester #","number","semester"],["Credits This Sem","number","credits"]].map(([label,type,key])=>(
                  <div key={key}>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.ink,
                      marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
                    {type==="select" ? (
                      <select value={(data as any)[key]} onChange={e=>setData({...data,[key]:e.target.value})}
                        style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${T.line}`,
                          fontSize:13, background:"white", boxSizing:"border-box" as const, fontFamily:FONT_BODY }}>
                        {key==="program" ? ["Data Science","Computer Science","Engineering","Business","Arts","General"].map(o=><option key={o}>{o}</option>)
                          : ["Undergraduate","Graduate"].map(o=><option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type="number" value={(data as any)[key]}
                        onChange={e=>setData({...data,[key]:+e.target.value})}
                        style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${T.line}`,
                          fontSize:13, boxSizing:"border-box" as const, background:"white", fontFamily:FONT_BODY }}/>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step===2 && (
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:T.ink, textTransform:"uppercase",
                  letterSpacing:"0.06em", marginBottom:10 }}>Scholarships You Receive</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:22 }}>
                  {[["Merit Scholarship","scholarship_merit"],["In-State Award","scholarship_instate"],
                    ["Athlete Scholarship","scholarship_athlete"],["Alumni Award","scholarship_alumni"]].map(([label,key])=>(
                    <label key={key} style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 12px",
                      borderRadius:8, border:`1px solid ${(data as any)[key]?T.azure:T.line}`,
                      background:(data as any)[key]?T.azurePale:"white", cursor:"pointer",
                      fontSize:13, fontWeight:(data as any)[key]?600:400,
                      color:(data as any)[key]?T.azure:T.ink, transition:"all 0.18s" }}>
                      <input type="checkbox" checked={!!(data as any)[key]}
                        onChange={e=>setData({...data,[key]:e.target.checked})}
                        style={{ accentColor:T.azure }}/>{label}
                    </label>
                  ))}
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:T.ink, textTransform:"uppercase",
                  letterSpacing:"0.06em", marginBottom:10 }}>Areas of Interest</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[["Healthcare Analytics","interest_health"],["Entrepreneurship","interest_entrep"],
                    ["AI & Machine Learning","interest_ai"],["Business Strategy","interest_biz"]].map(([label,key])=>(
                    <label key={key} style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 12px",
                      borderRadius:8, border:`1px solid ${(data as any)[key]?T.azure:T.line}`,
                      background:(data as any)[key]?T.azurePale:"white", cursor:"pointer",
                      fontSize:13, fontWeight:(data as any)[key]?600:400,
                      color:(data as any)[key]?T.azure:T.ink, transition:"all 0.18s" }}>
                      <input type="checkbox" checked={!!(data as any)[key]}
                        onChange={e=>setData({...data,[key]:e.target.checked})}
                        style={{ accentColor:T.azure }}/>{label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
              <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}
                style={{ padding:"10px 22px", borderRadius:8, border:`1px solid ${T.line}`,
                  background:"white", color:step===0?T.haze:T.ink, fontWeight:600,
                  fontSize:13, cursor:step===0?"default":"pointer", fontFamily:FONT_BODY }}>
                Back
              </button>
              <button onClick={step<steps.length-1?()=>setStep(s=>s+1):finish}
                style={{ padding:"10px 26px", borderRadius:8, background:T.azure, color:"white",
                  fontWeight:700, fontSize:13, border:"none", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:8, fontFamily:FONT_BODY }}>
                {step<steps.length-1 ? <>Continue <ArrowRight size={14}/></> : "Finish Setup"}
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",    icon:<LayoutDashboard size={16}/>, label:"Dashboard" },
  { id:"advisor",      icon:<BrainCircuit size={16}/>,   label:"AI Advisor",   badge:"AI" },
  { id:"academics",    icon:<BookOpen size={16}/>,       label:"Academics" },
  { id:"career",       icon:<Briefcase size={16}/>,      label:"Career Match" },
  { id:"scholarships", icon:<Award size={16}/>,          label:"Scholarships" },
  { id:"appointments", icon:<CalendarDays size={16}/>,   label:"Appointments" },
  { id:"profile",      icon:<UserCircle2 size={16}/>,    label:"My Profile" },
];

function Sidebar({ tab, setTab, user }: { tab:string; setTab:(t:string)=>void; user:PortalUser }) {
  return (
    <div style={{ width:224, background:T.slate, minHeight:"100vh",
      display:"flex", flexDirection:"column", flexShrink:0, position:"relative" }}>
      {/* Dot bg */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:0.04 }}>
        <defs>
          <pattern id="sdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sdots)"/>
      </svg>

      {/* Logo */}
      <div style={{ padding:"22px 18px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"relative" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:8,
            background:"linear-gradient(135deg,#2563EB,#3B82F6)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Brain size={17} color="white" strokeWidth={1.8}/>
          </div>
          <div>
            <div style={{ color:"white", fontWeight:800, fontSize:15, letterSpacing:"-0.02em" }}>UniGuide AI</div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:9, textTransform:"uppercase", letterSpacing:"0.07em" }}>UNT Portal</div>
          </div>
        </div>
      </div>

      {/* User */}
      <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex", alignItems:"center", gap:10, position:"relative" }}>
        <Avatar name={user.name} size={34} bg={T.azure}/>
        <div style={{ overflow:"hidden" }}>
          <div style={{ color:"white", fontSize:12, fontWeight:600, whiteSpace:"nowrap",
            overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontFamily:FONT_MONO }}>
            {user.euid} · {user.level.slice(0,5)}.
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:"10px 10px", flex:1, position:"relative" }}>
        <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.22)",
          textTransform:"uppercase", letterSpacing:"0.1em", padding:"6px 8px 8px" }}>Navigation</div>
        {NAV.map(({ id, icon, label, badge }) => {
          const active = tab===id;
          return (
            <button key={id} onClick={()=>setTab(id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:9,
                padding:"9px 10px", borderRadius:8, border:"none", cursor:"pointer",
                textAlign:"left", marginBottom:1, transition:"all 0.15s",
                background:active?"rgba(37,99,235,0.25)":"transparent",
                borderLeft:active?`2.5px solid ${T.azure}`:"2.5px solid transparent" }}>
              <span style={{ color:active?"white":"rgba(255,255,255,0.45)", flexShrink:0 }}>{icon}</span>
              <span style={{ fontSize:12.5, fontWeight:active?700:500,
                color:active?"white":"rgba(255,255,255,0.55)", flex:1 }}>{label}</span>
              {badge && (
                <span style={{ fontSize:8, fontWeight:800, padding:"2px 6px", borderRadius:5,
                  background:T.azure, color:"white", letterSpacing:"0.04em" }}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer stats */}
      <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(255,255,255,0.06)", position:"relative" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.05em" }}>AI Match</span>
          <span style={{ fontSize:10, fontFamily:FONT_MONO, fontWeight:700, color:T.gold }}>{user.matchScore}%</span>
        </div>
        <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,0.08)" }}>
          <div style={{ width:`${user.matchScore}%`, height:"100%", borderRadius:2,
            background:`linear-gradient(90deg, ${T.azure}, ${T.gold})` }}/>
        </div>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.22)", marginTop:8,
          display:"flex", gap:8, fontFamily:FONT_MONO }}>
          <span>GPA {user.gpa}</span>
          <span>·</span>
          <span>Sem {user.semester}</span>
          <span>·</span>
          <span>{user.credits} cr.</span>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, setTab, jobs, assignments, insights }: { user:PortalUser; setTab:(t:string)=>void; jobs:PortalData["jobs"]; assignments:PortalData["assignments"]; insights:PortalData["insights"] }) {
  const hour = new Date().getHours();
  const greet = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const urgent = assignments.filter(a=>a.status!=="submitted"&&a.priority==="high");

  return (
    <div style={{ padding:"28px 30px", overflowY:"auto", height:"100%", boxSizing:"border-box" as const, fontFamily:FONT_BODY }}>
      {/* Greeting */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.mist, textTransform:"uppercase",
          letterSpacing:"0.08em", marginBottom:6, fontFamily:FONT_MONO }}>
          {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
        </div>
        <h1 style={{ fontSize:24, fontWeight:800, color:T.ink, margin:0, letterSpacing:"-0.03em" }}>
          {greet}, {user.name.split(" ")[0]}
        </h1>
        <p style={{ color:T.mist, fontSize:13, margin:"4px 0 0" }}>
          {user.program} · Semester {user.semester} · {user.level}
        </p>
      </div>

      {/* AI Hero */}
      <div style={{ background:T.slate, borderRadius:14, padding:"22px 26px", marginBottom:20,
        position:"relative", overflow:"hidden", border:`1px solid ${T.slateMid}` }}>
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:0.05 }}>
          <defs><pattern id="hdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#hdots)"/>
        </svg>
        <div style={{ position:"absolute", right:-60, top:-60, width:240, height:240, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)", pointerEvents:"none" }}/>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:20, position:"relative" }}>
          <div style={{ flex:1 }}>
            <AIBadge label="Advisory Update"/>
            <h2 style={{ color:"white", fontSize:20, fontWeight:800, margin:"12px 0 8px", lineHeight:1.2, letterSpacing:"-0.03em" }}>
              You're a{" "}
              <span style={{ color:T.gold, fontFamily:FONT_MONO }}>{user.matchScore}%</span>
              {" "}match for on-campus employment
            </h2>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:12.5, lineHeight:1.65, margin:"0 0 18px", maxWidth:400 }}>
              Based on your age, program, and semester, UniGuide AI is personalizing the strongest current pathways for campus work and support.
            </p>
            <button onClick={()=>setTab("advisor")}
              style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px",
                borderRadius:8, background:T.azure, color:"white",
                fontWeight:700, fontSize:12, border:"none", cursor:"pointer", fontFamily:FONT_BODY }}>
              See My Matches <ArrowRight size={13}/>
            </button>
          </div>
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <ScoreRing score={user.matchScore} size={96} color={T.gold}/>
            <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, marginTop:6, fontFamily:FONT_MONO }}>
              {insights.topPercentLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {[
          { label:"GPA", val:user.gpa.toString(), sub:"Dean's List eligible", color:T.sage, icon:<TrendingUp size={14}/> },
          { label:"Credits", val:user.credits.toString(), sub:"This semester", color:T.azure, icon:<BookMarked size={14}/> },
          { label:"Semester", val:`#${user.semester}`, sub:`of ${user.level==="Graduate"?6:8}`, color:"#7C3AED", icon:<Layers size={14}/> },
          { label:"Urgent Tasks", val:urgent.length.toString(), sub:"Need attention", color:urgent.length>0?T.amber:T.sage, icon:<AlertCircle size={14}/> },
        ].map(({ label, val, sub, color, icon }) => (
          <Card key={label} style={{ padding:"15px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:T.mist, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</span>
              <span style={{ color, opacity:0.7 }}>{icon}</span>
            </div>
            <div style={{ fontFamily:FONT_MONO, fontSize:26, fontWeight:700, color, lineHeight:1, marginBottom:4 }}>{val}</div>
            <div style={{ fontSize:10, color:T.haze }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Job Matches */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Target size={14} color={T.azure}/>
              <span style={{ fontWeight:700, fontSize:14, color:T.ink }}>Top Job Matches</span>
            </div>
            <button onClick={()=>setTab("career")}
              style={{ fontSize:11, color:T.azure, fontWeight:600, border:"none", background:"none",
                cursor:"pointer", display:"flex", alignItems:"center", gap:3, fontFamily:FONT_BODY }}>
              View all <ChevronRight size={12}/>
            </button>
          </div>
          {jobs.slice(0,3).map(j => (
            <div key={j.title} style={{ display:"flex", alignItems:"center", gap:12,
              padding:"10px 0", borderBottom:`1px solid ${T.line}` }}>
              <div style={{ width:36, height:36, borderRadius:9, background:matchBg(j.match),
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Briefcase size={15} color={matchColor(j.match)}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:12.5, color:T.ink }}>{j.title}</div>
                <div style={{ fontSize:11, color:T.mist }}>{j.dept} · {j.pay}</div>
              </div>
              <span style={{ fontFamily:FONT_MONO, fontWeight:700, fontSize:13, color:matchColor(j.match), flexShrink:0 }}>{j.match}%</span>
            </div>
          ))}
        </Card>

        {/* Deadlines */}
        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
            <CalendarDays size={14} color={T.azure}/>
            <span style={{ fontWeight:700, fontSize:14, color:T.ink }}>Upcoming Deadlines</span>
          </div>
          {assignments.filter(a=>a.status!=="submitted").slice(0,4).map(a => (
            <div key={a.title} style={{ display:"flex", alignItems:"flex-start", gap:10,
              padding:"9px 0", borderBottom:`1px solid ${T.line}` }}>
              <div style={{ width:3, minHeight:36, borderRadius:2, flexShrink:0, marginTop:3,
                background:a.priority==="high"?T.amber:a.priority==="medium"?T.azure:T.haze }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:12, color:T.ink,
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.title}</div>
                <div style={{ fontSize:11, color:T.mist }}>{a.course} · Due {a.due.split(",")[0]}</div>
              </div>
              <StatusBadge status={a.status}/>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── AI ACTION CENTER ─────────────────────────────────────────────────────────
const QUICK_CHIPS = [
  "What scholarships should I apply to?",
  "How do I prepare for next semester?",
  "When is the registration deadline?",
  "What jobs match my profile?",
  "How do I meet with my advisor?",
];

function ActionCenter({ user, insights, assignments, scholarships }: {
  user: PortalUser;
  insights: PortalData["insights"];
  assignments: PortalData["assignments"];
  scholarships: PortalData["scholarships"];
}) {
  type Msg = { role:"user"|"ai"; text:string; sources?:{title:string;url:string}[] };
  const [messages, setMessages] = useState<Msg[]>([{
    role:"ai",
    text:`Hi ${user.name.split(" ")[0]}! I'm your UniGuide AI advisor. I can help with scholarship deadlines, registration steps, next semester planning, and anything UNT-related. What's on your mind?`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const actionCards = useMemo(() => {
    const cards: {icon:JSX.Element;title:string;sub:string;color:string;prompt:string}[] = [];
    assignments.filter(a=>a.priority==="high"&&a.status!=="submitted").slice(0,2).forEach(a=>{
      cards.push({icon:<AlertCircle size={15}/>,title:a.title,sub:`Due ${a.due.split(",")[0]} · ${a.course}`,color:T.amber,prompt:`How should I approach the assignment "${a.title}" for ${a.course}?`});
    });
    scholarships.filter(s=>s.eligible).slice(0,2).forEach(s=>{
      cards.push({icon:<Award size={15}/>,title:s.name,sub:`Deadline: ${s.deadline} · ${s.amount}`,color:T.sage,prompt:`Tell me about the ${s.name} scholarship and how to apply.`});
    });
    cards.push({icon:<CalendarDays size={15}/>,title:"Fall 2026 Registration Opens",sub:"Apr 30, 2026 · Requires advisor clearance",color:T.azure,prompt:"How do I register for Fall 2026 classes?"});
    return cards;
  }, [assignments, scholarships]);

  const localAnswer = (q: string): string => {
    const ql = q.toLowerCase();
    if (ql.includes("scholarship")||ql.includes("funding")||ql.includes("award")) {
      const eligible = scholarships.filter(s=>s.eligible);
      const names = eligible.map(s=>`${s.name} (${s.amount}, due ${s.deadline})`).join("; ");
      return `Based on your ${user.program} profile, you're eligible for ${eligible.length} scholarships: ${names}. I'd prioritize the one with the nearest deadline. Make sure your FAFSA is current before applying to any need-based awards.`;
    }
    if (ql.includes("register")||ql.includes("registration")||ql.includes("enroll")||ql.includes("next semester")||ql.includes("fall 2026")) {
      return `Fall 2026 registration opens Apr 30. Your checklist: (1) Get advisor clearance from ${user.advisor} — book a slot in the Appointments tab. (2) Review your degree plan for prerequisites. (3) Log into myUNT and add courses to your shopping cart. As a Semester ${user.semester} student, your priority window may already be active.`;
    }
    if (ql.includes("deadline")||ql.includes("due")) {
      const urgent = assignments.filter(a=>a.priority==="high"&&a.status!=="submitted");
      const schDue = scholarships.filter(s=>s.eligible).map(s=>`${s.name} (${s.deadline})`).join(", ");
      return `Upcoming deadlines: Academic — ${urgent.map(a=>`${a.title} (${a.due.split(",")[0]})`).join(", ")}. Scholarships — ${schDue}. Fall 2026 registration opens Apr 30. Block time this week for the highest-priority item first.`;
    }
    if (ql.includes("advisor")||ql.includes("appointment")||ql.includes("meet")||ql.includes("office hours")) {
      return `Your advisor is ${user.advisor} (${user.advisorEmail}). Book a session in the Appointments tab — slots are available as early as Apr 29. Before your meeting, prepare: (1) your tentative Fall 2026 schedule, (2) any scholarship questions, and (3) a Capstone progress update.`;
    }
    if (ql.includes("job")||ql.includes("career")||ql.includes("work")||ql.includes("apply")) {
      return `Your top on-campus matches are in the Career tab. Roles are ranked by AI match score based on your ${user.program} program and GPA of ${user.gpa}. Research-related roles tend to score highest for your profile. Check the Career tab for full details and the myUNT application link.`;
    }
    if (ql.includes("visa")||ql.includes("international")||ql.includes("f-1")||ql.includes("opt")||ql.includes("cpt")) {
      return `For international student questions, contact UNT's International Student & Scholar Services (iss@unt.edu). F-1 students can work up to 20 hrs/wk on campus during the semester. For OPT/CPT, start the application at least 90 days before your target start date.`;
    }
    if (ql.includes("research")||ql.includes("capstone")||ql.includes("project")) {
      return `For your Capstone, check the Academics tab for your current assignment status and recordings. ${user.advisor} can also connect you with faculty doing active research in ${user.program}. Research Assistant is typically a strong match for Data Science / CS profiles.`;
    }
    if (ql.includes("gpa")||ql.includes("grade")||ql.includes("academic")) {
      return `Your GPA of ${user.gpa} puts you above the 3.5 threshold for most merit scholarships and research positions. Your advisory score is ${user.matchScore}% (${insights.topPercentLabel}). Focus on completing any high-priority assignments to lock in your semester standing.`;
    }
    return `Based on your ${user.program} profile and Semester ${user.semester} standing, here's what I'd focus on this week: (1) Complete any high-priority assignments first, (2) Book an advisor meeting with ${user.advisor} to clear Fall 2026 registration, and (3) Check scholarship deadlines in the Scholarships tab. Is there a specific area you want to dig into?`;
  };

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(m=>[...m,{role:"user",text:q}]);
    setLoading(true);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
    // Always use localAnswer for the human-readable text; API only contributes source links.
    const text = localAnswer(q);
    let sources: {title:string;url:string}[] = [];
    try {
      const res = await fetch(`${API_BASE}/api/ask?q=${encodeURIComponent(q)}`,{signal:AbortSignal.timeout(4000)});
      if (res.ok) {
        const data = await res.json();
        sources = (data.sources || []).filter((s:{url:string})=>s.url);
      }
    } catch { /* no sources — that's fine */ }
    setMessages(m=>[...m,{role:"ai",text,sources:sources.length?sources:undefined}]);
    setLoading(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
  };

  return (
    <div style={{display:"flex",height:"100%",overflow:"hidden",fontFamily:FONT_BODY}}>
      {/* Left panel */}
      <div style={{width:290,borderRight:`1px solid ${T.line}`,overflowY:"auto",
        padding:"24px 16px",background:T.paper,flexShrink:0}}>
        <div style={{fontWeight:800,fontSize:13,color:T.ink,marginBottom:4}}>Priority Actions</div>
        <div style={{fontSize:11,color:T.mist,marginBottom:14}}>Tap a card to ask about it</div>
        {actionCards.map((card,i)=>(
          <div key={i} onClick={()=>setInput(card.prompt)}
            style={{padding:"12px 13px",borderRadius:10,marginBottom:8,cursor:"pointer",
              background:"white",border:`1.5px solid ${T.line}`,transition:"border-color 0.15s"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=card.color;}}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=T.line;}}>
            <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:7,flexShrink:0,
                background:card.color+"18",color:card.color,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                {card.icon}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:12,color:T.ink,marginBottom:2,
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.title}</div>
                <div style={{fontSize:10.5,color:T.mist,lineHeight:1.4}}>{card.sub}</div>
              </div>
            </div>
          </div>
        ))}
        <div style={{marginTop:20}}>
          <div style={{fontWeight:700,fontSize:12,color:T.ink,marginBottom:10}}>Next Semester Prep</div>
          {[
            {done:false,text:"Get advisor clearance"},
            {done:false,text:"Review degree plan"},
            {done:false,text:"Add courses to cart in myUNT"},
            {done:false,text:"Submit scholarship renewals"},
            {done:false,text:"Check financial aid status"},
          ].map(({done,text})=>(
            <div key={text} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",
              borderBottom:`1px solid ${T.line}`}}>
              <div style={{width:16,height:16,borderRadius:4,flexShrink:0,
                border:`1.5px solid ${done?T.sage:T.haze}`,background:done?T.sage:"transparent",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                {done&&<Check size={10} color="white" strokeWidth={3}/>}
              </div>
              <span style={{fontSize:11.5,color:done?T.mist:T.ink}}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — chat */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.line}`,background:"white",
          display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div style={{width:38,height:38,borderRadius:10,background:T.azurePale,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Brain size={20} color={T.azure}/>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:T.ink}}>UniGuide AI Action Center</div>
            <div style={{fontSize:11,color:T.mist}}>Powered by UNT guidance data · {insights.topPercentLabel}</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:T.sage}}/>
            <span style={{fontSize:11,color:T.sage,fontWeight:600}}>Online</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          {messages.map((msg,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:16,
              flexDirection:msg.role==="user"?"row-reverse":"row",alignItems:"flex-start"}}>
              {msg.role==="ai"&&(
                <div style={{width:32,height:32,borderRadius:8,background:T.azurePale,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                  <Brain size={16} color={T.azure}/>
                </div>
              )}
              <div style={{maxWidth:"72%",display:"flex",flexDirection:"column",gap:6,
                alignItems:msg.role==="user"?"flex-end":"flex-start"}}>
                <div style={{padding:"12px 15px",
                  borderRadius:msg.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
                  background:msg.role==="user"?T.azure:"white",
                  color:msg.role==="user"?"white":T.ink,
                  fontSize:13,lineHeight:1.6,
                  boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
                  border:msg.role==="ai"?`1px solid ${T.line}`:"none"}}>
                  {msg.text}
                </div>
                {msg.sources&&msg.sources.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap" as const,gap:4}}>
                    {msg.sources.map((src,si)=>(
                      <a key={si} href={src.url} target="_blank" rel="noreferrer"
                        style={{fontSize:10,padding:"2px 8px",borderRadius:5,
                          background:T.azurePale,color:T.azure,fontWeight:600,
                          textDecoration:"none",border:`1px solid ${T.azureMid}`}}>
                        {src.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading&&(
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:T.azurePale,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Brain size={16} color={T.azure}/>
              </div>
              <div style={{padding:"12px 15px",borderRadius:"14px 14px 14px 4px",
                background:"white",border:`1px solid ${T.line}`,display:"flex",gap:5,alignItems:"center"}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.azure,
                    animation:"acBounce 1s infinite",animationDelay:`${i*0.15}s`,opacity:0.6}}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Quick chips */}
        <div style={{padding:"0 24px 10px",display:"flex",gap:6,flexWrap:"wrap" as const,flexShrink:0}}>
          {QUICK_CHIPS.map(chip=>(
            <button key={chip} onClick={()=>setInput(chip)}
              style={{fontSize:11,padding:"5px 11px",borderRadius:20,
                background:"white",border:`1px solid ${T.line}`,
                color:T.ink,cursor:"pointer",fontFamily:FONT_BODY,fontWeight:500}}>
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{padding:"10px 24px 18px",borderTop:`1px solid ${T.line}`,background:"white",flexShrink:0}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
            <textarea
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
              placeholder="Ask about deadlines, registration, scholarships, or your next steps…"
              rows={2}
              style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${T.line}`,
                fontFamily:FONT_BODY,fontSize:13,color:T.ink,resize:"none" as const,
                outline:"none",lineHeight:1.5,background:T.paper}}
            />
            <button onClick={sendMessage} disabled={loading||!input.trim()}
              style={{width:42,height:42,borderRadius:10,flexShrink:0,
                background:input.trim()&&!loading?T.azure:T.haze,
                border:"none",cursor:input.trim()&&!loading?"pointer":"default",
                display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s"}}>
              <Send size={17} color="white"/>
            </button>
          </div>
          <div style={{fontSize:10,color:T.mist,marginTop:7,textAlign:"center" as const}}>
            Grounded in real UNT guidance data · {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
          </div>
        </div>
        <style>{`@keyframes acBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
      </div>
    </div>
  );
}

// ─── ACADEMICS ────────────────────────────────────────────────────────────────
function Academics({ user, courses, assignments, recordings }: { user:PortalUser; courses:PortalData["courses"]; assignments:PortalData["assignments"]; recordings:PortalData["recordings"] }) {
  const [view, setView] = useState("courses");
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const handleAsk = () => {
    if (!ask.trim()) return;
    setAsking(true);
    setTimeout(() => {
      setAnswer(
        `You asked: "${ask}" — here's what UniGuide AI recommends based on your ${user.program} profile. ` +
        `Start by revisiting the most recent lecture recording tied to this topic, then outline your response in three structured sections: ` +
        `context, analysis, and conclusion. For ${user.program}-specific framing, lean on the evaluation metrics and methodologies covered in your current coursework. ` +
        `If you're still uncertain after a first draft, ${user.advisor} holds office hours and can give direct feedback before your deadline.`
      );
      setAsking(false);
    }, 1500);
  };

  const subTabs = [
    { id:"courses", label:"Courses", icon:<BookOpen size={13}/> },
    { id:"assignments", label:"Assignments", icon:<FileText size={13}/> },
    { id:"recordings", label:"Recordings", icon:<Video size={13}/> },
    { id:"help", label:"AI Help", icon:<Sparkles size={13}/>, ai:true },
  ];

  return (
    <div style={{ padding:"28px 30px", overflowY:"auto", height:"100%", boxSizing:"border-box" as const, fontFamily:FONT_BODY }}>
      <SectionHeader title="Academics" sub="Courses, recordings, assignments, and AI homework assistance"/>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:22 }}>
        {subTabs.map(({ id, label, icon, ai }) => (
          <button key={id} onClick={()=>setView(id)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px",
              borderRadius:8, border:`1px solid ${view===id?T.azure:T.line}`,
              background:view===id?T.azure:"white",
              color:view===id?"white":T.mist, fontWeight:600, fontSize:12,
              cursor:"pointer", fontFamily:FONT_BODY, transition:"all 0.18s" }}>
            {icon}{label}{ai && <span style={{ fontSize:8, background:"rgba(255,255,255,0.25)",
              padding:"1px 5px", borderRadius:4, fontWeight:700, letterSpacing:"0.04em" }}>AI</span>}
          </button>
        ))}
      </div>

      {view==="courses" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {courses.map(c => (
            <Card key={c.code}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
                  background:c.color+"18", border:`1px solid ${c.color}30`,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <BookOpen size={17} color={c.color}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13.5, color:T.ink, marginBottom:2 }}>{c.name}</div>
                  <div style={{ fontSize:11, color:T.mist, fontFamily:FONT_MONO }}>{c.code} · {c.prof}</div>
                </div>
                <span style={{ fontFamily:FONT_MONO, fontWeight:800, fontSize:17, color:c.color, flexShrink:0 }}>{c.grade}</span>
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, color:T.mist }}>Course progress</span>
                  <span style={{ fontSize:11, fontFamily:FONT_MONO, fontWeight:600, color:T.ink }}>{c.progress}%</span>
                </div>
                <div style={{ height:4, borderRadius:2, background:T.line }}>
                  <div style={{ width:`${c.progress}%`, height:"100%", borderRadius:2, background:c.color }}/>
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <Pill text={`${c.recordings} recordings`} color={T.azure} bg={T.azurePale}/>
                <Pill text={`${c.assignments} due`}
                  color={c.assignments>2?T.amber:T.sage}
                  bg={c.assignments>2?T.amberPale:T.sagePale}/>
              </div>
            </Card>
          ))}
        </div>
      )}

      {view==="assignments" && (
        <Card>
          {assignments.map((a, i) => (
            <div key={a.title} style={{ display:"flex", alignItems:"center", gap:14,
              padding:"13px 0", borderBottom:i<assignments.length-1?`1px solid ${T.line}`:"none" }}>
              <div style={{ width:3, height:40, borderRadius:2, flexShrink:0,
                background:a.priority==="high"?T.amber:a.priority==="medium"?T.azure:T.haze }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13, color:T.ink, marginBottom:2 }}>{a.title}</div>
                <div style={{ fontSize:11, color:T.mist, fontFamily:FONT_MONO }}>{a.course} · Due: {a.due}</div>
              </div>
              <StatusBadge status={a.status}/>
            </div>
          ))}
        </Card>
      )}

      {view==="recordings" && (
        <Card>
          <div style={{ fontWeight:700, fontSize:14, color:T.ink, marginBottom:14 }}>Recent Lecture Recordings</div>
          {recordings.map((r, i) => (
            <div key={r.title} style={{ display:"flex", alignItems:"center", gap:14,
              padding:"13px 0", borderBottom:i<recordings.length-1?`1px solid ${T.line}`:"none" }}>
              <div style={{ width:42, height:42, borderRadius:10, background:T.azurePale,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Play size={16} color={T.azure} fill={T.azure}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13, color:T.ink, marginBottom:2 }}>{r.title}</div>
                <div style={{ fontSize:11, color:T.mist, fontFamily:FONT_MONO }}>{r.course} · {r.date}</div>
              </div>
              <div style={{ textAlign:"right" as const }}>
                <div style={{ fontSize:12, fontFamily:FONT_MONO, fontWeight:600, color:T.mist, marginBottom:3 }}>
                  <Clock size={10} style={{ display:"inline", marginRight:4, verticalAlign:"middle" }}/>{r.duration}
                </div>
                <button style={{ fontSize:11, color:T.azure, fontWeight:600, border:"none",
                  background:"none", cursor:"pointer", fontFamily:FONT_BODY, display:"flex",
                  alignItems:"center", gap:3 }}>
                  Watch <ArrowRight size={10}/>
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {view==="help" && (
        <div>
          <Card style={{ marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <Sparkles size={15} color={T.azure}/>
              <span style={{ fontWeight:700, fontSize:14, color:T.ink }}>AI Assignment Help</span>
              <AIBadge/>
            </div>
            <p style={{ fontSize:12.5, color:T.mist, marginBottom:16, lineHeight:1.6 }}>
              Ask anything about your coursework. UniGuide AI uses your course context to give personalized, grounded responses.
            </p>
            <div style={{ display:"flex", gap:8 }}>
              <input value={ask} onChange={e=>setAsk(e.target.value)}
                placeholder="e.g. How should I structure my capstone conclusion section?"
                style={{ flex:1, padding:"11px 13px", borderRadius:8, border:`1px solid ${T.line}`,
                  fontSize:13, outline:"none", background:"white", fontFamily:FONT_BODY }}
                onKeyDown={e=>e.key==="Enter"&&handleAsk()}/>
              <button onClick={handleAsk} disabled={asking||!ask.trim()}
                style={{ padding:"11px 18px", borderRadius:8, background:T.azure, color:"white",
                  fontWeight:700, fontSize:13, border:"none", cursor:"pointer", fontFamily:FONT_BODY,
                  opacity:!ask.trim()?0.5:1, display:"flex", alignItems:"center", gap:6 }}>
                {asking ? <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)",
                  borderTopColor:"white", borderRadius:"50%", animation:"spin 0.7s linear infinite",
                  display:"inline-block" }}/> : <Send size={13}/>}
              </button>
            </div>
            {answer && (
              <div style={{ marginTop:14, padding:"13px 15px", borderRadius:10,
                background:T.azurePale, border:`1px solid #BFDBFE`, fontSize:13,
                color:T.ink, lineHeight:1.7 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                  <Brain size={13} color={T.azure}/>
                  <span style={{ fontWeight:700, color:T.azure, fontSize:12 }}>UniGuide AI</span>
                </div>
                {answer}
              </div>
            )}
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {["Explain this concept","Help me outline this essay","Check my reasoning"].map(q => (
              <button key={q} onClick={()=>setAsk(q)}
                style={{ padding:"11px 13px", borderRadius:9, border:`1px solid ${T.line}`,
                  background:"white", fontSize:12, fontWeight:600, color:T.ink,
                  cursor:"pointer", textAlign:"left" as const, fontFamily:FONT_BODY,
                  display:"flex", alignItems:"center", gap:7 }}>
                <HelpCircle size={12} color={T.azure}/>{q}
              </button>
            ))}
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}

// ─── CAREER ────────────────────────────────────────────────────────────────────
function Career({ jobs }: { jobs:PortalData["jobs"] }) {
  return (
    <div style={{ padding:"28px 30px", overflowY:"auto", height:"100%", boxSizing:"border-box" as const, fontFamily:FONT_BODY }}>
      <SectionHeader title="Career Match" sub="On-campus opportunities ranked by AI compatibility — updated weekly"/>

      <div style={{ display:"grid", gap:14 }}>
        {jobs.map(j => (
          <Card key={j.title} style={{ padding:"20px 22px" }}>
            <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
              <div style={{ width:50, height:50, borderRadius:12, background:matchBg(j.match),
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Briefcase size={22} color={matchColor(j.match)}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:15, color:T.ink, marginBottom:3 }}>{j.title}</div>
                    <div style={{ fontSize:12, color:T.mist, fontFamily:FONT_MONO }}>{j.dept} · {j.type} · {j.pay} · {j.hours}</div>
                  </div>
                  <div style={{ textAlign:"right" as const, flexShrink:0, marginLeft:20 }}>
                    <div style={{ fontFamily:FONT_MONO, fontSize:26, fontWeight:900, color:matchColor(j.match), lineHeight:1 }}>{j.match}%</div>
                    <div style={{ fontSize:10, color:T.mist }}>AI Match</div>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <MatchBar score={j.match}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:T.mist, textTransform:"uppercase",
                      letterSpacing:"0.06em", marginBottom:6 }}>Why You Qualify</div>
                    {j.why.map(w => (
                      <div key={w} style={{ display:"flex", gap:7, marginBottom:4 }}>
                        <Check size={12} color={T.sage} strokeWidth={2.5} style={{ flexShrink:0, marginTop:2 }}/>
                        <span style={{ fontSize:12, color:T.ink }}>{w}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:T.mist, textTransform:"uppercase",
                      letterSpacing:"0.06em", marginBottom:6 }}>Skills Required</div>
                    <div style={{ display:"flex", flexWrap:"wrap" as const }}>
                      {j.skills.map(s=><Pill key={s} text={s}/>)}
                    </div>
                  </div>
                </div>
                <button style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px",
                  borderRadius:8, background:T.azure, color:"white", fontWeight:700,
                  fontSize:12, border:"none", cursor:"pointer", fontFamily:FONT_BODY }}>
                  Apply via MyUNT <ArrowRight size={13}/>
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
function Scholarships({ scholarships }: { scholarships:PortalData["scholarships"] }) {
  return (
    <div style={{ padding:"28px 30px", overflowY:"auto", height:"100%", boxSizing:"border-box" as const, fontFamily:FONT_BODY }}>
      <SectionHeader title="Scholarships" sub="Opportunities matched to your program, GPA, and enrollment status"/>

      <div style={{ display:"grid", gap:12 }}>
        {scholarships.map(s => (
          <Card key={s.name}
            style={{ borderLeft:`3px solid ${s.eligible?T.sage:T.lineDark}`, paddingLeft:20 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontWeight:800, fontSize:14.5, color:T.ink }}>{s.name}</span>
                  {s.eligible && <Pill text="Eligible" color={T.sage} bg={T.sagePale}/>}
                </div>
                <div style={{ fontSize:12, color:T.mist, marginBottom:10, lineHeight:1.6 }}>{s.req}</div>
                <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <Clock size={11} color={T.amber}/>
                    <span style={{ fontSize:11, color:T.amber, fontWeight:600 }}>Deadline: {s.deadline}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:11, color:T.mist }}>AI Match:</span>
                    <span style={{ fontFamily:FONT_MONO, fontWeight:700, fontSize:12, color:matchColor(s.match) }}>{s.match}%</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign:"right" as const, flexShrink:0 }}>
                <div style={{ fontFamily:FONT_MONO, fontSize:22, fontWeight:900, color:T.sage, marginBottom:8 }}>{s.amount}</div>
                {s.eligible && (
                  <button style={{ padding:"8px 16px", borderRadius:8, background:T.sage, color:"white",
                    fontWeight:700, fontSize:12, border:"none", cursor:"pointer", fontFamily:FONT_BODY,
                    display:"inline-flex", alignItems:"center", gap:6 }}>
                    Apply <ArrowRight size={12}/>
                  </button>
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
function Appointments({ user, assignments, scholarships, insights }: { user:PortalUser; assignments:PortalData["assignments"]; scholarships:PortalData["scholarships"]; insights:PortalData["insights"] }) {
  const slots = [
    {date:"Tue, Apr 29",time:"10:00 AM",available:true},
    {date:"Tue, Apr 29",time:"2:30 PM",available:true},
    {date:"Wed, Apr 30",time:"11:00 AM",available:false},
    {date:"Thu, May 1",time:"9:00 AM",available:true},
    {date:"Thu, May 1",time:"3:00 PM",available:true},
    {date:"Fri, May 2",time:"1:00 PM",available:true},
  ];
  const [booked, setBooked] = useState<typeof slots[0]|null>(null);

  const briefing = [
    { icon:<BarChart3 size={14}/>, text:`Your AI advisory score is ${user.matchScore}% — ${insights.topPercentLabel}` },
    { icon:<Briefcase size={14}/>, text:`${Math.min(3, scholarships.length)} funding and guidance matches are ready to discuss` },
    { icon:<Award size={14}/>, text:`${scholarships.filter(s=>s.eligible).length} scholarship matches are currently marked eligible` },
    { icon:<BookOpen size={14}/>, text:`${assignments.filter(a=>a.priority==="high").length} high-priority academic tasks are active` },
  ];

  return (
    <div style={{ padding:"28px 30px", overflowY:"auto", height:"100%", boxSizing:"border-box" as const, fontFamily:FONT_BODY }}>
      <SectionHeader title="Appointments" sub="Book advising sessions with your assigned advisor"/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:20 }}>
            <Avatar name={user.advisor} size={50} bg={T.azure}/>
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:T.ink }}>{user.advisor}</div>
              <div style={{ fontSize:12, color:T.mist }}>Academic Advisor · Dept. of Information Science</div>
              <div style={{ fontSize:12, color:T.azure, marginTop:3, display:"flex", alignItems:"center", gap:5 }}>
                <Mail size={11}/>{user.advisorEmail}
              </div>
            </div>
          </div>

          <div style={{ fontWeight:700, fontSize:10, color:T.ink, marginBottom:12,
            textTransform:"uppercase", letterSpacing:"0.05em" }}>
            Available Time Slots
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {slots.map((s, i) => (
              <button key={i} disabled={!s.available} onClick={()=>setBooked(s)}
                style={{ padding:"10px 12px", borderRadius:9, textAlign:"left" as const,
                  cursor:s.available?"pointer":"default",
                  border:`1.5px solid ${!s.available?T.line:booked===s?T.azure:T.line}`,
                  background:!s.available?T.paper:booked===s?T.azurePale:"white",
                  opacity:s.available?1:0.4, transition:"all 0.18s" }}>
                <div style={{ fontSize:11, fontWeight:700, color:booked===s?T.azure:T.ink }}>{s.date}</div>
                <div style={{ fontSize:12, color:T.mist, fontFamily:FONT_MONO }}>{s.time}</div>
              </button>
            ))}
          </div>

          {booked && (
            <div style={{ marginTop:14, padding:"12px 14px", borderRadius:9,
              background:T.sagePale, border:`1px solid ${T.sage}44` }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontWeight:700, fontSize:13, color:T.sage, marginBottom:3 }}>
                <CheckCircle2 size={14}/> Appointment Booked
              </div>
              <div style={{ fontSize:12, color:T.ink }}>{booked.date} at {booked.time} with {user.advisor}</div>
            </div>
          )}
        </Card>

        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
            <Brain size={14} color={T.azure}/>
            <span style={{ fontWeight:700, fontSize:14, color:T.ink }}>Session Briefing</span>
            <AIBadge/>
          </div>
          <p style={{ fontSize:12.5, color:T.mist, marginBottom:16, lineHeight:1.6 }}>
            UniGuide AI has prepared a summary for your advisor based on your current profile and academic standing.
          </p>
          {briefing.map(({ icon, text }) => (
            <div key={text} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:`1px solid ${T.line}` }}>
              <span style={{ color:T.azure, flexShrink:0, marginTop:1 }}>{icon}</span>
              <span style={{ fontSize:13, color:T.ink, lineHeight:1.5 }}>{text}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function Profile({ user }: { user:PortalUser }) {
  const [notifs, setNotifs] = useState({ scholarships:true, appointments:true, jobs:true, weekly:true });
  const statsData = [
    { label:"GPA", val:user.gpa, color:T.sage },
    { label:"Sem", val:`#${user.semester}`, color:T.azure },
    { label:"Credits", val:user.credits, color:"#7C3AED" },
    { label:"AI Score", val:`${user.matchScore}%`, color:T.gold },
  ];

  return (
    <div style={{ padding:"28px 30px", overflowY:"auto", height:"100%", boxSizing:"border-box" as const, fontFamily:FONT_BODY }}>
      <SectionHeader title="My Profile"/>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16 }}>
        {/* Left card */}
        <Card style={{ textAlign:"center" as const, padding:"28px 20px" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
            <Avatar name={user.name} size={80} bg={T.azure}/>
          </div>
          <div style={{ fontWeight:800, fontSize:17, color:T.ink, marginBottom:3 }}>{user.name}</div>
          <div style={{ fontSize:12, color:T.mist, marginBottom:3 }}>{user.email}</div>
          <div style={{ fontSize:11, color:T.azure, fontFamily:FONT_MONO, marginBottom:18 }}>EUID: {user.euid}</div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
            {statsData.map(({ label, val, color }) => (
              <div key={label} style={{ background:T.paper, borderRadius:9, padding:"10px 8px",
                border:`1px solid ${T.line}` }}>
                <div style={{ fontFamily:FONT_MONO, fontWeight:700, fontSize:18, color }}>{val}</div>
                <div style={{ fontSize:9, color:T.mist, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom:6 }}>
            <div style={{ fontSize:10, fontWeight:700, color:T.mist, textTransform:"uppercase",
              letterSpacing:"0.06em", marginBottom:8 }}>Scholarships</div>
            <div style={{ display:"flex", flexWrap:"wrap" as const, justifyContent:"center", gap:4 }}>
              {(user.scholarships||[]).map(s => <Pill key={s} text={s}/>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:T.mist, textTransform:"uppercase",
              letterSpacing:"0.06em", margin:"10px 0 8px" }}>Interests</div>
            <div style={{ display:"flex", flexWrap:"wrap" as const, justifyContent:"center", gap:4 }}>
              {(user.interests||[]).map(s => <Pill key={s} text={s} color={T.azure} bg={T.azurePale}/>)}
            </div>
          </div>
        </Card>

        {/* Right */}
        <div>
          <Card style={{ marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
              <Shield size={14} color={T.azure}/>
              <span style={{ fontWeight:700, fontSize:14, color:T.ink }}>Academic Information</span>
            </div>
            {[
              ["Student Level", user.level],
              ["Program", user.program],
              ["Student Status", user.status],
              ["Nationality", user.nationality],
              ["Academic Advisor", user.advisor],
              ["Advisor Email", user.advisorEmail],
            ].map(([k, v]) => (
              <div key={k} style={{ display:"flex", padding:"10px 0", borderBottom:`1px solid ${T.line}` }}>
                <span style={{ width:150, fontSize:12, fontWeight:600, color:T.mist, flexShrink:0 }}>{k}</span>
                <span style={{ fontSize:13, color:T.ink, fontFamily:k==="Advisor Email"||k==="Student Level"?FONT_MONO:FONT_BODY }}>{v}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
              <Bell size={14} color={T.azure}/>
              <span style={{ fontWeight:700, fontSize:14, color:T.ink }}>Notification Preferences</span>
            </div>
            {([
              ["Scholarship deadlines",      "scholarships"  ],
              ["Appointment reminders",      "appointments"  ],
              ["New job matches",            "jobs"          ],
              ["Weekly AI advisory updates", "weekly"        ],
            ] as [string, keyof typeof notifs][]).map(([label, key]) => (
              <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 0", borderBottom:`1px solid ${T.line}` }}>
                <span style={{ fontSize:13, color:T.ink }}>{label}</span>
                <div onClick={()=>setNotifs(n=>({...n,[key]:!n[key]}))}
                  style={{ width:36, height:20, borderRadius:10, flexShrink:0, cursor:"pointer",
                    background:notifs[key]?T.azure:T.haze, position:"relative",
                    transition:"background 0.2s" }}>
                  <div style={{ position:"absolute", top:3,
                    left:notifs[key]?undefined:3, right:notifs[key]?3:undefined,
                    width:14, height:14, borderRadius:"50%", background:"white",
                    transition:"left 0.2s, right 0.2s" }}/>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── PERSONALIZE JOBS ────────────────────────────────────────────────────────
function personalizeJobs(jobs: PortalData["jobs"], user: PortalUser): PortalData["jobs"] {
  return jobs.map(job => ({
    ...job,
    why: job.why.map(bullet => {
      let b = bullet;
      b = b.replace("Data Science program", `${user.program} program`);
      b = b.replace("a 12-credit schedule", `a ${user.credits}-credit schedule`);
      b = b.replace(/Semester 3\b/, `Semester ${user.semester}`);
      b = b.replace("Your GPA clears", `Your GPA of ${user.gpa} clears`);
      if (user.status === "International") {
        b = b.replace(
          "Domestic status simplifies employment paperwork.",
          "International students qualify for this role under F-1 work authorization guidelines."
        );
      }
      return b;
    }),
  }));
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
function MainApp({ portal, tab, setTab }: { portal:PortalData; tab:string; setTab:(t:string)=>void }) {
  const user = portal.user;
  const jobs = personalizeJobs(portal.jobs, user);
  const content: Record<string, JSX.Element> = {
    dashboard:    <Dashboard user={user} setTab={setTab} jobs={jobs} assignments={portal.assignments} insights={portal.insights}/>,
    advisor:      <ActionCenter user={user} insights={portal.insights} assignments={portal.assignments} scholarships={portal.scholarships}/>,
    academics:    <Academics user={user} courses={portal.courses} assignments={portal.assignments} recordings={portal.recordings}/>,
    career:       <Career jobs={jobs}/>,
    scholarships: <Scholarships scholarships={portal.scholarships}/>,
    appointments: <Appointments user={user} assignments={portal.assignments} scholarships={portal.scholarships} insights={portal.insights}/>,
    profile:      <Profile user={user}/>,
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden",
      fontFamily:FONT_BODY, background:T.paper }}>
      <Sidebar tab={tab} setTab={setTab} user={user}/>
      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {content[tab] || <Dashboard user={user} setTab={setTab} jobs={portal.jobs} assignments={portal.assignments} insights={portal.insights}/>}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<"login"|"onboard"|"app">("login");
  const [tab, setTab] = useState("dashboard");
  const [identifier, setIdentifier] = useState("demo@unt.edu");
  const [portal, setPortal] = useState<PortalData>(DEFAULT_PORTAL);
  const [loading, setLoading] = useState(false);
  const [_demoMode, setDemoMode] = useState(false);

  // Tries the live API; falls back to DEFAULT_PORTAL so the app always works.
  const fetchPortal = async (nextIdentifier: string, overrides?: Record<string, any>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: nextIdentifier, overrides }),
        signal: AbortSignal.timeout(4000),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const payload = await response.json();
      setPortal(payload.portal || DEFAULT_PORTAL);
      setDemoMode(false);
    } catch {
      // API not running — use built-in demo data, no blocking error
      setPortal(DEFAULT_PORTAL);
      if (overrides) {
        setPortal(prev => ({
          ...prev,
          user: { ...prev.user, ...overrides },
          insights: {
            ...prev.insights,
            signals: [
              {
                factor: `Age (${overrides.age ?? prev.user.age})`,
                signal: "Strong" as const,
                positive: true,
                text: `Students aged ${overrides.age ?? prev.user.age} are actively recruited for on-campus research and technical roles.`,
              },
              {
                factor: `${overrides.program ?? prev.user.program} Program`,
                signal: "Strong" as const,
                positive: true,
                text: `Your ${overrides.program ?? prev.user.program} program is one of the strongest signals for technical campus role eligibility.`,
              },
              {
                factor: `Semester ${overrides.semester ?? prev.user.semester}`,
                signal: "Good" as const,
                positive: true,
                text: `Semester ${overrides.semester ?? prev.user.semester} students have enough campus familiarity for most on-campus hiring windows.`,
              },
              {
                factor: `${overrides.credits ?? prev.user.credits}-Credit Load`,
                signal: ((overrides.credits ?? prev.user.credits) >= 12 ? "Good" : "Weak") as "Good" | "Weak",
                positive: (overrides.credits ?? prev.user.credits) >= 12,
                text: `A ${overrides.credits ?? prev.user.credits}-credit semester indicates ${(overrides.credits ?? prev.user.credits) >= 12 ? "full-time enrollment, which is preferred by most campus employers." : "part-time status, which may limit eligible roles."}`,
              },
              {
                factor: `${overrides.status ?? prev.user.status} Status`,
                signal: "Good" as const,
                positive: true,
                text: (overrides.status ?? prev.user.status) === "International"
                  ? "International students on F-1 visas may qualify for on-campus work authorization under standard eligibility rules."
                  : "Domestic enrollment status simplifies on-campus employment paperwork and authorization.",
              },
            ],
          },
        }));
      }
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  if (screen==="login")
    return <LoginScreen loading={loading} onLogin={async (id)=>{
      const resolved = id || "demo@unt.edu";
      setIdentifier(resolved);
      await fetchPortal(resolved);
      setScreen("onboard");
    }}/>;
  if (screen==="onboard")
    return <OnboardingFlow user={portal.user} onComplete={async (d)=>{
      await fetchPortal(identifier, d);
      setScreen("app");
    }}/>;
  return (
    <>
      {/* demoMode banner hidden — app runs silently on built-in data when API is offline
      {demoMode && (
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:9999,
          background:"#1D4ED8", color:"white", fontSize:11, fontWeight:600,
          textAlign:"center", padding:"5px 0", letterSpacing:"0.04em", fontFamily:FONT_BODY }}>
          DEMO MODE — built-in data · start <code style={{ fontFamily:"monospace", opacity:0.85 }}>
            .venv/bin/python src/portal_api.py</code> for live personalization
        </div>
      )} */}
      <MainApp portal={portal} tab={tab} setTab={setTab}/>
    </>
  );
}
