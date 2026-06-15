import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { HanapCareLogoIcon } from "./HanapCareLogo";

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Services", href: "/services" },
  { label: "Health Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

const accountLinks = [
  { label: "Create Account", href: "/signup" },
  { label: "Sign In", href: "/login" },
  { label: "Our Services", href: "/services" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function PublicFooter() {
  return (
    <footer className="bg-[#060D1F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="lg:col-span-1 space-y-5">
            <div className="flex items-center gap-2.5">
              <HanapCareLogoIcon size={36} />
              <span className="font-bold text-xl">
                Hanap<span className="text-sky-400">Care</span>
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              Connecting patients with quality hospital care. From booking to billing — all in one place.
            </p>

            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                <span>Metro Manila, Philippines</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>+63 (2) 8888-0000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>support@hanapcare.ph</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Mon–Fri 8AM–6PM · Sat 8AM–12PM</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-sky-500/20 hover:border-sky-500/50 transition-all"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Your Account</h4>
            <ul className="space-y-2.5">
              {accountLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-sky-400 font-semibold">HanapCare</span> — "Hanap" means "Find" in Filipino. Find better care.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} HanapCare Technologies, Inc. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Made for Filipino Healthcare — Mula sa Pilipino, Para sa Pilipino
          </p>
        </div>
      </div>
    </footer>
  );
}
