'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general'
    });

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const contactMethods = [
    {
      icon: '📧',
      title: t('email'),
      content: 'info@rosokh.com',
      description: t('emailDescription')
    },
    {
      icon: '💬',
      title: t('telegram'),
      content: '@RosokhSupport',
      description: t('telegramDescription')
    },
    {
      icon: '🌐',
      title: t('website'),
      content: 'www.rosokh.com',
      description: t('websiteDescription')
    },
    {
      icon: '📱',
      title: t('whatsapp'),
      content: '+966 50 123 4567',
      description: t('whatsappDescription')
    }
  ];

  const faqItems = [
    {
      question: t('faq1Question'),
      answer: t('faq1Answer')
    },
    {
      question: t('faq2Question'),
      answer: t('faq2Answer')
    },
    {
      question: t('faq3Question'),
      answer: t('faq3Answer')
    },
    {
      question: t('faq4Question'),
      answer: t('faq4Answer')
    },
    {
      question: t('faq5Question'),
      answer: t('faq5Answer')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 dark:from-gray-900 dark:to-islamic-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
            {t('title')}
          </h1>
          <div className="text-4xl mb-4">📞</div>
          <p className="text-lg text-islamic-700 dark:text-islamic-300 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-islamic-800 dark:text-islamic-200 mb-6">
              {t('sendMessage')}
            </h2>

            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xl mr-2">✅</span>
                  <span>{t('messageSent')}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-2">
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={t('enterName')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-2">
                    {t('email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={t('enterEmail')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-2">
                  {t('category')}
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">{t('general')}</option>
                  <option value="technical">{t('technical')}</option>
                  <option value="feature">{t('featureRequest')}</option>
                  <option value="bug">{t('bugReport')}</option>
                  <option value="feedback">{t('feedback')}</option>
                  <option value="content">{t('content')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-2">
                  {t('subject')} *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={t('enterSubject')}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-2">
                  {t('message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={t('enterMessage')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-islamic-500 text-white rounded-lg hover:bg-islamic-600 focus:ring-2 focus:ring-islamic-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {t('sending')}
                  </span>
                ) : (
                  t('sendMessage')
                )}
              </button>
            </form>
          </div>

          {/* Contact Information and FAQ */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-islamic-800 dark:text-islamic-200 mb-6">
                {t('getInTouch')}
              </h2>

              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="text-2xl">{method.icon}</div>
                    <div>
                      <h3 className="font-semibold text-islamic-800 dark:text-islamic-200">
                        {method.title}
                      </h3>
                      <p className="text-islamic-600 dark:text-islamic-300 font-medium">
                        {method.content}
                      </p>
                      <p className="text-sm text-islamic-500 dark:text-islamic-400 mt-1">
                        {method.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {t('supportHours')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-islamic-700 dark:text-islamic-300">{t('sunday')} - {t('thursday')}</span>
                  <span className="text-islamic-600 dark:text-islamic-400">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-islamic-700 dark:text-islamic-300">{t('friday')}</span>
                  <span className="text-islamic-600 dark:text-islamic-400">2:00 PM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-islamic-700 dark:text-islamic-300">{t('saturday')}</span>
                  <span className="text-islamic-600 dark:text-islamic-400">{t('closed')}</span>
                </div>
              </div>
              <p className="text-sm text-islamic-500 dark:text-islamic-400 mt-4">
                {t('timeZone')}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-islamic-800 dark:text-islamic-200 mb-8 text-center">
              {t('frequentlyAsked')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqItems.map((faq, index) => (
                <div key={index} className="p-6 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-islamic-800 dark:text-islamic-200 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-islamic-600 dark:text-islamic-400 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-6">
            {t('followUs')}
          </h3>
          <div className="flex justify-center space-x-6">
            <a
              href="#"
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
              aria-label="Facebook"
            >
              <span className="text-xl">📘</span>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-200"
              aria-label="Twitter"
            >
              <span className="text-xl">🐦</span>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors duration-200"
              aria-label="Instagram"
            >
              <span className="text-xl">📷</span>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
              aria-label="Telegram"
            >
              <span className="text-xl">✈️</span>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200"
              aria-label="YouTube"
            >
              <span className="text-xl">📺</span>
            </a>
          </div>
        </div>

        {/* Islamic Quote */}
        <div className="mt-12 bg-gradient-to-br from-islamic-500 to-tosca-500 text-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-3xl font-amiri mb-4">
            وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ
          </div>
          <p className="text-lg opacity-90 mb-2">
            "And We have not sent you, [O Muhammad], except as a mercy to the worlds."
          </p>
          <p className="text-sm opacity-75">Quran 21:107</p>
        </div>
      </div>
    </div>
  );
}
