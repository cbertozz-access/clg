"use client";

import { useState } from "react";
import { submitContactRequest, type ContactRequestData } from "@/lib/api/contact";

/**
 * Contact Form Component
 *
 * Matches the Contact Request API fields exactly.
 * Clean, simple implementation with all required fields.
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

const countries = [
  "Australia",
  "New Zealand",
  "United States",
  "United Kingdom",
  "Other",
];

export interface ContactFormProps {
  title?: string;
  backgroundColor?: "white" | "gray" | "none";
}

export function ContactForm({
  title = "CONTACT US",
  backgroundColor = "gray",
}: ContactFormProps) {
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
      contactCountry: formData.country,
      contactIndustry: formData.industry,
      projectLocationSuburb: formData.projectLocation,
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

  const bgClass = {
    white: "bg-white",
    gray: "bg-[#F3F4F6]",
    none: "",
  };

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-[#E31937] outline-none transition-colors";

  const labelClass = "block text-sm font-semibold text-[#1A1A1A] mb-1";

  return (
    <section className={`py-12 ${bgClass[backgroundColor]}`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">{title}</h2>

          {submitStatus === "success" ? (
            <div className="text-center py-8">
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
              <p className="text-gray-600">
                Your enquiry has been submitted. We&apos;ll be in touch shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: First Name, Surname */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    First Name<span className="text-[#E31937]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="Enter First Name"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Surname<span className="text-[#E31937]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => handleChange("surname", e.target.value)}
                    placeholder="Enter Surname"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Row 2: Mobile Phone, Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Mobile Phone<span className="text-[#E31937]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter Mobile Phone"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Email<span className="text-[#E31937]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter Email"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Row 3: Industry, Company Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Industry<span className="text-[#E31937]">*</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select your Industry Type</option>
                    {industries.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    placeholder="Enter Company Name"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Row 4: Country, Select Branch */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className={inputClass}
                  >
                    {countries.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Select Branch<span className="text-[#E31937]">*</span>
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => handleChange("branch", e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Choose Your Branch</option>
                    {branches.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Project Location Suburb */}
              <div>
                <label className={labelClass}>
                  Project Location Suburb<span className="text-[#E31937]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectLocation}
                  onChange={(e) => handleChange("projectLocation", e.target.value)}
                  placeholder="Enter Project Location Suburb"
                  required
                  className={inputClass}
                />
              </div>

              {/* Row 6: Enquiry Message */}
              <div>
                <label className={labelClass}>
                  Enquiry Message<span className="text-[#E31937]">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Enter Enquiry Message"
                  required
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Error Message */}
              {submitStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E31937] hover:bg-[#C42920] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
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
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
