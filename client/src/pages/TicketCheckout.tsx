// TicketCheckout — Primary Ticket Purchase
// Design: Stark black-and-white WCAG AA compliant — high contrast, no decorative color
// Layout: Shopify-style 2-column (left: steps, right: sticky order summary)
// Steps: 1 → Ticket Selection  2 → Contact & Billing  3 → Payment
// Tiers: Most expensive first (Be a Chef $15k → Local $100)
// Inclusions: Always visible — no expand/collapse
// Toasts: (1) Mixed-tier seating notice when 2+ different tiers in cart
//         (2) 16+ ticket group-split notice when total qty exceeds 16

import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Check, Shield,
  CreditCard, Lock, Info, Plus, Minus, Users, Calendar,
  Award, AlertTriangle, SplitSquareVertical
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";

// ── Stripe setup (test publishable key — replace with real key in production) ──
const stripePromise = loadStripe("pk_test_51OqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

// ── Ticket Tier Data (ordered most expensive → least expensive) ────────────────
interface TicketTier {
  id: string;
  tier: "CONCIERGE" | "VVIP" | "VIP" | "GENERAL" | "LOCAL";
  name: string;
  price: number;
  experiences: string[];
  lotteryPriority: "S" | "A" | "B" | "C";
  guaranteedChoices: string;
  available: number | null;
  badge?: string;
}

const TICKET_TIERS: TicketTier[] = [
  {
    id: "be-a-chef",
    tier: "CONCIERGE",
    name: "Be a Chef",
    price: 15000,
    experiences: [
      "All 3 lunches (Fri, Sat, Sun Brunch)",
      "All 3 dinners (Thu, Fri, Sat)",
      "All 3 VIP after-hours events",
      "Exclusive hands-on chef experience",
      "Private kitchen access & masterclass",
      "Dedicated concierge throughout festival",
    ],
    lotteryPriority: "S",
    guaranteedChoices: "All 6 windows",
    available: null,
    badge: "CONCIERGE",
  },
  {
    id: "amex-centurion",
    tier: "VVIP",
    name: "AMEX Centurion",
    price: 7500,
    experiences: [
      "All 3 lunches (Fri, Sat, Sun Brunch)",
      "All 3 dinners (Thu, Fri, Sat)",
      "All 3 VIP after-hours events",
      "AMEX Centurion VIP Lounge access",
      "Exclusive chef experiences",
    ],
    lotteryPriority: "A",
    guaranteedChoices: "All 6 windows",
    available: 100,
    badge: "AMEX",
  },
  {
    id: "elite",
    tier: "VVIP",
    name: "Elite",
    price: 7500,
    experiences: [
      "All 3 lunches (Fri, Sat, Sun Brunch)",
      "All 3 dinners (Thu, Fri, Sat)",
      "All 3 VIP after-hours events",
    ],
    lotteryPriority: "A",
    guaranteedChoices: "All 6 windows",
    available: 100,
  },
  {
    id: "amex-platinum",
    tier: "VIP",
    name: "AMEX Platinum",
    price: 4000,
    experiences: [
      "2 lunches of your choice",
      "2 dinners of your choice",
      "2 VIP after-hours events",
      "AMEX Platinum VIP Lounge access",
    ],
    lotteryPriority: "B",
    guaranteedChoices: "Two",
    available: 200,
    badge: "AMEX",
  },
  {
    id: "premier",
    tier: "VIP",
    name: "Premier",
    price: 4000,
    experiences: [
      "2 lunches of your choice",
      "2 dinners of your choice",
      "2 VIP after-hours events",
    ],
    lotteryPriority: "B",
    guaranteedChoices: "One",
    available: 100,
  },
  {
    id: "signature",
    tier: "GENERAL",
    name: "Signature",
    price: 2000,
    experiences: [
      "1 lunch of your choice",
      "2 dinners of your choice",
      "2 after-hours events",
    ],
    lotteryPriority: "C",
    guaranteedChoices: "None",
    available: 600,
  },
  {
    id: "local",
    tier: "LOCAL",
    name: "Local",
    price: 100,
    experiences: [
      "1 lunch or dinner (lottery allocation)",
    ],
    lotteryPriority: "C",
    guaranteedChoices: "None",
    available: 150,
  },
];

const PRIORITY_LABEL: Record<string, string> = {
  S: "Concierge Priority",
  A: "Priority A — First Access",
  B: "Priority B — Early Access",
  C: "Standard Lottery",
};

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Tickets" },
  { id: 2, label: "Details" },
  { id: 3, label: "Payment" },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            step.id < current
              ? "bg-black text-white border-black"
              : step.id === current
              ? "bg-white text-black border-black"
              : "bg-transparent text-neutral-500 border-neutral-300"
          }`}>
            {step.id < current ? (
              <Check className="w-3 h-3" />
            ) : (
              <span>{step.id}</span>
            )}
            <span>{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-px mx-1 ${step.id < current ? "bg-black" : "bg-neutral-300"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Order Summary (sticky right column) ───────────────────────────────────────
interface CartItem {
  tierId: string;
  qty: number;
}

function OrderSummary({ cart, tiers }: { cart: CartItem[]; tiers: TicketTier[] }) {
  const items = cart.filter((c) => c.qty > 0).map((c) => {
    const tier = tiers.find((t) => t.id === c.tierId)!;
    return { tier, qty: c.qty, subtotal: tier.price * c.qty };
  });
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const processingFee = Math.round(subtotal * 0.029 + 0.30 * items.reduce((s, i) => s + i.qty, 0));
  const total = subtotal + processingFee;

  return (
    <div className="bg-white border border-black rounded-none overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-black bg-black text-white">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Chef's Table Festival</p>
            <p className="text-xs text-neutral-400">Park City, Utah · Aug 13–16, 2026</p>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="px-5 py-4 space-y-3 min-h-[120px]">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500 italic text-center py-4">No tickets selected yet.</p>
        ) : (
          items.map(({ tier, qty, subtotal }) => (
            <div key={tier.id} className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black leading-tight">{tier.name}</p>
                <p className="text-xs text-neutral-500">{tier.tier} · ×{qty}</p>
              </div>
              <p className="text-sm font-semibold text-black whitespace-nowrap">
                ${subtotal.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      {items.length > 0 && (
        <div className="px-5 pb-5 border-t border-black pt-4 space-y-2">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              Processing fee
              <Info className="w-3 h-3" />
            </span>
            <span>${processingFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-black">
            <span>Total due today</span>
            <span>${total.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
            Named attendee assignment available after purchase. All tickets are non-refundable per festival policy.
          </p>
        </div>
      )}

      {/* Trust badges */}
      <div className="px-5 pb-4 flex items-center gap-4 text-[10px] text-neutral-500 border-t border-neutral-200 pt-3">
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-black" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-black" />
          <span>Stripe Payments</span>
        </div>
        <div className="flex items-center gap-1">
          <CreditCard className="w-3 h-3 text-neutral-500" />
          <span>All major cards</span>
        </div>
      </div>
    </div>
  );
}

// ── Ticket Card (always-visible inclusions, B&W) ───────────────────────────────
function TicketCard({
  tier,
  qty,
  onInc,
  onDec,
}: {
  tier: TicketTier;
  qty: number;
  onInc: () => void;
  onDec: () => void;
}) {
  const selected = qty > 0;

  return (
    <div className={`border transition-all duration-150 ${
      selected ? "border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "border-neutral-300 bg-white hover:border-black"
    }`}>
      {/* Top bar: tier label + price */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${selected ? "border-black bg-black text-white" : "border-neutral-200 bg-neutral-50"}`}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${
            selected
              ? "border-white text-white"
              : "border-black text-black"
          }`}>
            {tier.tier}
          </span>
          {tier.badge && (
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${
              selected ? "border-neutral-400 text-neutral-300" : "border-neutral-400 text-neutral-600"
            }`}>
              {tier.badge}
            </span>
          )}
          {tier.available !== null && tier.available <= 100 && (
            <span className={`text-[10px] font-semibold ${selected ? "text-neutral-300" : "text-neutral-500"}`}>
              {tier.available} remaining
            </span>
          )}
        </div>
        <div className="text-right">
          <span className={`font-display text-xl font-black ${selected ? "text-white" : "text-black"}`}>
            ${tier.price.toLocaleString()}
          </span>
          <span className={`text-xs font-normal ml-1 ${selected ? "text-neutral-400" : "text-neutral-500"}`}>/ ticket</span>
        </div>
      </div>

      {/* Name + priority */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="font-display text-xl font-black text-black mb-1">{tier.name}</h3>
            <p className="text-xs font-semibold text-neutral-600 uppercase tracking-widest">{PRIORITY_LABEL[tier.lotteryPriority]}</p>
          </div>
          {tier.guaranteedChoices !== "None" && (
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-0.5">Guaranteed</p>
              <p className="text-sm font-black text-black">{tier.guaranteedChoices}</p>
            </div>
          )}
        </div>

        {/* Inclusions — always visible */}
        <div className="border-t border-neutral-200 pt-3 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">What's Included</p>
          <ul className="space-y-1.5">
            {tier.experiences.map((exp) => (
              <li key={exp} className="flex items-start gap-2 text-sm text-black">
                <Check className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                <span>{exp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Qty control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onDec}
              disabled={qty === 0}
              aria-label="Remove one ticket"
              className="w-9 h-9 border border-black flex items-center justify-center text-black hover:bg-black hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-display text-xl font-black w-6 text-center text-black" aria-live="polite">
              {qty}
            </span>
            <button
              onClick={onInc}
              aria-label="Add one ticket"
              className="w-9 h-9 border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {qty > 0 && (
            <motion.p
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-black text-black"
            >
              ${(tier.price * qty).toLocaleString()}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Ticket Selection ───────────────────────────────────────────────────
function Step1Tickets({
  cart,
  onUpdate,
  onNext,
}: {
  cart: CartItem[];
  onUpdate: (tierId: string, qty: number) => void;
  onNext: () => void;
}) {
  const totalTickets = cart.reduce((s, c) => s + c.qty, 0);
  const hasTickets = totalTickets > 0;

  // Track which toasts have been shown to avoid repeating
  const mixedTierShown = useRef(false);
  const groupSplitShown = useRef(false);

  // Derived state for toast triggers
  const tiersInCart = cart.filter((c) => c.qty > 0).map((c) => {
    const tier = TICKET_TIERS.find((t) => t.id === c.tierId)!;
    return tier.tier;
  });
  const uniqueTiers = new Set(tiersInCart);

  useEffect(() => {
    // Toast 1: Mixed-tier seating notice — fires once when 2+ different tier levels are in cart
    if (uniqueTiers.size >= 2 && !mixedTierShown.current) {
      mixedTierShown.current = true;
      toast.warning(
        "Mixed-tier seating notice",
        {
          description: "When purchasing tickets across multiple tiers, attendees may not be seated together. Seating is allocated by tier level to ensure a consistent experience for each group.",
          duration: 8000,
          icon: <AlertTriangle className="w-4 h-4" />,
        }
      );
    }
    // Reset if cart drops back to single tier
    if (uniqueTiers.size < 2) {
      mixedTierShown.current = false;
    }
  }, [uniqueTiers.size]);

  useEffect(() => {
    // Toast 2: Group-split notice — fires once when total qty exceeds 16
    if (totalTickets > 16 && !groupSplitShown.current) {
      groupSplitShown.current = true;
      toast.info(
        "Large group — dining group options available",
        {
          description: "Orders of more than 16 tickets can be divided into separate dining groups after purchase. This increases your group's odds of securing access to limited-capacity events. You'll be prompted to configure groups during attendee assignment.",
          duration: 10000,
          icon: <SplitSquareVertical className="w-4 h-4" />,
        }
      );
    }
    // Reset if qty drops back to ≤16
    if (totalTickets <= 16) {
      groupSplitShown.current = false;
    }
  }, [totalTickets]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-black text-black mb-2">Select Your Tickets</h2>
        <p className="text-sm text-neutral-600 leading-relaxed">
          Purchase tickets in bulk — you'll assign named attendees after checkout. Tickets are non-transferable and non-refundable. Most aspirational experiences are listed first.
        </p>
      </div>

      <div className="space-y-4">
        {TICKET_TIERS.map((t) => {
          const cartItem = cart.find((c) => c.tierId === t.id);
          const qty = cartItem?.qty ?? 0;
          return (
            <TicketCard
              key={t.id}
              tier={t}
              qty={qty}
              onInc={() => onUpdate(t.id, qty + 1)}
              onDec={() => onUpdate(t.id, Math.max(0, qty - 1))}
            />
          );
        })}
      </div>

      <div className="mt-8">
        <button
          onClick={onNext}
          disabled={!hasTickets}
          className={`w-full py-4 font-black text-base flex items-center justify-center gap-2 transition-all border-2 ${
            hasTickets
              ? "bg-black text-white border-black hover:bg-neutral-800"
              : "bg-white text-neutral-400 border-neutral-300 cursor-not-allowed"
          }`}
        >
          {hasTickets ? (
            <>
              Continue to Details
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            "Select at least one ticket to continue"
          )}
        </button>
        {hasTickets && (
          <p className="text-center text-xs text-neutral-500 mt-2">
            {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    </div>
  );
}

// ── Step 2: Contact & Billing ──────────────────────────────────────────────────
interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  emailConfirm: string;
  company: string;
  phone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
}

function Step2Details({
  info,
  onChange,
  onNext,
  onBack,
}: {
  info: ContactInfo;
  onChange: (field: keyof ContactInfo, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const valid =
    info.firstName.trim() &&
    info.lastName.trim() &&
    info.email.trim() &&
    info.email === info.emailConfirm &&
    info.billingAddress.trim() &&
    info.billingCity.trim() &&
    info.billingZip.trim();

  const inputClass =
    "w-full px-4 py-3 border border-neutral-300 bg-white text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition-all rounded-none";

  const labelClass = "block text-xs font-semibold text-black uppercase tracking-widest mb-1.5";

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-black text-black mb-2">Contact & Billing</h2>
        <p className="text-sm text-neutral-600">
          The primary ticket holder. You'll assign individual attendees to each ticket after purchase.
        </p>
      </div>

      <div className="space-y-6">
        {/* Contact */}
        <div>
          <p className="text-xs font-black text-black uppercase tracking-widest mb-4 pb-2 border-b border-black">Contact Information</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First name *</label>
              <input className={inputClass} placeholder="Sarah" value={info.firstName} onChange={(e) => onChange("firstName", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Last name *</label>
              <input className={inputClass} placeholder="Chen" value={info.lastName} onChange={(e) => onChange("lastName", e.target.value)} />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>Email address *</label>
            <input className={inputClass} type="email" placeholder="sarah@example.com" value={info.email} onChange={(e) => onChange("email", e.target.value)} />
          </div>
          <div className="mt-3">
            <label className={labelClass}>Confirm email *</label>
            <input
              className={`${inputClass} ${info.emailConfirm && info.email !== info.emailConfirm ? "border-red-600 focus:border-red-600" : ""}`}
              type="email"
              placeholder="Confirm email"
              value={info.emailConfirm}
              onChange={(e) => onChange("emailConfirm", e.target.value)}
            />
            {info.emailConfirm && info.email !== info.emailConfirm && (
              <p className="text-xs text-red-600 mt-1 font-semibold">Emails do not match.</p>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Company / Organization</label>
              <input className={inputClass} placeholder="Optional" value={info.company} onChange={(e) => onChange("company", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} placeholder="+1 (555) 000-0000" value={info.phone} onChange={(e) => onChange("phone", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Billing address */}
        <div>
          <p className="text-xs font-black text-black uppercase tracking-widest mb-4 pb-2 border-b border-black">Billing Address</p>
          <div>
            <label className={labelClass}>Street address *</label>
            <input className={inputClass} placeholder="123 Main St" value={info.billingAddress} onChange={(e) => onChange("billingAddress", e.target.value)} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>City *</label>
              <input className={inputClass} placeholder="New York" value={info.billingCity} onChange={(e) => onChange("billingCity", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input className={inputClass} placeholder="NY" value={info.billingState} onChange={(e) => onChange("billingState", e.target.value)} />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>ZIP / Postal code *</label>
              <input className={inputClass} placeholder="10001" value={info.billingZip} onChange={(e) => onChange("billingZip", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <select className={inputClass} value={info.billingCountry} onChange={(e) => onChange("billingCountry", e.target.value)}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendee assignment notice */}
        <div className="flex items-start gap-3 p-4 border border-black bg-neutral-50">
          <Users className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-black">Named attendee assignment</p>
            <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
              After purchase you'll receive a secure link to assign each ticket to a named attendee. Assignments must be completed before the preference portal opens on May 1, 2026.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3.5 border border-black text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className={`flex-1 py-3.5 font-black text-base flex items-center justify-center gap-2 transition-all border-2 ${
            valid
              ? "bg-black text-white border-black hover:bg-neutral-800"
              : "bg-white text-neutral-400 border-neutral-300 cursor-not-allowed"
          }`}
        >
          Continue to Payment
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Payment (Stripe Card Element) ─────────────────────────────────────
function PaymentForm({
  total,
  onSuccess,
  onBack,
  contactInfo,
}: {
  total: number;
  onSuccess: () => void;
  onBack: () => void;
  contactInfo: ContactInfo;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setCardError(null);
    // Prototype: simulate payment — replace with stripe.confirmCardPayment(clientSecret) in production
    await new Promise((r) => setTimeout(r, 2200));
    setProcessing(false);
    onSuccess();
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "15px",
        color: "#000000",
        fontFamily: "'Inter', sans-serif",
        "::placeholder": { color: "#9ca3af" },
        iconColor: "#000000",
      },
      invalid: { color: "#dc2626", iconColor: "#dc2626" },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-black text-black mb-2">Payment</h2>
        <p className="text-sm text-neutral-600">
          Your card will be charged <span className="font-black text-black">${total.toLocaleString()}</span> upon confirmation.
        </p>
      </div>

      {/* Billing summary */}
      <div className="mb-5 p-4 border border-black bg-neutral-50 text-sm">
        <p className="text-neutral-500 text-xs mb-1 font-black uppercase tracking-widest">Billing to</p>
        <p className="text-black font-semibold">{contactInfo.firstName} {contactInfo.lastName}</p>
        <p className="text-neutral-600 text-xs">{contactInfo.email}</p>
        <p className="text-neutral-600 text-xs">{contactInfo.billingAddress}, {contactInfo.billingCity} {contactInfo.billingZip}</p>
      </div>

      {/* Card element */}
      <div className="mb-5">
        <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Card details</label>
        <div className="px-4 py-3.5 border border-neutral-300 bg-white focus-within:border-black transition-all">
          <CardElement options={cardElementOptions} onChange={(e) => setCardError(e.error?.message ?? null)} />
        </div>
        {cardError && <p className="text-xs text-red-600 mt-1.5 font-semibold">{cardError}</p>}
      </div>

      {/* Test card hint */}
      <div className="mb-5 p-3 border border-neutral-300 bg-neutral-50 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-neutral-600 leading-relaxed">
          <span className="font-black text-black">Prototype mode:</span> Use test card <span className="font-mono font-bold">4242 4242 4242 4242</span>, any future expiry, any CVC. No real charge will occur.
        </p>
      </div>

      {/* Terms */}
      <p className="text-[11px] text-neutral-500 mb-5 leading-relaxed">
        By completing this purchase you agree to the{" "}
        <span className="text-black font-semibold cursor-pointer underline underline-offset-2">Terms of Sale</span> and{" "}
        <span className="text-black font-semibold cursor-pointer underline underline-offset-2">Refund Policy</span>.{" "}
        All sales are final. Named attendee assignment must be completed by May 1, 2026.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3.5 border border-black text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={processing || !stripe}
          className={`flex-1 py-3.5 font-black text-base flex items-center justify-center gap-2 transition-all border-2 ${
            processing
              ? "bg-neutral-700 text-white border-neutral-700 cursor-wait"
              : "bg-black text-white border-black hover:bg-neutral-800"
          }`}
        >
          {processing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Processing…
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay ${total.toLocaleString()}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Confirmation screen ────────────────────────────────────────────────────────
function ConfirmationScreen({
  cart,
  contactInfo,
}: {
  cart: CartItem[];
  contactInfo: ContactInfo;
}) {
  const [, navigate] = useLocation();
  const orderNumber = useMemo(() => `CTF-${Math.floor(100000 + Math.random() * 900000)}`, []);
  const totalTickets = cart.reduce((s, c) => s + c.qty, 0);

  const items = cart.filter((c) => c.qty > 0).map((c) => {
    const tier = TICKET_TIERS.find((t) => t.id === c.tierId)!;
    return { tier, qty: c.qty };
  });

  return (
    <div data-surface="checkout" className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Success mark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
          className="w-16 h-16 border-2 border-black flex items-center justify-center mb-6"
        >
          <Check className="w-8 h-8 text-black" />
        </motion.div>

        <h1 className="font-display text-4xl font-black text-black mb-2">Order Confirmed</h1>
        <p className="text-neutral-600 mb-1">
          Thank you, <span className="text-black font-semibold">{contactInfo.firstName}</span>. Your tickets are reserved.
        </p>
        <p className="text-xs text-neutral-500 mb-8">
          A confirmation email has been sent to <span className="text-black font-semibold">{contactInfo.email}</span>
        </p>

        {/* Order card */}
        <div className="border border-black p-5 mb-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-black">
            <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Order</p>
            <p className="font-mono text-sm text-black font-black">{orderNumber}</p>
          </div>
          <div className="space-y-2 mb-4">
            {items.map(({ tier, qty }) => (
              <div key={tier.id} className="flex items-center justify-between text-sm">
                <span className="text-black">{tier.name} <span className="text-neutral-500">×{qty}</span></span>
                <span className="text-black font-semibold">${(tier.price * qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-black pt-3 flex items-center justify-between">
            <span className="text-sm font-black text-black">Total paid</span>
            <span className="text-black font-black">${items.reduce((s, i) => s + i.tier.price * i.qty, 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Email safe-sender — primary next step */}
        <div className="border-2 border-black p-6 mb-4 bg-black text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">First &amp; Most Important Step</p>
          <p className="text-base font-black leading-snug mb-3">
            Watch for an email from{" "}
            <span className="underline underline-offset-2">reservations@CT.com</span>{" "}
            and add us to your safe sender list.
          </p>
          <p className="text-sm text-neutral-300 leading-relaxed mb-3">
            If it hasn't arrived, your corporate spam filter may have intercepted it. We'll be sharing important details to help you tailor your Chef's Table experience — so ensuring delivery is essential.
          </p>
          <p className="text-sm text-neutral-400 italic">
            We'll be in touch sparingly, and always with something worth savoring.
          </p>
        </div>

        {/* Remaining next steps */}
        <div className="border border-black p-5 mb-6 space-y-4">
          <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Next Steps</p>
          {[
            { icon: Users, text: `Assign names to your ${totalTickets} ticket${totalTickets !== 1 ? "s" : ""} via the secure link in your confirmation email.` },
            { icon: Calendar, text: "Preference portal opens June 1, 2026. Named attendees will receive individual login links." },
            { icon: Award, text: "Your lottery priority tier will be applied when allocations run in August 2026." },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-black" />
              </div>
              <p className="text-sm text-black leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href="/">
            <button className="px-6 py-3 border border-black text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors">
              Back to Home
            </button>
          </Link>
          <button
            onClick={() => toast.info("Attendee assignment portal coming soon.", { duration: 3000 })}
            className="flex-1 px-6 py-3 bg-black text-white text-sm font-black hover:bg-neutral-800 transition-colors"
          >
            Assign Attendees
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Checkout Page ─────────────────────────────────────────────────────────
export default function TicketCheckout() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>(
    TICKET_TIERS.map((t) => ({ tierId: t.id, qty: 0 }))
  );
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    emailConfirm: "",
    company: "",
    phone: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "US",
  });
  const [confirmed, setConfirmed] = useState(false);

  const updateCart = (tierId: string, qty: number) => {
    setCart((prev) => prev.map((c) => (c.tierId === tierId ? { ...c, qty } : c)));
  };

  const updateContact = (field: keyof ContactInfo, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((s, c) => {
      const tier = TICKET_TIERS.find((t) => t.id === c.tierId);
      return s + (tier?.price ?? 0) * c.qty;
    }, 0);
  }, [cart]);

  const processingFee = useMemo(() => {
    const totalQty = cart.reduce((s, c) => s + c.qty, 0);
    return Math.round(subtotal * 0.029 + 0.30 * totalQty);
  }, [subtotal, cart]);

  const total = subtotal + processingFee;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (confirmed) {
    return <ConfirmationScreen cart={cart} contactInfo={contactInfo} />;
  }

  return (
    <Elements stripe={stripePromise}>
      <div data-surface="checkout" className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b-2 border-foreground bg-background sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="p-2 border border-black hover:bg-black hover:text-white transition-colors" aria-label="Back to home">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </Link>
              <div>
                <h1 className="font-display text-base font-black text-black">Ticket Checkout</h1>
                <p className="text-xs text-neutral-500">Chef's Table Festival · Aug 13–16, 2026</p>
              </div>
            </div>
            <StepBar current={step} />
          </div>
        </div>

        {/* Body: 2-column layout */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex gap-10 items-start">
            {/* Left: active step */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  {step === 1 && (
                    <Step1Tickets
                      cart={cart}
                      onUpdate={updateCart}
                      onNext={() => setStep(2)}
                    />
                  )}
                  {step === 2 && (
                    <Step2Details
                      info={contactInfo}
                      onChange={updateContact}
                      onNext={() => setStep(3)}
                      onBack={() => setStep(1)}
                    />
                  )}
                  {step === 3 && (
                    <PaymentForm
                      total={total}
                      contactInfo={contactInfo}
                      onSuccess={() => setConfirmed(true)}
                      onBack={() => setStep(2)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: sticky order summary */}
            <div className="w-80 flex-shrink-0 sticky top-24">
              <OrderSummary cart={cart} tiers={TICKET_TIERS} />
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                <Lock className="w-3 h-3 text-black" />
                <span>256-bit SSL encryption · Powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}
