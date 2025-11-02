import { useState } from 'react';
import { ArrowLeft, HelpCircle, Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Book, Video, FileText } from 'lucide-react';

interface HelpSupportProps {
  onNavigate: (page: string) => void;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export const HelpSupport = ({ onNavigate }: HelpSupportProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitMessage, setSubmitMessage] = useState('');

  const faqs: FAQ[] = [
    {
      question: 'How do I make a tax payment?',
      answer: 'To make a tax payment, navigate to the Tax Payments page, select your desired tax sector, enter the amount, and complete the payment through our secure gateway. You will receive a confirmation email once the payment is processed.',
      category: 'payments'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and bank transfers. All payments are processed securely through our encrypted payment gateway.',
      category: 'payments'
    },
    {
      question: 'How long does it take for a payment to process?',
      answer: 'Most payments are processed immediately. However, bank transfers may take 1-3 business days to reflect in your account. You can track your payment status on the Payment Verification page.',
      category: 'payments'
    },
    {
      question: 'Can I get a refund on my tax payment?',
      answer: 'Tax payment refunds are subject to government policies and regulations. Please contact our support team with your payment ID for assistance with refund requests.',
      category: 'payments'
    },
    {
      question: 'How do I create a crowdfunding campaign?',
      answer: 'Click on the Crowdfunding page, then click "Register Campaign". Fill in your campaign details including title, description, goal amount, and an optional image. Once submitted, your campaign will be live for contributors.',
      category: 'crowdfunding'
    },
    {
      question: 'Can I post updates to my campaign?',
      answer: 'Yes! After creating a campaign, you can post progress updates with images to keep your contributors informed. Click on your campaign and select "Post Update" to share news and progress.',
      category: 'crowdfunding'
    },
    {
      question: 'What are the different donation terms available?',
      answer: 'Contributors can choose from four donation options: One-time (single donation), Monthly (recurring every month), Quarterly (every 3 months), or Yearly (annual donation).',
      category: 'crowdfunding'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Go to your Profile page and click "Save Changes" after updating your information. You can update your full name and other profile details.',
      category: 'account'
    },
    {
      question: 'How do I enable auto-pay for taxes?',
      answer: 'Navigate to Settings, go to the General Settings tab, and toggle the "Enable Auto-Pay" option. This will automatically process tax payments when they are due.',
      category: 'account'
    },
    {
      question: 'Where can I view my payment history?',
      answer: 'You can view your complete payment history in two places: the Settings page under "Payment History" tab, or your Profile page under the "Payments" tab.',
      category: 'account'
    },
    {
      question: 'What should I do if a tax sector shows "Budget Full"?',
      answer: 'When a tax sector reaches its annual budget limit, it becomes unavailable for new payments. This means the sector has collected its maximum allocated amount for the current year. The budget will reset at the start of the next fiscal year.',
      category: 'technical'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use bank-level encryption and industry-standard security protocols to protect your financial data. All transactions are encrypted and your payment information is never stored on our servers.',
      category: 'technical'
    },
  ];

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'payments', label: 'Tax Payments' },
    { id: 'crowdfunding', label: 'Crowdfunding' },
    { id: 'account', label: 'Account' },
    { id: 'technical', label: 'Technical' },
  ];

  const filteredFAQs = activeCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage('Thank you for contacting us! We will respond within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitMessage(''), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-full mb-4 shadow-lg">
            <HelpCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Help & Support</h1>
          <p className="text-xl text-slate-600">Find answers to common questions or contact our support team</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Phone Support</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Mon-Fri: 9:00 AM - 6:00 PM</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1800-180-1961</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Response within 24 hours</p>
            <p className="text-lg font-semibold text-green-600 break-all">support@taxfundportal.gov</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Live Chat</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Average response: 5 minutes</p>
            <button className="text-orange-600 font-semibold hover:text-orange-700 transition">
              Start Chat →
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>

              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 transition text-left"
                    >
                      <span className="font-semibold text-slate-900">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 ml-4" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="p-4 bg-white">
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Links</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-lg transition text-left">
                  <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">User Guide</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-lg transition text-left">
                  <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Video Tutorials</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-lg transition text-left">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Download Forms</span>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Still Need Help?</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                Our support team is available to assist you with any questions or issues.
              </p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send Us a Message</h2>

          {submitMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 dark:text-green-300">
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmitContact} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="How can we help you?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Please describe your issue or question in detail..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg text-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
