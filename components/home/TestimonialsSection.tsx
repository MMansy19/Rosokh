'use client';

import { useTranslations } from 'next-intl';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    key: 'ahmed',
    rating: 5,
    country: 'Egypt',
    occupation: 'Islamic Scholar'
  },
  {
    key: 'fatima',
    rating: 5,
    country: 'Malaysia',
    occupation: 'Student'
  },
  {
    key: 'mohammed',
    rating: 5,
    country: 'Saudi Arabia',
    occupation: 'Imam'
  },
  {
    key: 'aisha',
    rating: 5,
    country: 'Pakistan',
    occupation: 'Teacher'
  },
  {
    key: 'omar',
    rating: 5,
    country: 'Morocco',
    occupation: 'Engineer'
  },
  {
    key: 'khadija',
    rating: 5,
    country: 'Indonesia',
    occupation: 'Doctor'
  }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1 rtl:space-x-reverse">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < rating 
              ? 'text-accent fill-current' 
              : 'text-muted'
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const t = useTranslations('home.testimonials');

  return (
    <section className="py-20 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
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
                  {t(`items.${testimonial.key}.text`)}
                </blockquote>
                
                {/* Author Info */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse pt-4 border-t border-border">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {t(`items.${testimonial.key}.name`).charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {t(`items.${testimonial.key}.name`)}
                    </h4>
                    <p className="text-sm text-muted">
                      {t(`items.${testimonial.key}.occupation`)}, {testimonial.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">98%</div>
            <div className="text-muted">{t('stats.satisfaction')}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-accent">10k+</div>
            <div className="text-muted">{t('stats.active_users')}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-success">50+</div>
            <div className="text-muted">{t('stats.countries')}</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-16">
          <div className="card bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t('cta.title')}
            </h3>
            <p className="text-muted mb-6">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-3">
                {t('cta.join_button')}
              </button>
              <button className="btn-secondary px-8 py-3">
                {t('cta.learn_more')}
              </button>
            </div>
          </div>
        </div>

        {/* Islamic Blessing */}
        <div className="text-center pt-12 max-w-2xl mx-auto">
          <div className="arabic-text text-xl text-primary">
            {t('blessing.arabic')}
          </div>
          <div className="text-muted mt-2 italic">
            {t('blessing.translation')}
          </div>
        </div>
      </div>
    </section>
  );
}
