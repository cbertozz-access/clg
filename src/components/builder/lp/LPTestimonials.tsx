"use client";

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company?: string;
  avatarUrl?: string;
}

export interface LPTestimonialsProps {
  sectionTitle?: string;
  testimonials?: Testimonial[];
  variant?: "grid" | "single";
}

function StarRating() {
  return (
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const defaultTestimonials: Testimonial[] = [
  {
    quote: "Access Hire has been our go-to equipment provider for over 5 years. Professional, reliable, and always have what we need.",
    name: "John Mitchell",
    title: "Project Manager",
  },
  {
    quote: "Quick response, competitive pricing, and the equipment was delivered on time. Exactly what we needed for our warehouse expansion.",
    name: "Sarah Chen",
    title: "Operations Director",
  },
  {
    quote: "The team really understands mining site requirements. Safety-focused and always deliver quality equipment that meets our standards.",
    name: "Mike Thompson",
    title: "Site Supervisor",
  },
];

export function LPTestimonials(props: Partial<LPTestimonialsProps>) {
  const sectionTitle = props.sectionTitle || "What Our Customers Say";
  const testimonials = props.testimonials?.length ? props.testimonials : defaultTestimonials;
  const variant = props.variant || "grid";
  if (variant === "single" && testimonials.length > 0) {
    const testimonial = testimonials[0];
    return (
      <section className="py-12 bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex justify-center">
              <StarRating />
            </div>
            <blockquote className="text-xl text-white mb-6 leading-relaxed">
              "{testimonial.quote}"
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              {testimonial.avatarUrl ? (
                <img
                  src={testimonial.avatarUrl}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-white/20 rounded-full" />
              )}
              <div className="text-left">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-gray-400 text-sm">
                  {testimonial.title}
                  {testimonial.company && `, ${testimonial.company}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        {sectionTitle && (
          <h2 className="text-3xl font-bold text-[#1A1A1A] text-center mb-12">
            {sectionTitle}
          </h2>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white border rounded-xl p-6">
              <StarRating />
              <p className="text-[#6B7280] mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                {testimonial.avatarUrl ? (
                  <img
                    src={testimonial.avatarUrl}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[#F3F4F6] rounded-full" />
                )}
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">{testimonial.name}</p>
                  <p className="text-[#6B7280] text-xs">
                    {testimonial.title}
                    {testimonial.company && `, ${testimonial.company}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
