import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Clock, ChevronRight, Search } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const POSTS = [
  {
    slug: "philhealth-coverage-guide",
    title: "Understanding Your PhilHealth Coverage in 2024",
    excerpt: "A practical guide to navigating PhilHealth benefits — what is covered, how to file claims, and how to maximize your health fund for your family. We break down the benefit packages for outpatient, inpatient, and emergency care.",
    category: "PhilHealth",
    date: "January 15, 2024",
    readTime: "5 min read",
    featured: true,
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    author: "Melissa Aguilar",
    authorRole: "CEO, HanapCare",
    authorImg: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=80&q=80",
  },
  {
    slug: "emergency-warning-signs",
    title: "5 Signs You Should Visit the Emergency Room",
    excerpt: "Knowing when to go to the ER versus an urgent care clinic can save your life. Here are the definitive red flags that every Filipino family should memorize — and never ignore.",
    category: "Emergency Care",
    date: "February 1, 2024",
    readTime: "4 min read",
    featured: false,
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80",
    author: "Dr. Ricardo Santos",
    authorRole: "CMO, HanapCare",
    authorImg: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&q=80",
  },
  {
    slug: "health-screening-importance",
    title: "Why Regular Health Screening Saves Filipino Lives",
    excerpt: "The Philippines faces rising rates of hypertension, diabetes, and cancer — all largely preventable with early detection. Here is what screenings to get, when, and why they matter.",
    category: "Preventive Care",
    date: "February 20, 2024",
    readTime: "6 min read",
    featured: false,
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
    author: "Dr. Ricardo Santos",
    authorRole: "CMO, HanapCare",
    authorImg: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&q=80",
  },
  {
    slug: "dengue-prevention-guide",
    title: "Dengue Prevention: A Complete Guide for Filipino Families",
    excerpt: "The Philippines reports over 200,000 dengue cases annually. This guide covers early warning signs, home management, and when to seek hospital care immediately.",
    category: "Infectious Disease",
    date: "March 5, 2024",
    readTime: "7 min read",
    featured: false,
    img: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=600&q=80",
    author: "Melissa Aguilar",
    authorRole: "CEO, HanapCare",
    authorImg: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=80&q=80",
  },
  {
    slug: "diabetes-management-philippines",
    title: "Managing Type 2 Diabetes in the Philippine Context",
    excerpt: "With an estimated 4 million Filipinos living with diabetes — and many more undiagnosed — understanding how to manage this condition is one of the most important health skills you can learn.",
    category: "Chronic Disease",
    date: "March 18, 2024",
    readTime: "8 min read",
    featured: false,
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80",
    author: "Dr. Ricardo Santos",
    authorRole: "CMO, HanapCare",
    authorImg: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&q=80",
  },
  {
    slug: "mental-health-awareness",
    title: "Breaking the Stigma: Mental Health in the Philippines",
    excerpt: "The Philippines passed the Mental Health Act in 2018 — but stigma still prevents millions from seeking help. Here is what mental health services are available and how to access them.",
    category: "Mental Health",
    date: "April 2, 2024",
    readTime: "6 min read",
    featured: false,
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    author: "Melissa Aguilar",
    authorRole: "CEO, HanapCare",
    authorImg: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=80&q=80",
  },
];

const CATEGORIES = ["All", "PhilHealth", "Emergency Care", "Preventive Care", "Infectious Disease", "Chronic Disease", "Mental Health"];

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    document.title = "Health Blog — HanapCare";
  }, []);

  const featured = POSTS[0];
  const filtered = POSTS.slice(1).filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 bg-[#060D1F] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-600/10 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-medium mb-6">
              Health Blog
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
              Knowledge is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
                Medicine
              </span>
            </h1>
            <p className="mt-5 text-slate-300 leading-relaxed max-w-xl mx-auto">
              Evidence-based health articles written by Filipino doctors and health advocates — for patients, families, and caregivers.
            </p>
            <div className="mt-8 max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ── FEATURED ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300"
          >
            <div className="h-64 lg:h-auto overflow-hidden">
              <img src={featured.img} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">{featured.category}</span>
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Featured</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight group-hover:text-sky-600 transition-colors mb-4">{featured.title}</h2>
              <p className="text-slate-500 leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={featured.authorImg} alt={featured.author} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{featured.author}</p>
                    <p className="text-xs text-slate-400">{featured.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sky-600 font-semibold text-sm">
                  <Clock className="w-3.5 h-3.5" /> {featured.readTime}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── CATEGORIES ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── GRID ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((post) => (
            <motion.article key={post.slug} variants={fadeUp} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-44 overflow-hidden">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">{post.category}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                </div>
                <h3 className="font-bold text-slate-900 leading-snug mb-2 group-hover:text-sky-600 transition-colors">{post.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src={post.authorImg} alt={post.author} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs text-slate-500">{post.date}</span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs text-sky-600 font-semibold hover:gap-2 transition-all"
                  >
                    Read <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium">No articles found</p>
            <p className="text-sm mt-1">Try a different search term or category</p>
          </div>
        )}
      </div>
    </div>
  );
}
