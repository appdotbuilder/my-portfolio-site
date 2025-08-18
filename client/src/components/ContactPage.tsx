import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate form submission - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form on success
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get In Touch 📬
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you! Whether you have a question about our services, 
            need help with a project, or just want to say hello, we're here to help.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Let's Start a Conversation ✨
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Ready to bring your ideas to life? We're excited to learn about your project 
                  and discuss how we can help you achieve your goals.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Email Us</h3>
                    <p className="text-gray-600">hello@yourcompany.com</p>
                    <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Call Us</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Visit Us</h3>
                    <p className="text-gray-600">123 Business Ave<br />Suite 100<br />Your City, ST 12345</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Live Chat</h3>
                    <p className="text-gray-600">Available on our website</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                    <span className="text-xl">🐦</span>
                  </button>
                  <button className="bg-blue-800 text-white p-3 rounded-lg hover:bg-blue-900 transition-colors">
                    <span className="text-xl">💼</span>
                  </button>
                  <button className="bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors">
                    <span className="text-xl">🐙</span>
                  </button>
                  <button className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors">
                    <span className="text-xl">📷</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message 📝</h2>
              
              {submitStatus === 'success' && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    ✅ Thank you for your message! We'll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === 'error' && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    ❌ There was an error sending your message. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What's this about?"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your project or question..."
                    rows={5}
                    required
                    disabled={isSubmitting}
                    className="resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  size="lg"
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Message ✨'
                  )}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  We respect your privacy and will never share your information.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions 🤔
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions you might have.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                How long does a typical project take? ⏰
              </h3>
              <p className="text-gray-600">
                Project timelines vary depending on complexity and scope. Simple websites typically take 2-4 weeks, 
                while complex applications can take 2-6 months. We'll provide a detailed timeline during our consultation.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                Do you offer ongoing support? 🛠️
              </h3>
              <p className="text-gray-600">
                Yes! We provide ongoing maintenance, updates, and support packages to keep your website 
                or application running smoothly after launch.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                What's included in your services? 📋
              </h3>
              <p className="text-gray-600">
                Our full-service approach includes design, development, testing, deployment, and training. 
                We handle everything from concept to launch.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                Can you work with our existing team? 🤝
              </h3>
              <p className="text-gray-600">
                Absolutely! We love collaborating with in-house teams and can adapt our workflow 
                to complement your existing processes and tools.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}