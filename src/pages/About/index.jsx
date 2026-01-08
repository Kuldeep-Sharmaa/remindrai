import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Brain,
  Rocket,
  Code,
  Globe,
  Target,
  Users,
  Lightbulb,
} from "lucide-react";
import svg1 from "../../../public/assets/svg/about/SelfConfidence.svg";
import svg2 from "../../../public/assets/svg/about/innovation.svg";
import svg3 from "../../../public/assets/svg/about/Vision.svg";
import svg4 from "../../../public/assets/svg/about/Founder.svg";
import GradientButton from "../../components/Ui/GradientBtn.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const AboutUs = () => {
  return (
    <div className="min-h-screen mt-10 ">
      {/* 🚀 Hero Section */}
      <section className="relative overflow-hidden">
        {/* ✅ Content */}
        <div className="relative container mx-auto px-6 lg:px-8 pt-24 pb-32">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
            }}
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-gray-900 dark:text-white mb-8 font-grotesk">
              Building the Future of{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Intelligent Productivity.
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto font-inter">
              RemindrAI is redefining how modern professionals manage their
              workflow— automating repetitive tasks, creating intelligent
              content, and boosting your online presence effortlessly.
            </p>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img
              src={svg1}
              alt="RemindrAI Platform Illustration"
              className="w-full h-auto drop-shadow-2xl"
            />
          </motion.div>

          {/* Call to Action */}

          <motion.div
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GradientButton label="Start Your Journey" to="/Auth" />
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 lg:py-32 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-8"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Our mission is simple
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  We believe technology should amplify human potential, not
                  complicate it. RemindrAI removes the friction between
                  intention and execution, giving you the tools to maintain
                  consistent productivity without burnout.
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-500 leading-relaxed">
                  Every feature is designed with one goal: to make intelligent
                  automation accessible to professionals who demand both
                  efficiency and quality.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={svg2}
                alt="Our Mission"
                className="w-full max-w-lg mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-24 lg:py-320">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Built for performance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Advanced AI capabilities designed to integrate seamlessly into
              your workflow
            </p>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Brain className="w-7 h-7" />,
                title: "Adaptive Intelligence",
                desc: "Machine learning algorithms that understand your work patterns and optimize scheduling for maximum productivity.",
              },
              {
                icon: <Target className="w-7 h-7" />,
                title: "Content Generation",
                desc: "AI-powered writing assistant that maintains your brand voice while creating engaging, high-quality content.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="group p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 hover:shadow-lg"
                variants={fadeUp}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Designed for professionals
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              From individual creators to enterprise teams, we serve those who
              value both efficiency and excellence
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Code className="w-6 h-6" />,
                title: "Content Creators",
                desc: "Maintain consistent output across all platforms without compromising creativity",
              },
              {
                icon: <Rocket className="w-6 h-6" />,
                title: "Growing Teams",
                desc: "Scale operations efficiently while maintaining quality and brand consistency",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Enterprise Organizations",
                desc: "Orchestrate complex workflows with enterprise-grade AI automation",
              },
            ].map((user, i) => (
              <motion.div
                key={i}
                className="text-center p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
                variants={fadeUp}
                whileHover={{ y: -2 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-6">
                  {user.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {user.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {user.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 lg:py-32 ">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-8 order-2 lg:order-1"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  The future of work
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  We're building infrastructure for the next generation of
                  productivity tools. Our vision is a world where AI doesn't
                  replace human creativity—it amplifies it.
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-500 leading-relaxed">
                  Every interaction with RemindrAI is designed to feel natural,
                  intelligent, and purposeful. We're not just automating tasks;
                  we're reimagining how work gets done.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative order-1 lg:order-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={svg3}
                alt="Future Vision"
                className="w-full max-w-lg mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="relative container mx-auto px-6 lg:px-8">
          <motion.div
            className="max-w-6xl mx-auto"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Heading */}
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                A Word from the Founder
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our vision behind RemindrAI — building tools that work with you
              </p>
            </div>

            {/* Founder Card */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-10 lg:p-16 shadow-xl backdrop-blur-sm">
              <div className="grid lg:grid-cols-4 gap-10 lg:gap-14 items-center">
                {/* Left - Image */}
                <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                  <div className="relative">
                    <img
                      src={svg4}
                      alt="Founder"
                      className="w-48 lg:w-64 rounded-2xl shadow-lg relative z-10"
                    />
                  </div>
                </div>

                {/* Right - Content */}
                <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      Kuldeep Sharma
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium text-lg">
                      Founder & Developer
                    </p>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-indigo-500 pl-6">
                    "I created{" "}
                    <span className="text-primary font-semibold">
                      RemindrAI
                    </span>{" "}
                    to help professionals reclaim their time. Tools should
                    empower you — not drain your energy. Every feature we build
                    is designed to remove friction and
                    <span className="font-semibold text-secondary">
                      {" "}
                      let you focus on what truly matters.
                    </span>
                    "
                  </blockquote>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 ">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <motion.div
            className="max-w-4xl mx-auto space-y-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold dark:text-white leading-tight">
              Experience intelligent productivity
            </h2>
            <p className="text-xl dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Join professionals who've transformed their workflow with
              AI-powered automation
            </p>

            <div className="pt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GradientButton label="See How It Works" to="/Auth" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
