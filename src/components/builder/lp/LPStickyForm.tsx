"use client";

import { useState } from "react";

export interface LPStickyFormProps {
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  phoneNumber?: string;
  showPhoneCta?: boolean;
}

export function LPStickyForm(props: Partial<LPStickyFormProps>) {
  const title = props.title || "Get a Quick Quote";
  const subtitle = props.subtitle || "Tell us what you need and we'll respond within 2 hours";
  const submitButtonText = props.submitButtonText || "Get My Quote";
  const phoneNumber = props.phoneNumber || "13 4000";
  const showPhoneCta = props.showPhoneCta ?? true;
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    requirements: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sticky form submitted:", formData);
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="sticky top-[100px]">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#E63229]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-7 h-7 text-[#E63229]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{title}</h3>
          <p className="text-[#6B7280] text-sm">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Name <span className="text-[#E63229]">*</span>
            </label>
            <input
              type="text"
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63229] focus:border-[#E63229] outline-none transition-all text-sm"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Phone <span className="text-[#E63229]">*</span>
            </label>
            <input
              type="tel"
              placeholder="04XX XXX XXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63229] focus:border-[#E63229] outline-none transition-all text-sm"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Email <span className="text-[#E63229]">*</span>
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63229] focus:border-[#E63229] outline-none transition-all text-sm"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Location <span className="text-[#E63229]">*</span>
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63229] focus:border-[#E63229] outline-none transition-all bg-white text-sm"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              required
            >
              <option value="">Select your location</option>
              <option value="perth">Perth, WA</option>
              <option value="sydney">Sydney, NSW</option>
              <option value="melbourne">Melbourne, VIC</option>
              <option value="brisbane">Brisbane, QLD</option>
              <option value="adelaide">Adelaide, SA</option>
              <option value="darwin">Darwin, NT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Tell us what you need (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63229] focus:border-[#E63229] outline-none transition-all resize-none text-sm"
              value={formData.requirements}
              onChange={(e) => handleChange("requirements", e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E63229] hover:bg-[#C42920] text-white py-4 rounded-lg font-bold transition-colors"
          >
            {submitButtonText}
          </button>
        </form>

        {showPhoneCta && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-center text-sm text-[#6B7280] mb-2">
              Or call us directly
            </p>
            <a
              href={`tel:${phoneNumber.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 text-[#1A1A1A] font-bold text-lg hover:text-[#E63229] transition-colors"
            >
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {phoneNumber}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
