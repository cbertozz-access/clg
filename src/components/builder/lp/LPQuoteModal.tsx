"use client";

import { useEffect, useState } from "react";

/**
 * Quote Modal - Mobile Component
 *
 * Slide-up modal form for mobile quote requests.
 */

export interface EquipmentOption {
  label: string;
  value: string;
}

export interface LPQuoteModalProps {
  /** Whether modal is open */
  isOpen?: boolean;
  /** Callback to close modal */
  onClose?: () => void;
  /** Modal title */
  title?: string;
  /** Modal subtitle */
  subtitle?: string;
  /** Submit button text */
  submitText?: string;
  /** Equipment options for dropdown */
  equipmentOptions?: EquipmentOption[];
  /** Pre-selected equipment */
  selectedEquipment?: string;
  /** Form action URL */
  formAction?: string;
}

const defaultEquipmentOptions: EquipmentOption[] = [
  { label: "Forklift", value: "forklift" },
  { label: "Boom Lift", value: "boom-lift" },
  { label: "Scissor Lift", value: "scissor-lift" },
  { label: "Telehandler", value: "telehandler" },
  { label: "Other / Not Sure", value: "other" },
];

export function LPQuoteModal({
  isOpen = false,
  onClose,
  title = "Get a Quote",
  subtitle,
  submitText = "Get My Quote",
  equipmentOptions = defaultEquipmentOptions,
  selectedEquipment = "",
  formAction,
}: LPQuoteModalProps) {
  const [equipment, setEquipment] = useState(selectedEquipment);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Update equipment when prop changes
  useEffect(() => {
    setEquipment(selectedEquipment);
  }, [selectedEquipment]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-[var(--color-foreground,#1A1A1A)]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-[var(--color-muted-foreground,#6B7280)]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[var(--color-muted-foreground,#6B7280)] hover:text-[var(--color-foreground,#1A1A1A)]"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form action={formAction} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground,#1A1A1A)] mb-1">
              Your Name <span className="text-[var(--color-error,#E63229)]">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              required
              className="w-full px-4 py-3.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[var(--color-primary,#E63229)] focus:border-[var(--color-primary,#E63229)] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground,#1A1A1A)] mb-1">
              Phone Number <span className="text-[var(--color-error,#E63229)]">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              inputMode="tel"
              placeholder="04XX XXX XXX"
              required
              className="w-full px-4 py-3.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[var(--color-primary,#E63229)] focus:border-[var(--color-primary,#E63229)] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground,#1A1A1A)] mb-1">
              Email Address <span className="text-[var(--color-error,#E63229)]">*</span>
            </label>
            <input
              type="email"
              name="email"
              inputMode="email"
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[var(--color-primary,#E63229)] focus:border-[var(--color-primary,#E63229)] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground,#1A1A1A)] mb-1">
              Equipment <span className="text-[var(--color-error,#E63229)]">*</span>
            </label>
            <select
              name="equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              required
              className="w-full px-4 py-3.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[var(--color-primary,#E63229)] focus:border-[var(--color-primary,#E63229)] outline-none bg-white"
            >
              <option value="">Select equipment...</option>
              {equipmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground,#1A1A1A)] mb-1">
              Project Location
            </label>
            <input
              type="text"
              name="postcode"
              inputMode="numeric"
              placeholder="Postcode"
              className="w-full px-4 py-3.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[var(--color-primary,#E63229)] focus:border-[var(--color-primary,#E63229)] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground,#1A1A1A)] mb-1">
              Additional Details
            </label>
            <textarea
              name="details"
              rows={3}
              placeholder="Tell us more about your requirements..."
              className="w-full px-4 py-3.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[var(--color-primary,#E63229)] focus:border-[var(--color-primary,#E63229)] outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--color-primary,#E63229)] hover:opacity-90 text-white font-bold py-4 rounded-lg text-base transition-opacity min-h-[52px] flex items-center justify-center gap-2"
          >
            {submitText}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>

          <p className="text-center text-xs text-[var(--color-muted-foreground,#6B7280)] flex items-center justify-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Your information is secure
          </p>
        </form>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
