"use client";

import { useState } from "react";
import { submitContactRequest, type ContactRequestData } from "@/lib/api/contact";

/**
 * Contact Form Component
 *
 * Self-contained quote request form that integrates with the Contact Request API.
 * Designed to work on any background and match page design language.
 */

const industries = [
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
  "Perth, WA",
  "Sydney, NSW",
  "Melbourne, VIC",
  "Brisbane, QLD",
  "Adelaide, SA",
  "Darwin, NT",
  "Newcastle, NSW",
  "Central Coast, NSW",
];

const equipmentTypes = [
  "Scissor Lift",
  "Boom Lift",
  "Telehandler",
  "Forklift",
  "Generator",
  "Lighting Tower",
  "Air Compressor",
  "Fuel Tank",
  "Material Lift",
  "Man Lift",
  "Other / Not Sure",
];

export interface ContactFormProps {
  /** Form title */
  title?: string;
  /** Subtitle shown below title */
  subtitle?: string;
  /** Submit button text */
  submitButtonText?: string;
  /** Show phone CTA below form */
  showPhoneCta?: boolean;
  /** Phone number for CTA */
  phoneNumber?: string;
  /** Variant: full (all fields) or compact (essential fields only) */
  variant?: "full" | "compact";
  /** Background style */
  backgroundColor?: "white" | "gray" | "none";
}

export function ContactForm({
  title = "Request a Quote",
  subtitle = "Tell us about your project — we respond within 2 hours",
  submitButtonText = "Get Your Quote",
  showPhoneCta = true,
  phoneNumber = "13 4000",
  variant = "full",
  backgroundColor = "gray",
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    phone: "",
    email: "",
    equipmentType: "",
    industry: "",
    company: "",
    branch: "",
    projectLocation: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    const contactData: Omit<ContactRequestData, "contactRequestId"> = {
      contactFirstName: formData.firstName,
      contactLastName: formData.surname,
      contactPhone: formData.phone,
      contactEmail: formData.email,
      contactCompanyName: formData.company,
      contactMessage: formData.message,
      contactType: "General Inquiry",
      sourceDepot: formData.branch || "Website",
      contactCountry: "Australia",
      contactIndustry: formData.industry,
      projectLocationSuburb: formData.projectLocation,
      productEnquiry: formData.equipmentType || undefined,
      transactionType: "hire",
    };

    try {
      const result = await submitContactRequest(contactData);

      if (result.success) {
        setSubmitStatus("success");
        setFormData({
          firstName: "",
          surname: "",
          phone: "",
          email: "",
          equipmentType: "",
          industry: "",
          company: "",
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

  const bgClass = {
    white: "bg-white",
    gray: "bg-[#F8FAFC]",
    none: "",
  };

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#1A1A1A] placeholder:text-gray-400 focus:ring-2 focus:ring-[#E31937]/20 focus:border-[#E31937] outline-none transition-all";

  const labelClass = "block text-sm font-medium text-[#374151] mb-1.5";

  const isCompact = variant === "compact";

  return (
    <section id="quote-form" className={`py-12 md:py-16 ${bgClass[backgroundColor]}`}>
      <div className={`mx-auto px-4 ${isCompact ? "max-w-xl" : "max-w-2xl"}`}>
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 md:px-8 pt-6 md:pt-8 pb-6 border-b border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-gray-500">{subtitle}</p>
            )}
          </div>

          {/* Form Content */}
          <div className="px-6 md:px-8 py-6 md:py-8">
            {submitStatus === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Thank You!</h3>
                <p className="text-gray-500 mb-6">
                  Your enquiry has been submitted. We&apos;ll be in touch within 2 hours.
                </p>
                <button
                  onClick={() => setSubmitStatus("idle")}
                  className="text-[#E31937] font-medium hover:underline"
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section: Contact Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        First Name <span className="text-[#E31937]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        placeholder="John"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Surname <span className="text-[#E31937]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => handleChange("surname", e.target.value)}
                        placeholder="Smith"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Mobile <span className="text-[#E31937]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="0400 000 000"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Email <span className="text-[#E31937]">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@company.com"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Project Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Project Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          Equipment Type <span className="text-[#E31937]">*</span>
                        </label>
                        <select
                          value={formData.equipmentType}
                          onChange={(e) => handleChange("equipmentType", e.target.value)}
                          required
                          className={inputClass}
                        >
                          <option value="">Select equipment</option>
                          {equipmentTypes.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>
                          Branch <span className="text-[#E31937]">*</span>
                        </label>
                        <select
                          value={formData.branch}
                          onChange={(e) => handleChange("branch", e.target.value)}
                          required
                          className={inputClass}
                        >
                          <option value="">Select branch</option>
                          {branches.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!isCompact && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Industry</label>
                          <select
                            value={formData.industry}
                            onChange={(e) => handleChange("industry", e.target.value)}
                            className={inputClass}
                          >
                            <option value="">Select industry</option>
                            {industries.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Company</label>
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => handleChange("company", e.target.value)}
                            placeholder="Company name"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>
                        Project Location <span className="text-[#E31937]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.projectLocation}
                        onChange={(e) => handleChange("projectLocation", e.target.value)}
                        placeholder="Suburb or site address"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Message <span className="text-[#E31937]">*</span>
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Tell us about your project requirements, dates needed, etc."
                        required
                        rows={isCompact ? 3 : 4}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {submitStatus === "error" && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E31937] hover:bg-[#C42920] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#E31937]/25 hover:shadow-xl hover:shadow-[#E31937]/30"
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
                    <>
                      {submitButtonText}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Phone CTA */}
                {showPhoneCta && (
                  <div className="text-center pt-2">
                    <p className="text-gray-500 text-sm">
                      Need help now?{" "}
                      <a
                        href={`tel:${phoneNumber.replace(/\s/g, "")}`}
                        className="text-[#E31937] font-semibold hover:underline"
                      >
                        Call {phoneNumber}
                      </a>
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
