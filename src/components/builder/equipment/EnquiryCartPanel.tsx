"use client";

/**
 * EnquiryCartPanel - Brand Aware
 *
 * Equipment enquiry form panel that uses CSS variables from ThemeProvider
 * for colors to automatically adapt to the selected brand.
 */

import { useState } from "react";
import { useEnquiryCart, EnquiryCartItem } from "@/lib/enquiry-cart";
import { submitContactRequest, type ContactRequestData } from "@/lib/api/contact";

interface EnquiryCartPanelProps {
  /** Show the panel */
  isOpen?: boolean;
  /** Callback to close panel */
  onClose?: () => void;
}

const industries = [
  "Select your Industry Type",
  "Construction",
  "Mining",
  "Manufacturing",
  "Warehousing & Logistics",
  "Events",
  "Film & TV",
  "Facility Maintenance",
  "Agriculture",
  "Government",
  "Other",
];

const branches = [
  "Choose Your Branch",
  "Perth, WA",
  "Sydney, NSW",
  "Melbourne, VIC",
  "Brisbane, QLD",
  "Adelaide, SA",
  "Darwin, NT",
  "Newcastle, NSW",
  "Central Coast, NSW",
];

const countries = ["Australia", "New Zealand", "United States", "United Kingdom", "Other"];

export function EnquiryCartPanel({ isOpen = false, onClose }: EnquiryCartPanelProps) {
  const { items, removeItem, clearCart, itemCount } = useEnquiryCart();
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    phone: "",
    email: "",
    industry: "",
    company: "",
    country: "Australia",
    branch: "",
    projectLocation: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    // Build equipment list for the message
    const equipmentList = items.map((item) => `- ${item.name}${item.brand ? ` (${item.brand})` : ""}`).join("\n");
    const fullMessage = `Equipment Enquiry:\n${equipmentList}\n\nAdditional Message:\n${formData.message}`;

    const contactData: Omit<ContactRequestData, "contactRequestId"> = {
      contactFirstName: formData.firstName,
      contactLastName: formData.surname,
      contactPhone: formData.phone,
      contactEmail: formData.email,
      contactCompanyName: formData.company,
      contactMessage: fullMessage,
      contactType: "Equipment Enquiry",
      sourceDepot: formData.branch || "Website",
      contactCountry: formData.country,
      contactIndustry: formData.industry,
      projectLocationSuburb: formData.projectLocation,
      productEnquiry: items.map((item) => item.name).join(", "),
      transactionType: "hire",
    };

    try {
      const result = await submitContactRequest(contactData);

      if (result.success) {
        setSubmitStatus("success");
        clearCart();
        setFormData({
          firstName: "",
          surname: "",
          phone: "",
          email: "",
          industry: "",
          company: "",
          country: "Australia",
          branch: "",
          projectLocation: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error || "Failed to submit. Please try again.");
      }
    } catch {
      setSubmitStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg" style={{ color: "var(--color-foreground)" }}>Equipment Enquiry</h2>
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              {itemCount} {itemCount === 1 ? "item" : "items"} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 transition-colors"
            style={{ color: "var(--color-muted-foreground)" }}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {submitStatus === "success" ? (
            <div className="py-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: "var(--color-success)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-foreground)" }}>Thank You!</h3>
              <p className="mb-6" style={{ color: "var(--color-muted-foreground)" }}>
                Your equipment enquiry has been submitted. We&apos;ll be in touch shortly.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Equipment List */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ color: "var(--color-foreground)" }}>
                  Selected Equipment
                </h3>
                {items.length === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: "var(--color-muted-foreground)" }}>
                    No equipment selected. Add items from the equipment list.
                  </p>
                ) : (
                  items.map((item) => (
                    <CartItemRow key={item.id} item={item} onRemove={() => removeItem(item.id)} />
                  ))
                )}
              </div>

              {items.length > 0 && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 rounded-lg font-semibold text-lg transition-colors"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                  }}
                >
                  Continue to Enquiry Form
                </button>
              )}

              {/* Enquiry Form */}
              {showForm && items.length > 0 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide border-t pt-4" style={{ color: "var(--color-foreground)" }}>
                    Your Details
                  </h3>

                  {/* Two-column grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                        First Name <span style={{ color: "var(--color-primary)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        placeholder="Enter First Name"
                        required
                        className="w-full px-4 py-3 border rounded-lg outline-none"
                        style={{ borderColor: "var(--color-input)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                        Surname <span style={{ color: "var(--color-primary)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => handleChange("surname", e.target.value)}
                        placeholder="Enter Surname"
                        required
                        className="w-full px-4 py-3 border rounded-lg outline-none"
                        style={{ borderColor: "var(--color-input)" }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                        Mobile Phone <span style={{ color: "var(--color-primary)" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="Enter Mobile Phone"
                        required
                        className="w-full px-4 py-3 border rounded-lg outline-none"
                        style={{ borderColor: "var(--color-input)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                        Email <span style={{ color: "var(--color-primary)" }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter Email"
                        required
                        className="w-full px-4 py-3 border rounded-lg outline-none"
                        style={{ borderColor: "var(--color-input)" }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                        Industry <span style={{ color: "var(--color-primary)" }}>*</span>
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleChange("industry", e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg outline-none bg-white"
                        style={{ borderColor: "var(--color-input)" }}
                      >
                        {industries.map((opt) => (
                          <option key={opt} value={opt === "Select your Industry Type" ? "" : opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        placeholder="Enter Company Name"
                        className="w-full px-4 py-3 border rounded-lg outline-none"
                        style={{ borderColor: "var(--color-input)" }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg outline-none bg-white"
                        style={{ borderColor: "var(--color-input)" }}
                      >
                        {countries.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                        Select Branch <span style={{ color: "var(--color-primary)" }}>*</span>
                      </label>
                      <select
                        value={formData.branch}
                        onChange={(e) => handleChange("branch", e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg outline-none bg-white"
                        style={{ borderColor: "var(--color-input)" }}
                      >
                        {branches.map((opt) => (
                          <option key={opt} value={opt === "Choose Your Branch" ? "" : opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                      Project Location Suburb <span style={{ color: "var(--color-primary)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.projectLocation}
                      onChange={(e) => handleChange("projectLocation", e.target.value)}
                      placeholder="Enter Project Location Suburb"
                      required
                      className="w-full px-4 py-3 border rounded-lg outline-none"
                      style={{ borderColor: "var(--color-input)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                      Enquiry Message <span style={{ color: "var(--color-primary)" }}>*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Enter Enquiry Message"
                      required
                      rows={4}
                      className="w-full px-4 py-3 border rounded-lg outline-none resize-none"
                      style={{ borderColor: "var(--color-input)" }}
                    />
                  </div>

                  {submitStatus === "error" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-red-700 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full disabled:bg-gray-400 disabled:cursor-not-allowed py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: isSubmitting ? undefined : "var(--color-primary)",
                      color: "var(--color-primary-foreground)",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "SUBMIT"
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CartItemRow({ item, onRemove }: { item: EnquiryCartItem; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" style={{ color: "var(--color-foreground)" }}>{item.name}</p>
        {item.brand && (
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{item.brand}</p>
        )}
        {item.category && (
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{item.category}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="p-2 transition-colors hover:opacity-80"
        style={{ color: "var(--color-muted-foreground)" }}
        aria-label="Remove item"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}

export default EnquiryCartPanel;
