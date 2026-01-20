"use client";

import { useEffect, useState } from "react";
import { submitContactRequest, type ContactRequestData } from "@/lib/api/contact";

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
}: LPQuoteModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    equipment: selectedEquipment,
    postcode: "",
    details: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Split name into first and last
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const contactData: Omit<ContactRequestData, 'contactRequestId'> = {
      contactFirstName: firstName,
      contactLastName: lastName,
      contactPhone: formData.phone,
      contactEmail: formData.email,
      contactCompanyName: '',
      contactMessage: formData.details || `Equipment enquiry: ${formData.equipment}`,
      contactType: 'Quote Request',
      sourceDepot: 'Website',
      projectLocationSuburb: formData.postcode,
      productEnquiry: formData.equipment,
      transactionType: 'hire',
    };

    try {
      const result = await submitContactRequest(contactData);

      if (result.success) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    setFormData(prev => ({ ...prev, equipment: selectedEquipment }));
  }, [selectedEquipment]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

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
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {submitStatus === 'success' ? (
            <div className="py-8 text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-[var(--color-foreground,#1A1A1A)] mb-2">Thank You!</h3>
              <p className="text-[var(--color-muted-foreground,#6B7280)] mb-6">Your quote request has been submitted. We&apos;ll be in touch shortly.</p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-[var(--color-primary,#E63229)] text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground,#1A1A1A)] mb-1">
                  Your Name <span className="text-[var(--color-error,#E63229)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
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
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
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
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
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
                  value={formData.equipment}
                  onChange={(e) => handleChange('equipment', e.target.value)}
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
                  value={formData.postcode}
                  onChange={(e) => handleChange('postcode', e.target.value)}
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
                  value={formData.details}
                  onChange={(e) => handleChange('details', e.target.value)}
                  rows={3}
                  placeholder="Tell us more about your requirements..."
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[var(--color-primary,#E63229)] focus:border-[var(--color-primary,#E63229)] outline-none resize-none"
                />
              </div>

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--color-primary,#E63229)] hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg text-base transition-opacity min-h-[52px] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
            </>
          )}
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
