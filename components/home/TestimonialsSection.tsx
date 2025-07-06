"use client";

import { Star, Quote } from "lucide-react";

interface TestimonialsSectionProps {
  locale: string;
  messages: any;
}

const testimonials = [
  {
    key: "ahmed",
    rating: 5,
    country: "Egypt",
    occupation: "Islamic Scholar",
  },
  {
    key: "fatima",
    rating: 5,
    country: "Malaysia",
    occupation: "Student",
  },
  {
    key: "mohammed",
    rating: 5,
    country: "Saudi Arabia",
    occupation: "Imam",
  },
  {
    key: "aisha",
    rating: 5,
    country: "Pakistan",
    occupation: "Teacher",
  },
  {
    key: "omar",
    rating: 5,
    country: "Morocco",
    occupation: "Engineer",
  },
  {
    key: "khadija",
    rating: 5,
    country: "Indonesia",
    occupation: "Doctor",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1 rtl:space-x-reverse">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < rating ? "text-accent fill-current" : "text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection({
  locale,
  messages,
}: TestimonialsSectionProps) {
  return (
    <section className="py-20 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {messages?.home?.testimonials?.title || "What Our Users Say"}
          </h2>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
            {messages?.home?.testimonials?.subtitle ||
              "Discover how Rosokh is transforming Islamic learning worldwide"}
          </p>
        </div>
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.key}
              className="card group hover:scale-105 transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Quote className="w-12 h-12 text-primary" />
              </div>

              <div className="space-y-4 relative z-10">
                {/* Rating */}
                <StarRating rating={testimonial.rating} />
                {/* Testimonial Text */}
                <blockquote className="text-muted leading-relaxed">
                  {messages?.home?.testimonials?.items?.[testimonial.key]
                    ?.text || "Great platform for Islamic learning"}
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse pt-4 border-t border-border">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-foreground font-bold text-sm">
                      {(
                        messages?.home?.testimonials?.items?.[testimonial.key]
                          ?.name || testimonial.key
                      ).charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {messages?.home?.testimonials?.items?.[testimonial.key]
                        ?.name || testimonial.key}
                    </h4>
                    <p className="text-sm text-muted">
                      {messages?.home?.testimonials?.items?.[testimonial.key]
                        ?.occupation || testimonial.occupation}
                      , {testimonial.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>{" "}
        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">98%</div>
            <div className="text-muted">
              {messages?.home?.testimonials?.stats?.satisfaction ||
                "Satisfaction Rate"}
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-accent">10k+</div>
            <div className="text-muted">
              {messages?.home?.testimonials?.stats?.active_users ||
                "Active Users"}
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-success">50+</div>
            <div className="text-muted">
              {messages?.home?.testimonials?.stats?.countries || "Countries"}
            </div>
          </div>
        </div>
        {/* Call to Action */}
        <div className="text-center pt-16">
          <div className="card bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {messages?.home?.testimonials?.cta?.title || "Join Our Community"}
            </h3>
            <p className="text-muted mb-6">
              {messages?.home?.testimonials?.cta?.description ||
                "Be part of a global community dedicated to Islamic learning"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-3">
                {messages?.home?.testimonials?.cta?.join_button || "Join Now"}
              </button>
              <button className="btn-secondary px-8 py-3">
                {messages?.home?.testimonials?.cta?.learn_more || "Learn More"}
              </button>
            </div>
          </div>
        </div>{" "}
        {/* Islamic Blessing */}
        <div className="text-center pt-12 max-w-2xl mx-auto">
          <div className="arabic-text text-xl text-primary">
            {messages?.home?.testimonials?.blessing?.arabic ||
              "بَارَكَ اللَّهُ فِيكُمْ"}
          </div>
          <div className="text-muted mt-2 italic">
            {messages?.home?.testimonials?.blessing?.translation ||
              "May Allah bless you all"}
          </div>
        </div>
      </div>
    </section>
  );
}
