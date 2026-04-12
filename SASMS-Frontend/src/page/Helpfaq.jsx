import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronDown, Search, X,
  HelpCircle, MessageCircle, Phone, Mail,
  BookOpen, Settings, CreditCard, Shield,
  Wrench, Users, Package,
} from "lucide-react";
import useDarkMode from "../utils/useDarkMode";

const FAQ_DATA = [
  {
    category: "Getting Started",
    icon: BookOpen,
    color: { bg: "bg-blue-50", text: "text-blue-600" },
    items: [
      {
        q: "How do I create an account?",
        a: "Download the app or visit our website, tap on 'Register', Select role, enter your name, email, password, and basic details to register yourself. You're ready to go in under a minute.",
      },
      {
        q: "What roles are available on the platform?",
        a: "We have three roles — User (book services), Provider (deliver services), and Admin (manage the platform). Each role has its own dashboard and features.",
      },
      {
        q: "How do I update my profile information?",
        a: "Go to your profile page from the bottom navigation, tap 'Edit', update your details, and tap 'Save'. Changes reflect immediately.",
      },
      {
        q: "Can I change my email address?",
        a: "Email addresses are locked after registration for security reasons. If you need to change it, please contact support and we'll assist you.",
      },
    ],
  },
  {
    category: "Bookings & Services",
    icon: Package,
    color: { bg: "bg-emerald-50", text: "text-emerald-600" },
    items: [
      {
        q: "How do I book a service?",
        a: "Browse services from the home screen or All Services page, select the one you need, choose your address, and confirm the booking. You'll receive a confirmation instantly.",
      },
      {
        q: "Can I cancel a booking?",
        a: "Yes, you can cancel a booking as long as it hasn't been marked as In Progress by the provider. Go to My Bookings, tap the booking, and select Cancel.",
      },
      {
        q: "How do I track my booking status?",
        a: "Open 'My Bookings' from the bottom navigation. Each booking shows a live status — Pending, Assigned, In Progress, or Completed.",
      },
      {
        q: "What happens after I book a service?",
        a: "An admin reviews your booking and assigns a suitable provider. The provider then accepts the task, picks up any required assets, and carries out the service.",
      },
      {
        q: "Can I book a service for a different address?",
        a: "Yes. During booking you can select any saved address or add a new one on the spot. You can manage saved addresses in your Profile.",
      },
    ],
  },
  {
    category: "Payments & Pricing",
    icon: CreditCard,
    color: { bg: "bg-amber-50", text: "text-amber-600" },
    items: [
      {
        q: "How is the service price calculated?",
        a: "The total includes the service charge, cost of any assets used, and a fixed provider working charge. A full cost breakdown is shown on every booking detail page.",
      },
      {
        q: "When do I pay for a service?",
        a: "Payment details and timing depend on the payment method configured by the store. Please check the booking confirmation for payment instructions.",
      },
      {
        q: "Are there any hidden charges?",
        a: "No. The cost breakdown shown before confirmation is the final amount. Service charge, assets cost, and provider charge are all listed transparently.",
      },
    ],
  },
  {
    category: "For Providers",
    icon: Wrench,
    color: { bg: "bg-purple-50", text: "text-purple-600" },
    items: [
      {
        q: "How do I receive task assignments?",
        a: "When an admin assigns a task to you, it appears in your Tasks list. You'll see all task details including the customer address, service info, and any assets to collect.",
      },
      {
        q: "What is the workflow for completing a task?",
        a: "Accept the task → Confirm assets picked up → Mark In Progress → Mark Completed. Each step updates the customer in real time.",
      },
      {
        q: "Can I reject a task?",
        a: "Yes. On the task detail page, tap 'Reject' before accepting. The admin will be notified and the task will be reassigned.",
      },
      {
        q: "How do I update my service types and experience?",
        a: "Go to your Profile page, tap 'Edit', and update the Service Type and Experience fields under the Professional section.",
      },
    ],
  },
  {
    category: "Account & Security",
    icon: Shield,
    color: { bg: "bg-red-50", text: "text-red-500" },
    items: [
      {
        q: "How do I change my password?",
        a: "Go to Settings → Change Password. Enter your current password, then your new password twice to confirm. Passwords must be at least 6 characters.",
      },
      {
        q: "What should I do if I forget my password?",
        a: "On the login screen, tap 'Forgot Password' and enter your registered Phone number if it is registered. then input the new password twice to update.",
      },
      {
        q: "How is my data protected?",
        a: "All data is transmitted over HTTPS. Passwords are hashed and never stored in plain text. We do not sell or share your personal data with third parties.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact our support team via email or phone. Account deletion requests are processed within 7 business days.",
      },
    ],
  },
];

const CONTACT_OPTIONS = [
  {
    icon: Mail,
    label: "Email Support",
    value: "rakeshsatna13@gmail.com",
    desc: "Response within 24 hours",
    color: { bg: "bg-blue-50", text: "text-blue-600" },
    action: "mailto:rakeshsatna13@gmail.com",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 7879245448",
    desc: "Mon–Sat, 9 AM – 6 PM",
    color: { bg: "bg-emerald-50", text: "text-emerald-600" },
    action: "tel:+917879245448",
  },
  {
    icon: MessageCircle,
    label: "Live Chat",
    value: "Start a conversation",
    desc: "Typically replies in minutes",
    color: { bg: "bg-purple-50", text: "text-purple-600" },
    action: "wa.me/7879245448",
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
    const darkMode = useDarkMode().darkMode;
  return (
    <div className="border-b border-slate-50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 py-3.5 text-left"
      >
        <span className={`text-sm font-semibold ${darkMode ? "text-slate-400" : "text-slate-700"} leading-snug flex-1`}>{item.q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-0.5"
        >
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} leading-relaxed pb-4`}>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpFAQ() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState(null);
  const [expandedCats, setExpandedCats] = useState({ 0: true });
  const darkMode = useDarkMode().darkMode;


  const toggleCat = (i) =>
    setExpandedCats(prev => ({ ...prev, [i]: !prev[i] }));

  const toggleItem = (key) =>
    setOpenItem(prev => (prev === key ? null : key));

  // Filter FAQs by search
  const filtered = FAQ_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-800" : "bg-white"}`}>

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 px-5 pt-8 pb-16 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-2 left-6 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/70 text-sm mb-5 relative"
        >
          <ChevronLeft size={18} /> Back
        </button>

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Help & FAQ</h1>
            <p className="text-white/50 text-xs mt-0.5">Find answers to common questions</p>
          </div>
        </div>
      </div>

      <div className="relative -mt-6 w-full px-4 pb-12 space-y-4">

        {/* Search */}
        <div className={`flex items-center gap-2 ${darkMode ? "bg-gray-300" : "bg-white"} rounded-2xl border border-gray-100 shadow-sm px-4 py-3`}>
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            placeholder="Search questions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setExpandedCats({}); }}
            className="flex-1 text-sm outline-none placeholder-gray-400 text-slate-700"
          />
          {search && (
            <button onClick={() => { setSearch(""); setExpandedCats({ 0: true }); }}>
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* FAQ sections */}
        {filtered.length === 0 ? (
          <div className={`${darkMode ? "bg-gray-700" : "bg-white"} rounded-3xl border border-gray-100 shadow-sm p-10 text-center`} >
            <HelpCircle size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400">No results found</p>
            <p className="text-xs text-gray-300 mt-1">Try a different search term</p>
          </div>
        ) : (
          filtered.map((cat, ci) => {
            const Icon = cat.icon;
            const isExpanded = search ? true : !!expandedCats[ci];
            return (
              <div key={cat.category} className={`${darkMode ? "bg-gray-700" : "bg-white"} rounded-3xl border border-gray-100 shadow-sm overflow-hidden`}>

                {/* Category header */}
                <button
                  onClick={() => !search && toggleCat(ci)}
                  className="w-full flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-50"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color.bg}`}>
                    <Icon size={15} className={cat.color.text} />
                  </div>
                  <p className={`flex-1 text-left text-sm font-bold ${darkMode ? "text-slate-400" : "text-slate-700"}`}>{cat.category}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.color.bg} ${cat.color.text}`}>
                    {cat.items.length}
                  </span>
                  {!search && (
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={15} className="text-gray-400" />
                    </motion.div>
                  )}
                </button>

                {/* Items */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5">
                        {cat.items.map((item, ii) => (
                          <AccordionItem
                            key={ii}
                            item={item}
                            isOpen={openItem === `${ci}-${ii}`}
                            onToggle={() => toggleItem(`${ci}-${ii}`)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}

        {/* Contact Support */}
        <div className={`rounded-3xl border border-gray-100 shadow-sm overflow-hidden ${darkMode ? "bg-gray-700" : "bg-white"}`}>
          <div className="px-5 pt-4 pb-3 border-b border-slate-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Still need help?</p>
            <p className={` ${darkMode ? "text-slate-400" : "text-slate-700" } text-sm font-bold  mt-0.5`}>Contact Support</p>
          </div>
          <div className="p-4 space-y-3">
            {CONTACT_OPTIONS.map(({ icon: Icon, label, value, desc, color, action }) => (
              <div
                key={label}
                onClick={() => action && (window.location.href = action)}
                className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 ${action ? "cursor-pointer active:opacity-80" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.bg}`}>
                  <Icon size={17} className={color.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <p className="text-xs font-semibold text-slate-600 text-right truncate max-w-[120px]">{value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}