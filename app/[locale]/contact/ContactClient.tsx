"use client";

import { useState } from "react";

interface ContactClientProps {
  locale: string;
  messages: any;
}

export default function ContactClient({
  locale,
  messages,
}: ContactClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general",
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: "📧",
      title: messages?.contact?.email || "Email",
      description: messages?.contact?.emailDesc || "Send us an email",
      value: "contact@rosokh.com",
      action: "mailto:contact@rosokh.com",
    },
    {
      icon: "💬",
      title: messages?.contact?.telegram || "Telegram",
      description: messages?.contact?.telegramDesc || "Join our community",
      value: "@rosokh_support",
      action: "https://t.me/rosokh_support",
    },
    {
      icon: "🐦",
      title: messages?.contact?.twitter || "Twitter",
      description: messages?.contact?.twitterDesc || "Follow us for updates",
      value: "@rosokh_app",
      action: "https://twitter.com/rosokh_app",
    },
    {
      icon: "📱",
      title: messages?.contact?.whatsapp || "WhatsApp",
      description: messages?.contact?.whatsappDesc || "Quick support",
      value: "+1 (555) 123-4567",
      action: "https://wa.me/15551234567",
    },
  ];

  const faqItems = [
    {
      question:
        messages?.contact?.faq?.q1 ||
        "How do I track my Quran reading progress?",
      answer:
        messages?.contact?.faq?.a1 ||
        "Use the Khatma feature to set reading goals and track your progress. You can log your daily reading sessions and view detailed analytics.",
    },
    {
      question: messages?.contact?.faq?.q2 || "Can I use the app offline?",
      answer:
        messages?.contact?.faq?.a2 ||
        "Yes, the Quran text is available offline. However, features like prayer times and audio require an internet connection.",
    },
    {
      question:
        messages?.contact?.faq?.q3 || "How accurate are the prayer times?",
      answer:
        messages?.contact?.faq?.a3 ||
        "Prayer times are calculated based on your location and are generally accurate within a few minutes. You can adjust them in settings if needed.",
    },
    {
      question:
        messages?.contact?.faq?.q4 ||
        "Is the app available in multiple languages?",
      answer:
        messages?.contact?.faq?.a4 ||
        "Yes, Rosokh supports Arabic, English, and Russian languages. You can switch languages in the settings.",
    },
    {
      question:
        messages?.contact?.faq?.q5 ||
        "How do I report a bug or suggest a feature?",
      answer:
        messages?.contact?.faq?.a5 ||
        "You can use the contact form below or reach out to us through any of our contact methods. We appreciate all feedback!",
    },
  ];
  if (isSubmitted) {
    return (
      <div className="min-h-screen text-foreground transition-colors duration-300 flex items-center justify-center">
        <div className="text-center bg-surface text-foreground rounded-lg shadow-lg p-8 max-w-md mx-4 border border-border">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {messages?.contact?.thankYou || "Thank You!"}
          </h2>
          <p className="text-muted">
            {messages?.contact?.messageReceived ||
              "Your message has been received. We'll get back to you soon."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {messages?.contact?.title || "Contact Us"}
          </h1>
          <div className="text-4xl mb-4">📞</div>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {messages?.contact?.description ||
              "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
          {/* Contact Form */}
          <div className="card group rounded-lg shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {messages?.contact?.sendMessage || "Send us a Message"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-islamic-700 mb-2">
                    {messages?.contact?.name || "Name"} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent"
                    placeholder={
                      messages?.contact?.namePlaceholder || "Your full name"
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-islamic-700 mb-2">
                    {messages?.contact?.email || "Email"} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent"
                    placeholder={
                      messages?.contact?.emailPlaceholder ||
                      "your.email@example.com"
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-islamic-700 mb-2">
                  {messages?.contact?.category || "Category"}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent"
                >
                  <option value="general">
                    {messages?.contact?.categories?.general ||
                      "General Inquiry"}
                  </option>
                  <option value="technical">
                    {messages?.contact?.categories?.technical ||
                      "Technical Support"}
                  </option>
                  <option value="feature">
                    {messages?.contact?.categories?.feature ||
                      "Feature Request"}
                  </option>
                  <option value="bug">
                    {messages?.contact?.categories?.bug || "Bug Report"}
                  </option>
                  <option value="feedback">
                    {messages?.contact?.categories?.feedback || "Feedback"}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-islamic-700 mb-2">
                  {messages?.contact?.subject || "Subject"} *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent"
                  placeholder={
                    messages?.contact?.subjectPlaceholder ||
                    "Brief description of your message"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-islamic-700 mb-2">
                  {messages?.contact?.message || "Message"} *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 focus:border-transparent resize-none"
                  placeholder={
                    messages?.contact?.messagePlaceholder ||
                    "Please provide as much detail as possible..."
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-surface hover:bg-buttonHover active:bg-buttonActive text-foreground py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {messages?.contact?.sending || "Sending..."}
                  </div>
                ) : (
                  messages?.contact?.sendMessage || "Send Message"
                )}
              </button>
            </form>
          </div>
          {/* Support Hours */}
          <div className="card group rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">
              {messages?.contact?.supportHours || "Support Hours"}
            </h3>
            <div className="space-y-2 text-sm opacity-90">
              <p>
                📞 {messages?.contact?.phoneSupport || "Phone Support"}: 9 AM
                - 6 PM (UTC)
              </p>
              <p>
                💬 {messages?.contact?.chatSupport || "Chat Support"}: 24/7
              </p>
              <p>
                📧 {messages?.contact?.emailResponse || "Email Response"}:{" "}
                {messages?.contact?.within24h || "Within 24 hours"}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <p className="text-sm opacity-75">
                {messages?.contact?.quickResponse ||
                  "For the quickest response, please use our contact form or reach out via Telegram."}
              </p>
            </div>
          </div>
        </div>

          {/* Contact Information & FAQ */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="card group rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">
                {messages?.contact?.otherWays || "Other Ways to Reach Us"}
              </h3>

              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <a
                    key={index}
                    href={method.action}
                    className="flex items-center gap-4 p-4 bg-surface hover:bg-buttonHover active:bg-buttonActive text-foreground rounded-lg transition-colors duration-200"
                  >
                    <div className="text-2xl">{method.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {method.title}
                      </h4>
                      <p className="text-sm text-islamic-600">
                        {method.description}
                      </p>
                      <p className="text-sm text-islamic-500 font-mono">
                        {method.value}
                      </p>
                    </div>
                    <div className="text-islamic-400">
                      →
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="card group rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">
                {messages?.contact?.faq?.title || "Frequently Asked Questions"}
              </h3>

              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <details key={index} className="group">
                    <summary className="flex justify-between items-center cursor-pointer p-3 bg-surface hover:bg-buttonHover active:bg-buttonActive text-foreground rounded-lg transition-colors duration-200">
                      <span className="font-medium">
                        {item.question}
                      </span>
                      <span className="text-islamic-500 group-open:rotate-180 transition-transform duration-200">
                        ↓
                      </span>
                    </summary>
                    <div className="p-3 text-islamic-600 text-sm">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
