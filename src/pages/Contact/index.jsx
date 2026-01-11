import React, { useState } from "react";
import { motion } from "framer-motion";
import BackgroundImage from "../../assets/images/contact.png";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", company: "", subject: "", message: "" });
  };

  return (
    <div className="bg-gray-950 text-gray-900  min-h-screen transition-colors duration-300">
      {/* 🌌 Hero Section */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        <img
          src={BackgroundImage}
          alt="Futuristic Landscape"
          className="absolute top-0 left-0 w-full h-full object-cover object-[50%_30%] brightness-110 contrast-105 z-0"
        />

        {/* Overlays */}
        <div className="absolute top-0 w-full h-full bg-gradient-to-b  via-transparent to-transparent from-gray-900/40 z-10" />
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-b from-transparent to-gray-950 z-10" />

        {/* Hero Text */}
        <div className="relative z-20 flex items-center mt-36 justify-center h-full text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 dark:bg-clip-text dark:text-transparent">
              Let’s Connect
            </h1>

            <p className="text-white dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Have a question, idea, or feedback? Reach out — we’d love to hear
              from you.
            </p>
          </motion.div>
        </div>
      </div>

      {/* 📩 Contact Form */}
      <div className="relative z-30 b-10 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto ">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 transition-colors duration-300"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-center">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
                <InputField
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
              </div>

              {/* Company & Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your company"
                />
                <SelectField
                  label="Subject *"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 transition-colors duration-300 resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

/* 🔹 Reusable Input & Select Components */
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 transition-colors duration-300"
      placeholder={placeholder}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required
      className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-colors duration-300"
    >
      <option value="">Select a subject</option>
      <option value="general">General Inquiry</option>
      <option value="support">Technical Support</option>
      <option value="sales">Sales & Pricing</option>
      <option value="partnership">Partnership</option>
      <option value="feedback">Feedback</option>
    </select>
  </div>
);
