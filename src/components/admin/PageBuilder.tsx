"use client";

import { useState } from "react";

/**
 * Simple Page Builder
 *
 * Drag-and-drop interface that creates Builder.io pages
 * with Header and Footer automatically wrapped.
 */

interface ComponentBlock {
  id: string;
  type: string;
  label: string;
  icon: string;
  props: Record<string, unknown>;
}

interface AvailableComponent {
  type: string;
  label: string;
  icon: string;
  description: string;
  defaultProps: Record<string, unknown>;
  editableProps: {
    name: string;
    label: string;
    type: "text" | "textarea" | "select" | "checkbox" | "number";
    options?: { value: string; label: string }[];
  }[];
}

const AVAILABLE_COMPONENTS: AvailableComponent[] = [
  {
    type: "Hero",
    label: "Hero Banner",
    icon: "🎯",
    description: "Full-width hero with headline and CTA",
    defaultProps: {
      headline: "Your Headline Here",
      subheadline: "Add a compelling subheadline",
      primaryCtaText: "Get a Quote",
      primaryCtaLink: "#quote-form",
      height: "large",
      overlayOpacity: 50,
    },
    editableProps: [
      { name: "headline", label: "Headline", type: "text" },
      { name: "subheadline", label: "Subheadline", type: "textarea" },
      { name: "primaryCtaText", label: "Button Text", type: "text" },
      { name: "primaryCtaLink", label: "Button Link", type: "text" },
      {
        name: "height",
        label: "Height",
        type: "select",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
    ],
  },
  {
    type: "TextBlock",
    label: "Text Content",
    icon: "📝",
    description: "Rich text content block",
    defaultProps: {
      content: "<h2>Section Title</h2><p>Add your content here...</p>",
    },
    editableProps: [
      { name: "content", label: "Content (HTML)", type: "textarea" },
    ],
  },
  {
    type: "EquipmentSearch",
    label: "Equipment Browser",
    icon: "🔍",
    description: "Searchable equipment grid with filters",
    defaultProps: {
      title: "Browse Equipment",
      showFilters: true,
      columns: "3",
      useQuickView: true,
      showHeader: true,
    },
    editableProps: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "showFilters", label: "Show Filters", type: "checkbox" },
      { name: "showHeader", label: "Show Header", type: "checkbox" },
      {
        name: "columns",
        label: "Columns",
        type: "select",
        options: [
          { value: "2", label: "2 Columns" },
          { value: "3", label: "3 Columns" },
          { value: "4", label: "4 Columns" },
        ],
      },
    ],
  },
  {
    type: "EquipmentGrid",
    label: "Equipment Grid",
    icon: "📦",
    description: "Simple equipment display grid",
    defaultProps: {
      title: "Featured Equipment",
      maxProducts: 6,
      columns: "3",
      showPricing: true,
    },
    editableProps: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "maxProducts", label: "Max Products", type: "number" },
      { name: "showPricing", label: "Show Pricing", type: "checkbox" },
    ],
  },
  {
    type: "ContactForm",
    label: "Contact Form",
    icon: "📧",
    description: "Lead capture contact form",
    defaultProps: {
      title: "Get in Touch",
      subtitle: "Fill out the form and we'll get back to you",
      showCompanyField: true,
      showMessageField: true,
      width: "medium",
    },
    editableProps: [
      { name: "title", label: "Form Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "showCompanyField", label: "Show Company Field", type: "checkbox" },
      { name: "showMessageField", label: "Show Message Field", type: "checkbox" },
      {
        name: "width",
        label: "Width",
        type: "select",
        options: [
          { value: "narrow", label: "Narrow" },
          { value: "medium", label: "Medium" },
          { value: "wide", label: "Wide" },
          { value: "full", label: "Full Width" },
        ],
      },
    ],
  },
  {
    type: "Spacer",
    label: "Spacer",
    icon: "↕️",
    description: "Add vertical spacing",
    defaultProps: {
      height: "48",
    },
    editableProps: [
      {
        name: "height",
        label: "Height (px)",
        type: "select",
        options: [
          { value: "24", label: "Small (24px)" },
          { value: "48", label: "Medium (48px)" },
          { value: "96", label: "Large (96px)" },
        ],
      },
    ],
  },
];

interface PageBuilderProps {
  brand: string;
  onSave: (blocks: ComponentBlock[], pageData: { name: string; urlPath: string }) => void;
  onCancel: () => void;
}

export function PageBuilder({ brand, onSave, onCancel }: PageBuilderProps) {
  const [blocks, setBlocks] = useState<ComponentBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [pageName, setPageName] = useState("");
  const [urlPath, setUrlPath] = useState("");
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedComponentDef = selectedBlock
    ? AVAILABLE_COMPONENTS.find((c) => c.type === selectedBlock.type)
    : null;

  const handleDragStart = (componentType: string) => {
    setDraggedComponent(componentType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();
    if (!draggedComponent) return;

    const componentDef = AVAILABLE_COMPONENTS.find((c) => c.type === draggedComponent);
    if (!componentDef) return;

    const newBlock: ComponentBlock = {
      id: `block-${Date.now()}`,
      type: componentDef.type,
      label: componentDef.label,
      icon: componentDef.icon,
      props: { ...componentDef.defaultProps },
    };

    if (insertIndex !== undefined) {
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }

    setSelectedBlockId(newBlock.id);
    setDraggedComponent(null);
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handlePropChange = (propName: string, value: unknown) => {
    if (!selectedBlockId) return;

    setBlocks(
      blocks.map((block) =>
        block.id === selectedBlockId
          ? { ...block, props: { ...block.props, [propName]: value } }
          : block
      )
    );
  };

  const handleSave = () => {
    if (!pageName || !urlPath || blocks.length === 0) {
      alert("Please add a page name, URL path, and at least one component");
      return;
    }
    onSave(blocks, { name: pageName, urlPath });
  };

  const brandColor = brand === "access-express" ? "#0A1628" : "#E31937";

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      {/* Component Palette */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Components</h3>
          <p className="text-xs text-gray-500 mt-1">Drag to add to page</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {AVAILABLE_COMPONENTS.map((component) => (
            <div
              key={component.type}
              draggable
              onDragStart={() => handleDragStart(component.type)}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab hover:border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{component.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{component.label}</p>
                  <p className="text-xs text-gray-500">{component.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Page Settings Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Page Name"
              value={pageName}
              onChange={(e) => {
                setPageName(e.target.value);
                if (!urlPath) {
                  setUrlPath("/" + e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="/url-path"
              value={urlPath}
              onChange={(e) => setUrlPath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
            />
          </div>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!pageName || !urlPath || blocks.length === 0}
            className="px-4 py-2 bg-[#E31937] text-white rounded-lg font-medium hover:bg-[#c4152f] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Page
          </button>
        </div>

        {/* Preview Area */}
        <div
          className="flex-1 overflow-y-auto p-6"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e)}
        >
          {/* Simulated Header */}
          <div
            className="rounded-t-lg p-4 text-white text-center text-sm font-medium"
            style={{ backgroundColor: brandColor }}
          >
            ↑ Header (auto-added)
          </div>

          {/* Blocks */}
          <div className="bg-white min-h-[300px] border-x border-gray-300">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p>Drag components here to build your page</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedBlockId === block.id
                        ? "bg-blue-50 ring-2 ring-blue-500 ring-inset"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{block.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{block.label}</p>
                          <p className="text-xs text-gray-500">
                            {block.type === "Hero" && (block.props.headline as string)}
                            {block.type === "TextBlock" && "Text content block"}
                            {block.type === "ContactForm" && (block.props.title as string)}
                            {block.type === "EquipmentSearch" && (block.props.title as string)}
                            {block.type === "EquipmentGrid" && (block.props.title as string)}
                            {block.type === "Spacer" && `${block.props.height}px spacing`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveBlock(block.id, "up"); }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveBlock(block.id, "down"); }}
                          disabled={index === blocks.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulated Footer */}
          <div
            className="rounded-b-lg p-4 text-white text-center text-sm font-medium"
            style={{ backgroundColor: brandColor }}
          >
            ↓ Footer (auto-added)
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Properties</h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedBlock ? `Editing: ${selectedBlock.label}` : "Select a component"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedBlock && selectedComponentDef ? (
            <div className="space-y-4">
              {selectedComponentDef.editableProps.map((prop) => (
                <div key={prop.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {prop.label}
                  </label>
                  {prop.type === "text" && (
                    <input
                      type="text"
                      value={(selectedBlock.props[prop.name] as string) || ""}
                      onChange={(e) => handlePropChange(prop.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                    />
                  )}
                  {prop.type === "textarea" && (
                    <textarea
                      value={(selectedBlock.props[prop.name] as string) || ""}
                      onChange={(e) => handlePropChange(prop.name, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                    />
                  )}
                  {prop.type === "select" && (
                    <select
                      value={(selectedBlock.props[prop.name] as string) || ""}
                      onChange={(e) => handlePropChange(prop.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                    >
                      {prop.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {prop.type === "checkbox" && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(selectedBlock.props[prop.name] as boolean) || false}
                        onChange={(e) => handlePropChange(prop.name, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#E31937] focus:ring-[#E31937]"
                      />
                      <span className="text-sm text-gray-600">Enabled</span>
                    </label>
                  )}
                  {prop.type === "number" && (
                    <input
                      type="number"
                      value={(selectedBlock.props[prop.name] as number) || 0}
                      onChange={(e) => handlePropChange(prop.name, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E31937] focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center mt-8">
              Select a component to edit its properties
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageBuilder;
