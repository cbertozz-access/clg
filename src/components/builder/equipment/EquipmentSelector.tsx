"use client";

import React, { useState, useEffect } from "react";
import { EquipmentCard } from "./EquipmentCard";
import { searchProducts, mapAlgoliaToEquipment } from "@/lib/api/algolia";
import { useEnquiryCart } from "@/lib/enquiry-cart";

/**
 * Product Selector Wizard
 *
 * A multi-step questionnaire that guides users to recommended products
 * based on their industry, task, environment, and preferences.
 * Results load dynamically as users progress through steps.
 */

interface Step {
  id: string;
  question: string;
  subtitle: string;
  options: { id: string; label: string; icon?: string; description?: string }[];
  multiple?: boolean;
}

interface Answers {
  industry?: string;
  task?: string;
  height?: string;
  environment?: string;
  power?: string;
  duration?: string;
}

interface Equipment {
  id: string;
  objectId: string;
  name: string;
  model: string;
  brand: string;
  category: string;
  subcategory?: string;
  slug: string;
  imageUrl?: string;
  images: string[];
  specs: {
    workingHeight?: string;
    horizontalReach?: string;
    capacity?: string;
  };
  energySource?: string;
  isHire: boolean;
  isSale: boolean;
  isUsed: boolean;
  isInStock: boolean;
}

const ALL_STEPS: Step[] = [
  {
    id: "industry",
    question: "What industry are you in?",
    subtitle: "This helps us recommend equipment suited to your sector.",
    options: [
      { id: "construction", label: "Construction", icon: "building" },
      { id: "mining", label: "Mining", icon: "pickaxe" },
      { id: "manufacturing", label: "Manufacturing", icon: "factory" },
      { id: "events", label: "Events", icon: "calendar" },
      { id: "warehousing", label: "Warehousing", icon: "warehouse" },
      { id: "agriculture", label: "Agriculture", icon: "tractor" },
      { id: "infrastructure", label: "Infrastructure", icon: "road" },
      { id: "maintenance", label: "Maintenance", icon: "wrench" },
    ],
  },
  {
    id: "task",
    question: "What do you need to do?",
    subtitle: "Select the primary task for your equipment.",
    options: [
      { id: "elevate-people", label: "Elevate People", description: "Work at height safely" },
      { id: "lift-materials", label: "Lift Materials", description: "Move heavy loads" },
      { id: "reach-high", label: "Reach High Areas", description: "Access elevated spaces" },
      { id: "move-goods", label: "Move Goods", description: "Transport materials on-site" },
      { id: "generate-power", label: "Generate Power", description: "Portable electricity" },
      { id: "site-lighting", label: "Site Lighting", description: "Illuminate work areas" },
    ],
  },
  {
    id: "height",
    question: "What working height do you need?",
    subtitle: "Select the approximate height you need to reach.",
    options: [
      { id: "under-6m", label: "Under 6m", description: "Ground level & low access" },
      { id: "6-12m", label: "6-12m", description: "Single-story buildings" },
      { id: "12-20m", label: "12-20m", description: "Multi-story access" },
      { id: "20-30m", label: "20-30m", description: "High-rise work" },
      { id: "over-30m", label: "Over 30m", description: "Extreme height access" },
    ],
  },
  {
    id: "environment",
    question: "Where will you be working?",
    subtitle: "This affects equipment type and power source.",
    options: [
      { id: "indoor", label: "Indoors Only", description: "Warehouses, factories, showrooms" },
      { id: "outdoor", label: "Outdoors Only", description: "Construction sites, farms" },
      { id: "both", label: "Both Indoor & Outdoor", description: "Mixed environment work" },
      { id: "rough-terrain", label: "Rough Terrain", description: "Uneven ground, slopes" },
    ],
  },
  {
    id: "power",
    question: "Power preference?",
    subtitle: "Choose based on your site requirements.",
    options: [
      { id: "electric", label: "Electric", description: "Zero emissions, quiet operation" },
      { id: "diesel", label: "Diesel", description: "Maximum power, outdoor use" },
      { id: "hybrid", label: "Hybrid", description: "Versatile indoor/outdoor" },
      { id: "no-preference", label: "No Preference", description: "Show all options" },
    ],
  },
  {
    id: "duration",
    question: "How long do you need it?",
    subtitle: "This helps us provide the best rates.",
    options: [
      { id: "daily", label: "Daily", description: "1-3 days" },
      { id: "weekly", label: "Weekly", description: "1-4 weeks" },
      { id: "monthly", label: "Monthly", description: "1-6 months" },
      { id: "long-term", label: "Long Term", description: "6+ months" },
      { id: "purchase", label: "Looking to Buy", description: "Purchase equipment" },
    ],
  },
];

// Determine which steps are relevant based on current answers
function getRelevantSteps(answers: Answers): Step[] {
  return ALL_STEPS.filter((step) => {
    // Height question: only relevant for tasks involving elevation
    if (step.id === "height") {
      const heightRelevantTasks = ["elevate-people", "lift-materials", "reach-high"];
      return !answers.task || heightRelevantTasks.includes(answers.task);
    }

    // Environment question: skip for generators and lighting (they work anywhere)
    if (step.id === "environment") {
      const skipEnvironmentTasks = ["generate-power", "site-lighting"];
      return !answers.task || !skipEnvironmentTasks.includes(answers.task);
    }

    // Power preference: skip for generators/lighting (they ARE the power source)
    if (step.id === "power") {
      const skipPowerTasks = ["generate-power", "site-lighting"];
      return !answers.task || !skipPowerTasks.includes(answers.task);
    }

    return true;
  });
}

// Map answers to Algolia category keys (matching actual index values)
function getRecommendedCategories(answers: Answers): string[] {
  const categories: string[] = [];

  switch (answers.task) {
    case "elevate-people":
      if (answers.height === "under-6m" || answers.height === "6-12m") {
        categories.push("Scissor Lift");
      }
      if (answers.height === "12-20m" || answers.height === "20-30m" || answers.height === "over-30m") {
        categories.push("Boom Lift");
      }
      if (answers.environment === "indoor") {
        categories.push("Man Lift", "Scissor Lift");
      }
      if (categories.length === 0) {
        categories.push("Scissor Lift", "Boom Lift", "Man Lift");
      }
      break;
    case "lift-materials":
      categories.push("Forklift", "Telehandler");
      break;
    case "reach-high":
      categories.push("Boom Lift", "Telehandler");
      break;
    case "move-goods":
      categories.push("Forklift");
      break;
    case "generate-power":
      categories.push("Generator");
      break;
    case "site-lighting":
      categories.push("Lighting Tower");
      break;
    default:
      // Default categories if nothing selected
      categories.push("Scissor Lift", "Boom Lift", "Forklift");
  }

  return [...new Set(categories)]; // Remove duplicates
}

// Map answers to power source filter
function getPowerFilter(answers: Answers): string | undefined {
  switch (answers.power) {
    case "electric":
      return "Electric";
    case "diesel":
      return "Diesel";
    case "hybrid":
      return "Hybrid";
    default:
      return undefined;
  }
}

export interface EquipmentSelectorProps {
  /** Title shown at the top */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** @deprecated Use title instead */
  heading?: string;
  /** URL to redirect after completion (with query params) */
  resultsUrl?: string;
  /** Show results inline instead of redirecting */
  showInlineResults?: boolean;
  /** Number of results to show inline */
  inlineResultsCount?: number;
  /** CTA text for viewing all results */
  viewAllText?: string;
  /** Background color variant */
  background?: "white" | "gray";
  /** Show skip button */
  showSkip?: boolean;
  /** Skip button URL */
  skipUrl?: string;
}

export function EquipmentSelector({
  title = "Product Selector",
  subtitle = "Answer a few questions to find the right equipment for your project",
  resultsUrl = "/equipment",
  showInlineResults = true,
  inlineResultsCount = 12,
  viewAllText = "View All Matches",
  background = "white",
  showSkip = true,
  skipUrl = "/equipment",
}: EquipmentSelectorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isComplete, setIsComplete] = useState(false);
  const [recommendations, setRecommendations] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const [displayCount, setDisplayCount] = useState(6);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Enquiry cart
  const { addItem, removeItem, isInCart } = useEnquiryCart();

  // Add to cart and track to Firebase
  const handleAddToCart = (equipment: Equipment) => {
    const item = {
      id: equipment.id,
      name: equipment.name,
      brand: equipment.brand,
      category: equipment.category,
      imageUrl: equipment.imageUrl,
    };

    if (isInCart(equipment.id)) {
      removeItem(equipment.id);
    } else {
      addItem(item);

      // Track to Firebase for personalization
      if (typeof window !== "undefined" && (window as unknown as { CLGVisitor?: { track: (event: string, data: Record<string, unknown>) => void } }).CLGVisitor) {
        const CLGVisitor = (window as unknown as { CLGVisitor: { track: (event: string, data: Record<string, unknown>) => void } }).CLGVisitor;
        CLGVisitor.track("add_to_enquiry_cart", {
          product_id: equipment.id,
          product_name: equipment.name,
          brand: equipment.brand,
          category: equipment.category,
          source: "product_selector",
          added_at: new Date().toISOString(),
        });
        console.log("[ProductSelector] Tracked add to cart:", equipment.name);
      }
    }
  };

  // Get relevant steps based on current answers (filters out irrelevant questions)
  const steps = getRelevantSteps(answers);
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSelect = (optionId: string) => {
    const newAnswers = {
      ...answers,
      [step.id]: optionId,
    };
    setAnswers(newAnswers);

    // Calculate relevant steps with new answers to determine next step
    const newRelevantSteps = getRelevantSteps(newAnswers);
    const currentStepIndex = newRelevantSteps.findIndex((s) => s.id === step.id);

    // Auto-advance to next step or complete on final step
    setTimeout(() => {
      if (currentStepIndex < newRelevantSteps.length - 1) {
        setCurrentStep(currentStepIndex + 1);
      } else {
        // Final step reached
        setIsComplete(true);
      }
    }, 400); // Delay for visual feedback and state update
  };

  // Store latest answers in ref for use in async operations
  const answersRef = React.useRef(answers);
  React.useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Track selector completion to Firebase/Firestore for personalization
  const trackSelectorCompletion = (
    selectorAnswers: Answers,
    recommendedCategories: string[],
    matchCount: number
  ) => {
    // Use CLGVisitor SDK if available (loaded via clg-visitor.js)
    if (typeof window !== "undefined" && (window as unknown as { CLGVisitor?: { track: (event: string, data: Record<string, unknown>) => void } }).CLGVisitor) {
      const CLGVisitor = (window as unknown as { CLGVisitor: { track: (event: string, data: Record<string, unknown>) => void } }).CLGVisitor;
      CLGVisitor.track("product_selector_complete", {
        // Selector answers
        industry: selectorAnswers.industry,
        task: selectorAnswers.task,
        height: selectorAnswers.height,
        environment: selectorAnswers.environment,
        power: selectorAnswers.power,
        duration: selectorAnswers.duration,
        // Derived data
        recommended_categories: recommendedCategories,
        match_count: matchCount,
        // Metadata
        completed_at: new Date().toISOString(),
      });
      console.log("[ProductSelector] Tracked completion to Firebase:", selectorAnswers);
    }
  };

  // Fetch recommendations when complete
  useEffect(() => {
    if (!isComplete) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Use ref to get most current answers
        const currentAnswers = answersRef.current;
        const categories = getRecommendedCategories(currentAnswers);
        const powerFilter = getPowerFilter(currentAnswers);

        console.log("[ProductSelector] Filtering for categories:", categories);
        console.log("[ProductSelector] Answers:", currentAnswers);
        console.log("[ProductSelector] Task selected:", currentAnswers.task);

        // Search Algolia with category filter
        const result = await searchProducts({
          page: 0,
          hitsPerPage: 100,
          filters: {},
        });

        let filtered = result.hits.map(mapAlgoliaToEquipment);
        console.log("[ProductSelector] Total products from API:", filtered.length);

        // Filter by recommended categories (exact match, case-insensitive)
        if (categories.length > 0) {
          filtered = filtered.filter((item) =>
            categories.some((cat) =>
              item.category?.toLowerCase() === cat.toLowerCase()
            )
          );
          console.log("[ProductSelector] After category filter:", filtered.length);
        }

        // Filter by power source if specified
        if (powerFilter) {
          const powerFiltered = filtered.filter(
            (item) =>
              item.energySource?.toLowerCase() === powerFilter.toLowerCase()
          );
          // Only apply power filter if it doesn't eliminate all results
          if (powerFiltered.length > 0) {
            filtered = powerFiltered;
          }
        }

        // Filter by environment for indoor
        if (currentAnswers.environment === "indoor") {
          const indoorFiltered = filtered.filter(
            (item) =>
              item.energySource?.toLowerCase() === "electric" ||
              item.energySource?.toLowerCase() === "hybrid"
          );
          // Only apply if it doesn't eliminate all results
          if (indoorFiltered.length > 0) {
            filtered = indoorFiltered;
          }
        }

        setTotalMatches(filtered.length);
        setRecommendations(filtered);

        // Track selector completion to Firebase for personalization
        trackSelectorCompletion(currentAnswers, categories, filtered.length);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isComplete, answers]);

  // Build query params for results URL
  const buildResultsUrl = () => {
    const params = new URLSearchParams();
    const categories = getRecommendedCategories(answers);
    if (categories.length > 0) {
      params.set("category", categories.join(","));
    }
    const power = getPowerFilter(answers);
    if (power) {
      params.set("power", power);
    }
    return `${resultsUrl}?${params.toString()}`;
  };

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 6, recommendations.length));
  };

  // Icon component
  const Icon = ({ name }: { name: string }) => {
    const icons: Record<string, React.ReactNode> = {
      building: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      pickaxe: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      factory: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V9l6 4V9l6 4V9l6 4v12H3z" />
        </svg>
      ),
      calendar: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      warehouse: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3zm3 6h12m-12 4h12m-12 4h6" />
        </svg>
      ),
      tractor: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      road: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      wrench: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    return icons[name] || icons.wrench;
  };

  const bgClass = background === "gray" ? "bg-gray-50" : "bg-white";

  // Results view - shown after completion
  if (isComplete) {
    const displayedProducts = recommendations.slice(0, displayCount);
    const hasMore = displayCount < recommendations.length;

    return (
      <section className={`${bgClass} py-8 md:py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Selection Complete
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {loading ? "Finding matches..." : `We Found ${totalMatches} Matches`}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Based on your selections, here are our top recommendations
            </p>
          </div>

          {/* Summary of selections */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
            {Object.entries(answers).map(([key, value]) => {
              const stepDef = ALL_STEPS.find((s) => s.id === key);
              const option = stepDef?.options.find((o) => o.id === value);
              return option ? (
                <span
                  key={key}
                  className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
                >
                  {option.label}
                </span>
              ) : null;
            })}
            <button
              type="button"
              onClick={() => {
                setIsComplete(false);
                setCurrentStep(0);
                setAnswers({});
                setDisplayCount(6);
              }}
              className="px-2 sm:px-3 py-1 text-[var(--color-primary,#e31937)] hover:bg-red-50 rounded-full text-xs sm:text-sm font-medium"
            >
              Start Over
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[var(--color-primary,#e31937)]" />
            </div>
          )}

          {/* Results Grid */}
          {!loading && showInlineResults && displayedProducts.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {displayedProducts.map((item) => (
                  <EquipmentCard
                    key={item.objectId}
                    id={item.id}
                    imageUrl={item.imageUrl}
                    brand={item.brand}
                    model={item.model}
                    name={item.name}
                    category={item.category}
                    spec1={
                      item.specs.workingHeight
                        ? `Working Height: ${item.specs.workingHeight}`
                        : item.specs.capacity
                        ? `Capacity: ${item.specs.capacity}`
                        : ""
                    }
                    spec2={
                      item.specs.horizontalReach
                        ? `Reach: ${item.specs.horizontalReach}`
                        : ""
                    }
                    ctaText="View Details"
                    onQuickView={() => setSelectedEquipment(item)}
                  />
                ))}
              </div>

              {/* Load More / View All */}
              <div className="text-center space-y-3">
                {hasMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    className="px-6 py-2.5 font-medium border-2 border-[var(--color-primary,#e31937)] text-[var(--color-primary,#e31937)] rounded-lg hover:bg-[var(--color-primary,#e31937)] hover:text-white transition-colors"
                  >
                    Load More ({recommendations.length - displayCount} remaining)
                  </button>
                )}

                {totalMatches > displayCount && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setDisplayCount(recommendations.length)}
                      className="inline-flex items-center gap-2 text-[var(--color-primary,#e31937)] hover:underline font-medium text-sm"
                    >
                      {viewAllText} ({recommendations.length - displayCount} more)
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* No Results */}
          {!loading && recommendations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No exact matches found. Try adjusting your selections.</p>
              <button
                type="button"
                onClick={() => {
                  setIsComplete(false);
                  setCurrentStep(0);
                  setAnswers({});
                  setDisplayCount(6);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary,#e31937)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover,#c42920)] transition-colors"
              >
                Start Over
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Quick View Modal */}
        {selectedEquipment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedEquipment(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEquipment.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedEquipment(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Image */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                  {selectedEquipment.imageUrl ? (
                    <img
                      src={selectedEquipment.imageUrl}
                      alt={selectedEquipment.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedEquipment.brand && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {selectedEquipment.brand}
                      </span>
                    )}
                    {selectedEquipment.category && (
                      <span className="px-3 py-1 bg-[var(--color-primary,#e31937)]/10 text-[var(--color-primary,#e31937)] rounded-full text-sm font-medium">
                        {selectedEquipment.category}
                      </span>
                    )}
                    {selectedEquipment.energySource && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {selectedEquipment.energySource}
                      </span>
                    )}
                  </div>

                  {selectedEquipment.model && (
                    <p className="text-gray-600">
                      <span className="font-medium">Model:</span> {selectedEquipment.model}
                    </p>
                  )}

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                    {selectedEquipment.specs.workingHeight && (
                      <div>
                        <p className="text-sm text-gray-500">Working Height</p>
                        <p className="font-semibold text-gray-900">{selectedEquipment.specs.workingHeight}</p>
                      </div>
                    )}
                    {selectedEquipment.specs.horizontalReach && (
                      <div>
                        <p className="text-sm text-gray-500">Horizontal Reach</p>
                        <p className="font-semibold text-gray-900">{selectedEquipment.specs.horizontalReach}</p>
                      </div>
                    )}
                    {selectedEquipment.specs.capacity && (
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-semibold text-gray-900">{selectedEquipment.specs.capacity}</p>
                      </div>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedEquipment.isInStock ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-600">
                      {selectedEquipment.isInStock ? 'Available for hire' : 'Check availability'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedEquipment(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(selectedEquipment);
                      setSelectedEquipment(null);
                    }}
                    className={`flex-1 px-4 py-3 font-medium rounded-lg transition-colors text-center flex items-center justify-center gap-2 ${
                      isInCart(selectedEquipment.id)
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-[var(--color-primary,#e31937)] text-white hover:bg-[var(--color-primary-hover,#c42920)]"
                    }`}
                  >
                    {isInCart(selectedEquipment.id) ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Added to Enquiry
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add to Enquiry
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Wizard view
  return (
    <section className={`${bgClass} min-h-[500px] md:min-h-[600px] py-8 md:py-12`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            {showSkip && (
              <a
                href={skipUrl}
                className="text-xs sm:text-sm text-[var(--color-primary,#e31937)] hover:underline"
              >
                Skip to browse
              </a>
            )}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary,#e31937)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
            {step.question}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">{step.subtitle}</p>

          {/* Options Grid - responsive columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {step.options.map((option) => {
              const isSelected = answers[step.id as keyof Answers] === option.id;
              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-[var(--color-primary,#e31937)] bg-red-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {option.icon && (
                    <div
                      className={`mb-1 sm:mb-2 ${
                        isSelected
                          ? "text-[var(--color-primary,#e31937)]"
                          : "text-gray-400"
                      }`}
                    >
                      <Icon name={option.icon} />
                    </div>
                  )}
                  <div
                    className={`font-medium text-sm sm:text-base ${
                      isSelected ? "text-[var(--color-primary,#e31937)]" : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                      {option.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation - Back button only, selection auto-advances */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-lg transition-colors text-sm sm:text-base ${
              currentStep === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <span className="text-xs sm:text-sm text-gray-400">
            Select an option to continue
          </span>
        </div>
      </div>
    </section>
  );
}

export default EquipmentSelector;
