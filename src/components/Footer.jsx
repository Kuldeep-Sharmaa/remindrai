import React, { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [email, setEmail] = useState("");

  // Detect dark mode change
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    setIsDarkMode(document.documentElement.classList.contains("dark"));

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleNewsletterSubmit = () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (isValid) {
      alert(`Thanks for subscribing with ${email}!`);
      setEmail("");
    } else {
      alert("Please enter a valid email address.");
    }
  };

  const navigationSections = {
    Product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Dashboard", href: "/auth?redirect=/dashboard" },
    ],

    Company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Status", href: "/status" },
    ],

    Resources: [
      { name: "Help Center", href: "/contact" }, // → FAQ & help articles
      { name: "Documentation", href: "/docs" },
      { name: "Site-Map", href: "/sitemap" }, // → Technical/usage docs
    ],

    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "GDPR", href: "/gdpr" }, // → GDPR compliance info
    ],
  };

  const socialLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://twitter.com/remindrai",
      color: "#1DA1F2",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/company/remindrai",
      color: "#0077B5",
    },
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/remindrai",
      color: isDarkMode ? "#ffffff" : "#181717",
    },
  ];

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <footer
        className="relative overflow-hidden border-t bg-white dark:bg-black  border-black/5 dark:border-white/5
"
      >
        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-16 ">
          {/* Main Content Grid */}
          <div className="grid gap-12 lg:gap-16">
            {/* Top Section - Brand & Newsletter */}
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-5">
                <div className="mb-8">
                  <h2
                    className="text-2xl lg:text-3xl font-bold mb-4"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      background:
                        "linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    RemindrAI
                  </h2>
                  <p
                    className="text-base lg:text-lg leading-relaxed max-w-md"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      color: isDarkMode ? "#a3a3a3" : "#6b7280",
                    }}
                  >
                    Transform your productivity with intelligent reminders and
                    seamless workflow automation. Trusted by 50,000+
                    professionals worldwide.
                  </p>
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transform hover:-translate-y-1 transition-all duration-200 group"
                      aria-label={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon
                        className="h-5 w-5 transition-colors duration-200"
                        style={{ color: social.color }}
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter Section */}
              <div className="lg:col-span-7">
                <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800/30">
                  <h3
                    className="text-xl lg:text-2xl font-bold mb-2"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      color: isDarkMode ? "#e5e7eb" : "#1f2937",
                    }}
                  >
                    Stay ahead of the curve
                  </h3>
                  <p
                    className="text-sm lg:text-base mb-6"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      color: isDarkMode ? "#a3a3a3" : "#6b7280",
                    }}
                  >
                    Get the latest updates, productivity tips, and feature
                    releases delivered to your inbox.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                    <button
                      onClick={handleNewsletterSubmit}
                      type="button"
                      className="px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm lg:text-base whitespace-nowrap"
                      style={{
                        backgroundColor: "#8b5cf6",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      Subscribe <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {Object.entries(navigationSections).map(([title, links]) => (
                <div key={title}>
                  <h3
                    className="text-sm lg:text-base font-semibold mb-4 lg:mb-6"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      color: isDarkMode ? "#e5e7eb" : "#1f2937",
                    }}
                  >
                    {title}
                  </h3>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-sm hover:text-purple-500 transition-colors duration-200 flex items-center group"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            color: isDarkMode ? "#a3a3a3" : "#6b7280",
                          }}
                        >
                          {link.name}
                          <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-200" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact Information */}
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: isDarkMode ? "#e5e7eb" : "#1f2937",
                }}
              >
                Get in Touch
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ContactDetail
                  icon={Mail}
                  label="Email"
                  text="remindraiapp@gmial.com"
                  isDarkMode={isDarkMode}
                />
                <ContactDetail
                  icon={Phone}
                  label="Phone"
                  text="+91 (update soon)"
                  isDarkMode={isDarkMode}
                />
                <ContactDetail
                  icon={MapPin}
                  label="Location"
                  text="India"
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <p
                  className="text-sm text-center lg:text-left"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: isDarkMode ? "#a3a3a3" : "#6b7280",
                  }}
                >
                  © 2025 RemindrAI. All rights reserved. Made with ❤️ for
                  productivity enthusiasts.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-end gap-6 text-sm">
                  <h6>Enjoy</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Enhanced Contact Detail Component
const ContactDetail = ({ icon: Icon, label, text, isDarkMode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <div className="flex items-center gap-2 mb-1 sm:mb-0">
      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: "#8b5cf6" }} />
      <span
        className="text-xs font-medium"
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          color: isDarkMode ? "#e5e7eb" : "#1f2937",
        }}
      >
        {label}
      </span>
    </div>
    <span
      className="text-sm pl-6 sm:pl-0"
      style={{
        fontFamily: "Inter, sans-serif",
        color: isDarkMode ? "#a3a3a3" : "#6b7280",
      }}
    >
      {text}
    </span>
  </div>
);

export default Footer;
