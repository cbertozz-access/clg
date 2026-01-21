"use client";

import { useState, useEffect } from "react";
import { PageBuilder } from "./PageBuilder";

/**
 * Admin Dashboard - Page Generator
 *
 * AHA-branded admin UI for creating pages in Builder.io
 */

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
}

interface Brand {
  id: string;
  name: string;
  color: string;
}

interface CreatedPage {
  id: string;
  name: string;
  urlPath: string;
  editUrl?: string;
  createdAt: string;
  brand: string;
}

interface BuilderPage {
  id: string;
  name: string;
  published: string;
  createdDate: number;
  data: {
    title?: string;
    url?: string;
  };
  query?: Array<{ property: string; value: string }>;
}

type CreateMode = "templates" | "builder";

const TEMPLATES: PageTemplate[] = [
  {
    id: "hero-contact",
    name: "Hero + Contact Form",
    description: "Full-width hero with headline, subheadline, and contact form below",
    preview: "/templates/hero-contact.png",
  },
  {
    id: "equipment-landing",
    name: "Equipment Category",
    description: "Category hero, equipment grid, and enquiry CTA",
    preview: "/templates/equipment-landing.png",
  },
  {
    id: "campaign-landing",
    name: "Campaign Landing",
    description: "Hero, benefits, testimonials, FAQ, and strong CTA",
    preview: "/templates/campaign-landing.png",
  },
  {
    id: "location-page",
    name: "Branch/Location",
    description: "Location details, map, team, and local equipment",
    preview: "/templates/location-page.png",
  },
];

const BRANDS: Brand[] = [
  { id: "access-hire", name: "Access Hire Australia", color: "#E31937" },
  { id: "access-express", name: "Access Express", color: "#0A1628" },
];

type TabType = "create" | "pages" | "brands" | "settings";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const [createMode, setCreateMode] = useState<CreateMode>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("access-hire");
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastCreatedPage, setLastCreatedPage] = useState<CreatedPage | null>(null);
  const [recentPages, setRecentPages] = useState<CreatedPage[]>([]);
  const [builderPages, setBuilderPages] = useState<BuilderPage[]>([]);
  const [loadingBuilderPages, setLoadingBuilderPages] = useState(false);

  // Fetch pages from Builder.io
  const fetchBuilderPages = async () => {
    setLoadingBuilderPages(true);
    try {
      const response = await fetch(
        `https://cdn.builder.io/api/v3/content/cc-equipment-category?apiKey=286fbab6792c4f4f86cd9ec36393ea60&limit=50&includeUnpublished=true`
      );
      if (response.ok) {
        const data = await response.json();
        setBuilderPages(data.results || []);
      }
    } catch (error) {
      console.error("Failed to fetch Builder pages:", error);
    } finally {
      setLoadingBuilderPages(false);
    }
  };

  // Load Builder pages when Pages tab is active
  useEffect(() => {
    if (activeTab === "pages") {
      fetchBuilderPages();
    }
  }, [activeTab]);

  // Load recent pages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("clg-admin-recent-pages");
    if (saved) {
      try {
        setRecentPages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recent pages:", e);
      }
    }
  }, []);

  // Save recent pages to localStorage when updated
  const saveRecentPage = (page: CreatedPage) => {
    const updated = [page, ...recentPages.filter(p => p.id !== page.id)].slice(0, 10);
    setRecentPages(updated);
    localStorage.setItem("clg-admin-recent-pages", JSON.stringify(updated));
  };

  // Handle Page Builder save
  const handleBuilderSave = async (
    blocks: Array<{ type: string; props: Record<string, unknown> }>,
    pageData: { name: string; urlPath: string }
  ) => {
    setIsCreating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/create-page-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks,
          brand: selectedBrand,
          name: pageData.name,
          urlPath: pageData.urlPath,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const createdPage: CreatedPage = {
          id: result.pageId || `temp-${Date.now()}`,
          name: pageData.name,
          urlPath: pageData.urlPath,
          editUrl: result.editUrl,
          createdAt: new Date().toISOString(),
          brand: selectedBrand,
        };

        setLastCreatedPage(createdPage);
        saveRecentPage(createdPage);
        setSuccessMessage("Page created successfully!");
        setCreateMode("templates"); // Return to templates view
      } else {
        setErrorMessage(result.error || "Failed to create page");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    urlPath: "",
    headline: "",
    subheadline: "",
    ctaText: "Get a Quote",
    ctaLink: "#quote-form",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generate URL path from name
    if (name === "name" && !formData.urlPath) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setFormData(prev => ({ ...prev, urlPath: `/${slug}` }));
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setLastCreatedPage(null);

    try {
      const response = await fetch("/api/admin/create-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: selectedTemplate,
          brand: selectedBrand,
          ...formData,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const createdPage: CreatedPage = {
          id: result.pageId || `temp-${Date.now()}`,
          name: formData.name,
          urlPath: formData.urlPath,
          editUrl: result.editUrl,
          createdAt: new Date().toISOString(),
          brand: selectedBrand,
        };

        setLastCreatedPage(createdPage);
        saveRecentPage(createdPage);
        setSuccessMessage("Page created successfully!");

        // Reset form
        setFormData({
          name: "",
          urlPath: "",
          headline: "",
          subheadline: "",
          ctaText: "Get a Quote",
          ctaLink: "#quote-form",
        });
        setSelectedTemplate("");
      } else {
        setErrorMessage(result.error || "Failed to create page. Check Builder.io for details.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "create",
      label: "Create Page",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: "pages",
      label: "Pages",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: "brands",
      label: "Brands",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#E31937] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#E31937] font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold font-[var(--font-lato)]">CLG Admin</h1>
                <p className="text-xs text-red-100">Page Generator</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://builder.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-100 hover:text-white transition-colors"
              >
                Open Builder.io →
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#E31937] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pages</span>
                  <span className="font-semibold text-gray-900">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Published</span>
                  <span className="font-semibold text-green-600">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drafts</span>
                  <span className="font-semibold text-yellow-600">6</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "create" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create New Page</h2>
                    <p className="text-gray-600 mt-1">
                      {createMode === "templates"
                        ? "Select a template and configure your new landing page"
                        : "Drag and drop components to build your page"}
                    </p>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setCreateMode("templates")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        createMode === "templates"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Quick Templates
                    </button>
                    <button
                      onClick={() => setCreateMode("builder")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        createMode === "builder"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Page Builder
                    </button>
                  </div>
                </div>

                {/* Success/Error Messages */}
                {successMessage && lastCreatedPage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-green-800 font-medium">{successMessage}</p>
                        <p className="text-green-700 text-sm mt-1">
                          <strong>{lastCreatedPage.name}</strong> at <code className="bg-green-100 px-1 rounded">{lastCreatedPage.urlPath}</code>
                        </p>
                        <div className="flex gap-4 mt-3">
                          <a href={lastCreatedPage.urlPath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800">
                            Preview Page →
                          </a>
                          {lastCreatedPage.editUrl && (
                            <a href={lastCreatedPage.editUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800">
                              Edit in Builder.io →
                            </a>
                          )}
                        </div>
                      </div>
                      <button onClick={() => { setSuccessMessage(null); setLastCreatedPage(null); }} className="text-green-500 hover:text-green-700">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-800 flex-1">{errorMessage}</p>
                    <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}

                {/* Page Builder Mode */}
                {createMode === "builder" && (
                  <div className="mb-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-gray-900">Select Brand First:</span>
                      </div>
                      <div className="flex gap-4">
                        {BRANDS.map((brand) => (
                          <button
                            key={brand.id}
                            onClick={() => setSelectedBrand(brand.id)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition-all ${
                              selectedBrand === brand.id
                                ? "border-[#E31937] bg-red-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: brand.color }} />
                            <span className="font-medium text-gray-900">{brand.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <PageBuilder
                      brand={selectedBrand}
                      onSave={handleBuilderSave}
                      onCancel={() => setCreateMode("templates")}
                    />
                  </div>
                )}

                {/* Templates Mode */}
                {createMode === "templates" && (
                  <>
                {/* Step 1: Select Template */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 bg-[#E31937] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">Select Template</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          selectedTemplate === template.id
                            ? "border-[#E31937] bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="aspect-video bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Select Brand */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 bg-[#E31937] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">Select Brand</h3>
                  </div>

                  <div className="flex gap-4">
                    {BRANDS.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedBrand === brand.id
                            ? "border-[#E31937] bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: brand.color }}
                        />
                        <span className="font-medium text-gray-900">{brand.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Page Details */}
                <form onSubmit={handleCreatePage}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-8 h-8 bg-[#E31937] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">Page Details</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Page Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g., Sydney Scissor Lifts"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL Path *
                        </label>
                        <input
                          type="text"
                          name="urlPath"
                          value={formData.urlPath}
                          onChange={handleInputChange}
                          placeholder="/sydney-scissor-lifts"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Headline
                        </label>
                        <input
                          type="text"
                          name="headline"
                          value={formData.headline}
                          onChange={handleInputChange}
                          placeholder="e.g., Scissor Lift Hire in Sydney"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subheadline
                        </label>
                        <textarea
                          name="subheadline"
                          value={formData.subheadline}
                          onChange={handleInputChange}
                          placeholder="e.g., Australia's largest fleet of scissor lifts available for hire across Sydney"
                          rows={2}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CTA Button Text
                        </label>
                        <input
                          type="text"
                          name="ctaText"
                          value={formData.ctaText}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CTA Button Link
                        </label>
                        <input
                          type="text"
                          name="ctaLink"
                          value={formData.ctaLink}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Success/Error Messages - Right above Create button */}
                  {successMessage && lastCreatedPage && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-green-800 font-medium">{successMessage}</p>
                          <p className="text-green-700 text-sm mt-1">
                            <strong>{lastCreatedPage.name}</strong> created at <code className="bg-green-100 px-1 rounded">{lastCreatedPage.urlPath}</code>
                          </p>
                          <div className="flex gap-4 mt-3">
                            <a
                              href={lastCreatedPage.urlPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Preview Page
                            </a>
                            {lastCreatedPage.editUrl && (
                              <a
                                href={lastCreatedPage.editUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit in Builder.io
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => { setSuccessMessage(null); setLastCreatedPage(null); }}
                          className="text-green-500 hover:text-green-700"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-800 flex-1">{errorMessage}</p>
                        <button
                          onClick={() => setErrorMessage(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Create Button */}
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedTemplate || isCreating}
                      className="px-6 py-3 bg-[#E31937] text-white font-semibold rounded-lg hover:bg-[#c4152f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create Page
                        </>
                      )}
                    </button>
                  </div>
                </form>
                  </>
                )}
              </div>
            )}

            {activeTab === "pages" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Pages</h2>
                  <p className="text-gray-600 mt-1">Recently created pages from this admin</p>
                </div>

                {recentPages.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">No pages created yet</p>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="text-[#E31937] font-medium hover:underline"
                    >
                      Create your first page →
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Name</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">URL Path</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentPages.map((page) => (
                          <tr key={page.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-900">{page.name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{page.urlPath}</code>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: BRANDS.find(b => b.id === page.brand)?.color || "#gray" }}
                                />
                                <span className="text-sm text-gray-600">
                                  {BRANDS.find(b => b.id === page.brand)?.name || page.brand}
                                </span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(page.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <a
                                  href={page.urlPath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-500 hover:text-[#E31937] p-1"
                                  title="Preview"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </a>
                                {page.editUrl && (
                                  <a
                                    href={page.editUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-[#E31937] p-1"
                                    title="Edit in Builder.io"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Note: This list shows pages created from this admin panel. View all pages in{" "}
                  <a href="https://builder.io/content" target="_blank" rel="noopener noreferrer" className="text-[#E31937] hover:underline">
                    Builder.io
                  </a>
                </p>
              </div>
            )}

            {activeTab === "brands" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Brand Management</h2>
                <p className="text-gray-500">Brand configuration coming soon...</p>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                <p className="text-gray-500">Settings panel coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
