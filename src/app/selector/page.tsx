import { EquipmentSelector } from "@/components/builder/equipment";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Equipment Selector | Find the Right Equipment",
  description: "Answer a few questions to find the perfect equipment for your project. We'll recommend the best options based on your industry, task, and requirements.",
};

export default function SelectorPage() {
  return (
    <>
      <Header />
      <main>
        <EquipmentSelector
          title="Equipment Selector"
          subtitle="Answer a few questions to find the right equipment for your project"
          resultsUrl="/equipment"
          showInlineResults={true}
          inlineResultsCount={6}
          viewAllText="View All Matches"
          background="gray"
          showSkip={true}
          skipUrl="/equipment"
        />
      </main>
      <Footer />
    </>
  );
}
