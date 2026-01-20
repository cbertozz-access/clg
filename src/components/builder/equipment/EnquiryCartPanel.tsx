"use client";

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
            <h2 className="font-bold text-lg text-[#1A1A1A]">Equipment Enquiry</h2>
            <p className="text-sm text-[#6B7280]">
              {itemCount} {itemCount === 1 ? "item" : "items"} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#6B7280] hover:text-[#1A1A1A]"
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
                className="w-16 h-16 text-green-500 mx-auto mb-4"
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
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Thank You!</h3>
              <p className="text-[#6B7280] mb-6">
                Your equipment enquiry has been submitted. We&apos;ll be in touch shortly.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#E31937] text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Equipment List */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm text-[#1A1A1A] uppercase tracking-wide">
                  Selected Equipment
                </h3>
                {items.length === 0 ? (
                  <p className="text-[#6B7280] text-sm py-4 text-center">
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
                  className="w-full bg-[#E31937] hover:bg-[#C42920] text-white py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  Continue to Enquiry Form
                </button>
              )}

              {/* Enquiry Form */}
              {showForm && items.length > 0 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-semibold text-sm text-[#1A1A1A] uppercase tracking-wide border-t pt-4">
                    Your Details
                  </h3>

                  {/* Two-column grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        First Name <span className="text-[#E31937]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        placeholder="Enter First Name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        Surname <span className="text-[#E31937]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => handleChange("surname", e.target.value)}
                        placeholder="Enter Surname"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        Mobile Phone <span className="text-[#E31937]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="Enter Mobile Phone"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        Email <span className="text-[#E31937]">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter Email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        Industry <span className="text-[#E31937]">*</span>
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleChange("industry", e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none bg-white"
                      >
                        {industries.map((opt) => (
                          <option key={opt} value={opt === "Select your Industry Type" ? "" : opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        placeholder="Enter Company Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none bg-white"
                      >
                        {countries.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        Select Branch <span className="text-[#E31937]">*</span>
                      </label>
                      <select
                        value={formData.branch}
                        onChange={(e) => handleChange("branch", e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none bg-white"
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
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                      Project Location Suburb <span className="text-[#E31937]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.projectLocation}
                      onChange={(e) => handleChange("projectLocation", e.target.value)}
                      placeholder="Enter Project Location Suburb"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                      Enquiry Message <span className="text-[#E31937]">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Enter Enquiry Message"
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none resize-none"
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
                    className="w-full bg-[#E31937] hover:bg-[#C42920] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
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
        <p className="font-medium text-[#1A1A1A] truncate">{item.name}</p>
        {item.brand && (
          <p className="text-sm text-[#6B7280]">{item.brand}</p>
        )}
        {item.category && (
          <p className="text-xs text-[#6B7280]">{item.category}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="p-2 text-[#6B7280] hover:text-[#E31937] transition-colors"
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
