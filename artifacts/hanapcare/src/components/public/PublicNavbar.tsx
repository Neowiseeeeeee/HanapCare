import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { HanapCareLogoIcon } from "./HanapCareLogo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  const isTransparentPage = location === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isTransparentPage
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <HanapCareLogoIcon size={36} />
            <span
              className={`font-bold text-xl tracking-tight transition-colors ${
                scrolled || !isTransparentPage ? "text-slate-900" : "text-white"
              }`}
            >
              Hanap<span className="text-sky-400">Care</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  location === link.href
                    ? scrolled || !isTransparentPage
                      ? "bg-sky-50 text-sky-600"
                      : "bg-white/20 text-white"
                    : scrolled || !isTransparentPage
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium px-5 py-2 rounded-full border transition-all ${
                scrolled || !isTransparentPage
                  ? "border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-600"
                  : "border-white/40 text-white hover:border-white hover:bg-white/10"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-5 py-2 rounded-full bg-sky-500 text-white hover:bg-sky-400 transition-all shadow-md shadow-sky-500/25"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled || !isTransparentPage
                ? "text-slate-700 hover:bg-slate-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white border-t border-slate-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-sky-50 text-sky-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center px-4 py-3 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex w-full items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-sky-500 text-white hover:bg-sky-400 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
