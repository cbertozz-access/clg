"use client";

import { useState } from "react";
import { submitContactRequest, mapFormDataToContactRequest } from "@/lib/api/contact";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  highlighted?: boolean;
  options?: string[];
  helperText?: string;
}

export interface LPQuoteFormProps {
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  fields?: FormField[];
  showPrivacyNote?: boolean;
  privacyNoteText?: string;
  variant?: "standard" | "compact";
  backgroundColor?: "dark" | "light" | "none";
}

const defaultFields: FormField[] = [
  { name: "firstName", label: "First Name", type: "text", placeholder: "Enter First Name", required: true },
  { name: "surname", label: "Surname", type: "text", placeholder: "Enter Surname", required: true },
  { name: "phone", label: "Mobile Phone", type: "tel", placeholder: "Enter Mobile Phone", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "Enter Email", required: true },
  { name: "industry", label: "Industry", type: "select", required: true, options: ["Select your Industry Type", "Construction", "Mining", "Manufacturing", "Warehousing & Logistics", "Events", "Film & TV", "Facility Maintenance", "Agriculture", "Government", "Other"] },
  { name: "company", label: "Company Name", type: "text", placeholder: "Enter Company Name" },
  { name: "country", label: "Country", type: "select", options: ["Australia", "New Zealand", "United States", "United Kingdom", "Other"] },
  { name: "branch", label: "Select Branch", type: "select", required: true, options: ["Choose Your Branch", "Perth, WA", "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Adelaide, SA", "Darwin, NT", "Newcastle, NSW", "Central Coast, NSW"] },
  { name: "projectLocation", label: "Project Location Suburb", type: "text", placeholder: "Enter Project Location Suburb", required: true },
  { name: "message", label: "Enquiry Message", type: "textarea", placeholder: "Enter Enquiry Message", required: true },
];

export function LPQuoteForm(props: Partial<LPQuoteFormProps>) {
  const title = props.title || "Lorem Ipsum Dolor";
  const subtitle = props.subtitle || "Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.";
  const submitButtonText = props.submitButtonText || "Lorem Ipsum";
  const fields = props.fields?.length ? props.fields : defaultFields;
  const showPrivacyNote = props.showPrivacyNote ?? true;
  const privacyNoteText = props.privacyNoteText || "Your information is secure and will never be shared";
  const variant = props.variant || "standard";
  const backgroundColor = props.backgroundColor || "dark";

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const contactData = mapFormDataToContactRequest(formData);
      const result = await submitContactRequest(contactData);

      if (result.success) {
        setSubmitStatus('success');
        setFormData({}); // Clear form on success
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to submit. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const bgClasses = {
    dark: "py-16 bg-[#1A1A1A]",
    light: "py-16 bg-[#F3F4F6]",
    none: "",
  };

  const isCompact = variant === "compact";

  const renderField = (field: FormField) => {
    const baseInputClass = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#E63229] focus:border-[#E63229] outline-none transition-all ${
      isCompact ? "text-sm" : ""
    }`;

    const highlightedClass = field.highlighted
      ? "border-[#E63229] bg-red-50"
      : "border-gray-300";

    const inputClass = `${baseInputClass} ${highlightedClass}`;

    const fieldWrapper = field.highlighted ? (
      <div className="border-2 border-[#E63229] bg-red-50 rounded-lg p-4">
        <label className="flex items-center gap-2 text-sm font-bold text-[#E63229] mb-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {field.label} {field.required && <span className="text-[#E63229]">*</span>}
        </label>
        {renderInput(field, `${baseInputClass} border-[#E63229]`)}
        {field.helperText && (
          <p className="text-xs text-[#E63229] mt-2">{field.helperText}</p>
        )}
      </div>
    ) : (
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
          {field.label} {field.required && <span className="text-[#E63229]">*</span>}
        </label>
        {renderInput(field, inputClass)}
      </div>
    );

    return fieldWrapper;
  };

  const renderInput = (field: FormField, className: string) => {
    switch (field.type) {
      case "select":
        return (
          <select
            className={`${className} bg-white`}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "textarea":
        return (
          <textarea
            className={`${className} resize-none`}
            rows={4}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      default:
        return (
          <input
            type={field.type}
            className={className}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  // Group fields for two-column layout (pairs will be rendered side by side)
  const pairedFields = ["firstName", "surname", "phone", "email", "industry", "company", "country", "branch"];

  return (
    <section id="quote-form" className={bgClasses[backgroundColor]}>
      <div className={`${backgroundColor !== "none" ? "max-w-3xl" : ""} mx-auto px-4`}>
        <div className={`bg-white rounded-2xl ${isCompact ? "p-6" : "p-8 md:p-10"}`}>
          <h2 className={`${isCompact ? "text-xl" : "text-2xl"} font-bold text-[#1A1A1A] mb-2`}>
            {title}
          </h2>
          <p className="text-[#6B7280] mb-8">{subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field, index) => {
              // Check if this field should be in a row with the next one
              const isPairable = pairedFields.includes(field.name);
              const nextField = fields[index + 1];
              const shouldPairWithNext = isPairable && nextField && pairedFields.includes(nextField.name);
              const isPairedWithPrevious = index > 0 && pairedFields.includes(fields[index - 1]?.name) && isPairable;

              if (isPairedWithPrevious) {
                return null; // Already rendered in previous iteration
              }

              if (shouldPairWithNext) {
                return (
                  <div key={field.name} className="grid md:grid-cols-2 gap-4">
                    {renderField(field)}
                    {renderField(nextField)}
                  </div>
                );
              }

              return <div key={field.name}>{renderField(field)}</div>;
            })}

            {submitStatus === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800 mb-1">Thank You!</h3>
                <p className="text-green-700">Your enquiry has been submitted. We&apos;ll be in touch shortly.</p>
              </div>
            ) : (
              <>
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-red-700 text-sm">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E63229] hover:bg-[#C42920] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
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
                    submitButtonText
                  )}
                </button>
              </>
            )}

            {showPrivacyNote && submitStatus !== 'success' && (
              <p className="text-center text-xs text-[#6B7280]">
                {privacyNoteText}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
