import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Share2, ChevronRight } from "lucide-react";

const POSTS: Record<string, {
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorImg: string;
  img: string;
  content: string;
}> = {
  "philhealth-coverage-guide": {
    title: "Understanding Your PhilHealth Coverage in 2024",
    category: "PhilHealth",
    date: "January 15, 2024",
    readTime: "5 min read",
    author: "Melissa Aguilar",
    authorRole: "CEO, HanapCare",
    authorImg: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=80&q=80",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    content: `
PhilHealth — the Philippine Health Insurance Corporation — is your primary safety net for hospital and outpatient care. Yet most Filipinos only learn how it works when they are already sick and facing a bill. This guide gives you the information before you need it.

## What PhilHealth Covers

PhilHealth provides two major benefit categories:

**Inpatient Hospital Care (HB or Hospital Benefit)**
When you are admitted to a PhilHealth-accredited hospital, your benefit covers room and board (within the case rate), professional fees, drugs and medicines, laboratory tests, and use of operating or procedure rooms — all within the applicable case rate.

PhilHealth uses a **Case Rate System** for most diagnoses. This means a fixed amount is paid for each diagnosis regardless of actual days spent in the hospital. For example, a dengue case rate pays approximately ₱9,000 toward your total hospital bill. The hospital deducts this from your bill, and you pay the balance.

**Outpatient Benefit (OB)**
PhilHealth covers selected outpatient procedures and consultations at accredited primary care providers, including:
- Outpatient consultations under the Primary Care Benefit (PCB) program
- Selected day surgeries (e.g., cataract extraction, hernia repair)
- Hemodialysis sessions for chronic kidney disease patients
- Chemotherapy packages
- Radiotherapy packages

## Who is Eligible

All formally employed Filipinos are automatically PhilHealth members if their employer remits monthly contributions. Self-employed, freelance, and informal sector workers may enroll as **Individually Paying Members (IPM)** and pay ₱300 per month minimum.

**OFWs** may enroll as Sea-Based or Land-Based OFW members, often through their POEA or OWWA documentation.

**Senior Citizens** (60 years and older) receive PhilHealth coverage under the Social Pension Program at no cost to them.

## How to Maximize Your Coverage

1. **Know your case rate.** Before hospitalization for a scheduled procedure, look up the PhilHealth case rate for your diagnosis on the PhilHealth website or ask your hospital's billing department.

2. **Use PhilHealth-accredited facilities.** Only accredited hospitals, clinics, and laboratories can file PhilHealth claims on your behalf. HanapCare partner facilities are all PhilHealth-accredited.

3. **Keep your contributions updated.** You must have at least **three months of contributions within the six months immediately before admission** to qualify for inpatient benefits. Check your contribution record on the PhilHealth member portal.

4. **Bring your PhilHealth ID or MDR.** Bring your PhilHealth ID card or a printout of your Member Data Record (MDR) to every hospital visit. HanapCare automatically verifies and applies your PhilHealth benefits at the time of service.

5. **Understand what is NOT covered.** PhilHealth does not cover cosmetic procedures, dental services (except oral and maxillofacial surgery), eyeglasses, hearing aids, or experimental treatments.

## Filing a Claim Through HanapCare

When you receive care at a HanapCare partner facility, our team handles the PhilHealth claim filing on your behalf. You simply sign a Claims Form 1 (CF1) upon admission, and the facility transmits the claim electronically.

You will receive a real-time breakdown of your PhilHealth deduction in your HanapCare patient portal before you settle your balance — no surprises.

## Contact PhilHealth Directly

For account inquiries: **1-800-10-PHILHEALTH (1-800-10-744-5432)**
For online verification: **www.philhealth.gov.ph**

---

*This article reflects PhilHealth policies as of January 2024. Benefit packages and case rates are subject to change by PhilHealth Corporation. Always verify current rates with your hospital or PhilHealth directly.*
    `,
  },
  "emergency-warning-signs": {
    title: "5 Signs You Should Visit the Emergency Room",
    category: "Emergency Care",
    date: "February 1, 2024",
    readTime: "4 min read",
    author: "Dr. Ricardo Santos",
    authorRole: "CMO, HanapCare",
    authorImg: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&q=80",
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80",
    content: `
One of the most common questions I receive from patients is: "Doc, when should I go straight to the ER?" The answer matters — going too early wastes resources, but going too late can be fatal. Here are the five situations that should send you directly to an emergency room, no questions asked.

## 1. Chest Pain or Pressure

Any chest pain that is new, severe, feels like squeezing or pressure, and radiates to the arm, jaw, or neck is a potential heart attack until proven otherwise. Do not drive yourself. Call for help, chew one 325mg aspirin if available and you are not allergic, and go directly to the ER.

**Do not wait to see if it goes away.** Every minute of delayed treatment in a heart attack destroys more heart muscle.

## 2. Sudden Weakness or Facial Drooping (Stroke Signs)

Use the FAST acronym:
- **F**ace drooping (is one side drooping when the person smiles?)
- **A**rm weakness (can they raise both arms? Does one drift down?)
- **S**peech difficulty (is speech slurred or strange?)
- **T**ime to call for emergency transport immediately

Stroke treatment is highly time-sensitive. In the Philippines, the effective window for clot-busting medication (thrombolysis) is typically 3–4.5 hours from symptom onset. Every minute counts.

## 3. Difficulty Breathing

Any significant difficulty breathing — particularly if sudden, severe, or accompanied by blue lips or fingernails (cyanosis) — is an emergency. This includes:
- Severe asthma attack not responding to a reliever inhaler
- Suspected anaphylaxis (allergic reaction)
- Suspected drowning or choking

## 4. High Fever with Altered Consciousness or Bleeding Signs (Potential Dengue)

In the Philippines, dengue remains one of the leading causes of childhood death. Go to the ER — not a clinic — if a febrile patient has any of these warning signs:
- Severe abdominal pain or persistent vomiting
- Bleeding from gums, nose, or skin bruising without injury
- Feeling of extreme restlessness or sluggishness
- Rapid breathing

These are dengue warning signs indicating possible dengue hemorrhagic fever (DHF) requiring intravenous fluids and close monitoring.

## 5. Severe Head Injury, Bone Fractures, or Deep Wounds

Any head injury with loss of consciousness — even brief — warrants ER evaluation. Similarly, suspected fractures, deep lacerations that are actively bleeding, or wounds with exposed bone or tendon require emergency care and often surgery.

## What About Everything Else?

For non-life-threatening conditions — fever without warning signs, mild to moderate pain, minor wounds, colds, UTI — an urgent care clinic or outpatient consultation through your HanapCare portal is appropriate and will typically be faster and less expensive than an emergency room visit.

When in doubt, call us. Our HanapCare care coordinators are available 24/7 at **+63 (2) 8888-0000** to help you determine the right level of care.

---

*Dr. Ricardo Santos, MD is a board-certified internist and the Chief Medical Officer of HanapCare Technologies, Inc. He previously practiced at Philippine General Hospital for 18 years.*
    `,
  },
  "health-screening-importance": {
    title: "Why Regular Health Screening Saves Filipino Lives",
    category: "Preventive Care",
    date: "February 20, 2024",
    readTime: "6 min read",
    author: "Dr. Ricardo Santos",
    authorRole: "CMO, HanapCare",
    authorImg: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&q=80",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    content: `
The three leading causes of death in the Philippines are cardiovascular disease, cancer, and diabetes — and all three share a critical characteristic: they are far easier and cheaper to treat when caught early. Regular health screening is the single most effective preventive tool available to every Filipino, yet most of us only see a doctor when we are already sick.

## The Philippine Disease Burden

According to the Philippine Statistics Authority, cardiovascular diseases alone account for nearly 20% of all deaths in the country. Hypertension — the primary driver of heart attacks and strokes — is estimated to affect 28% of Filipino adults, but less than half know they have it because it causes no symptoms.

Type 2 diabetes affects approximately 7% of the adult population, and an estimated 50% of cases remain undiagnosed. By the time symptoms appear — frequent urination, blurred vision, numbness in the feet — end-organ damage has often already begun.

## Recommended Screening Schedule

**All Adults (Starting at Age 18)**
- Blood pressure measurement: annually, or every 6 months if family history of hypertension
- Fasting blood glucose: every 3 years starting at 35, or earlier with risk factors
- Lipid profile (cholesterol): every 5 years starting at 35
- Body Mass Index (BMI) and waist circumference: annually

**Women**
- Pap smear for cervical cancer: every 3 years from age 21, or every 5 years with co-testing (HPV + Pap) from age 30
- Clinical breast examination: annually from age 40, with mammogram every 1–2 years
- Bone density (DEXA) scan: at menopause, then every 2 years

**Men**
- Prostate-specific antigen (PSA) blood test: discuss with your doctor starting at age 50 (earlier with family history)

**Everyone Over 50**
- Fecal occult blood test (FOBT): annually for colorectal cancer screening
- Colonoscopy: every 10 years if FOBT is negative

## Screening at HanapCare

HanapCare offers a comprehensive annual health screening package for individuals and corporate groups. Your results are stored in your digital health record, compared to prior years' values, and reviewed by our in-house internist who will flag any abnormal trends.

Screening is available at our outpatient diagnostic centers in Makati, Cebu, and Davao. Packages start at ₱2,500 and include blood glucose, lipid panel, CBC, urinalysis, and blood pressure monitoring.

PhilHealth members can apply their outpatient benefit toward selected screening tests at our accredited facilities.

## The Bottom Line

The most powerful thing you can do for your health this year costs less than a restaurant dinner. Schedule your annual screening. Know your numbers. Give your doctor the information they need to catch problems before they become crises.

---

*Schedule your annual health screening through your HanapCare patient account — no referral needed.*
    `,
  },
};

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = POSTS[params.slug ?? ""];

  useEffect(() => {
    if (post) document.title = `${post.title} — HanapCare Blog`;
    else document.title = "Article Not Found — HanapCare";
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Article not found</h1>
        <p className="text-slate-500 mb-8">The article you're looking for doesn't exist or has been moved.</p>
        <Link href="/blog">
          <a className="inline-flex items-center gap-2 text-sky-600 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </a>
        </Link>
      </div>
    );
  }

  const formatContent = (content: string) => {
    return content
      .trim()
      .split("\n\n")
      .map((block, i) => {
        if (block.startsWith("## ")) {
          return <h2 key={i} className="text-2xl font-extrabold text-slate-900 mt-10 mb-4">{block.replace("## ", "")}</h2>;
        }
        if (block.startsWith("**") && block.endsWith("**")) {
          return <p key={i} className="font-bold text-slate-800 mt-4">{block.replace(/\*\*/g, "")}</p>;
        }
        if (block.startsWith("- ")) {
          const items = block.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={i} className="list-disc list-inside space-y-2 my-4 text-slate-600">
              {items.map((item, j) => <li key={j}>{item.replace("- ", "")}</li>)}
            </ul>
          );
        }
        if (block.startsWith("---")) {
          return <hr key={i} className="my-8 border-slate-200" />;
        }
        if (block.startsWith("*") && block.endsWith("*")) {
          return <p key={i} className="text-sm text-slate-400 italic">{block.replace(/\*/g, "")}</p>;
        }
        return <p key={i} className="text-slate-600 leading-relaxed">{block}</p>;
      });
  };

  return (
    <div className="overflow-x-hidden">
      <div className="bg-[#060D1F] pt-24 pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/blog">
              <a className="inline-flex items-center gap-2 text-sky-400 text-sm font-medium mb-8 hover:text-sky-300 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </a>
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-bold text-sky-400 bg-sky-500/20 border border-sky-500/30 px-3 py-1 rounded-full">{post.category}</span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5" /> {post.date}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5" /> {post.readTime}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">{post.title}</h1>

            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-3">
                <img src={post.authorImg} alt={post.author} className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/30" />
                <div>
                  <p className="text-white font-semibold text-sm">{post.author}</p>
                  <p className="text-slate-400 text-xs">{post.authorRole}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors text-sm">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <div className="relative -mt-8 rounded-3xl overflow-hidden shadow-2xl mb-12">
            <img src={post.img} alt={post.title} className="w-full h-72 sm:h-96 object-cover" />
          </div>

          <div className="prose max-w-none pb-16">
            <div className="space-y-4 text-base">
              {formatContent(post.content)}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-slate-50 py-12 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-slate-600 font-medium">Ready to take control of your health?</p>
            <div className="flex gap-3">
              <Link href="/signup">
                <a className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all text-sm">
                  Create Free Account <ChevronRight className="w-4 h-4" />
                </a>
              </Link>
              <Link href="/blog">
                <a className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm">
                  More Articles
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
