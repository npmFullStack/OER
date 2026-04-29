// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Users,
  Target,
  Heart,
  Award,
  Clock,
  Shield,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const About = () => {
  const stats = [
    { number: "500+", label: "eBooks Available", icon: BookOpen },
    { number: "3,000+", label: "Physical Books", icon: BookOpen },
    { number: "6", label: "Academic Programs", icon: GraduationCap },
    { number: "200+", label: "Student Research", icon: GraduationCap },
  ];

  const values = [
    {
      icon: Target,
      title: "Mission",
      description:
        "To provide accessible, comprehensive, and innovative library resources that support the academic and research needs of the OCC community.",
    },
    {
      icon: Heart,
      title: "Vision",
      description:
        "To be the premier digital and physical library hub, empowering students and faculty with seamless access to knowledge and learning resources.",
    },
    {
      icon: Shield,
      title: "Core Values",
      description:
        "Accessibility, Innovation, Integrity, Collaboration, and Excellence in service delivery.",
    },
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Collection",
      description:
        "Access thousands of physical books, eBooks, and student research papers across all programs.",
    },
    {
      icon: GraduationCap,
      title: "Program-Specific Resources",
      description:
        "Resources organized by program - BSIT, BSBA, BSED, BEED, and General Education.",
    },
    {
      icon: Users,
      title: "Student Research Repository",
      description:
        "Browse and download capstone projects, business research, feasibility studies, action research, and experimental theses.",
    },
  ];

  return (
    <>
      <Header />
      <ScrollToTopButton />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primaryDark py-16 md:py-24">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About OCC eLibrary
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Your gateway to knowledge — bridging traditional library resources
              with digital innovation
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-bgColor">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {stat.number}
                  </div>
                  <div className="text-xs text-textSecondary mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-textPrimary mb-3">
                    {value.title}
                  </h3>
                  <p className="text-textSecondary leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-12 md:py-16 bg-bgColor">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-textPrimary mb-3">
              What We Offer
            </h2>
            <p className="text-textSecondary max-w-2xl mx-auto">
              A complete ecosystem for all your academic resource needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                      <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-textPrimary mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-textSecondary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-textPrimary mb-3">
              Who We Serve
            </h2>
            <p className="text-textSecondary max-w-2xl mx-auto">
              Our resources are tailored for the entire OCC community
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Students",
                description:
                  "Access course materials, eBooks, and research papers for your program",
              },
              {
                title: "Faculty",
                description:
                  "Find teaching resources, research materials, and academic references",
              },
              {
                title: "Researchers",
                description:
                  "Browse student research repository and academic publications",
              },
              {
                title: "Alumni",
                description:
                  "Continued access to select resources after graduation",
              },
            ].map((audience, index) => (
              <div
                key={index}
                className="bg-bgColor rounded-lg p-6 text-center border border-gray-100"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-textPrimary mb-2">
                  {audience.title}
                </h3>
                <p className="text-sm text-textSecondary">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Start Exploring Today
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Join thousands of OCC students and faculty who use OCC eLibrary
            daily
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Browse Resources <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/student-research"
              className="inline-flex items-center gap-2 bg-primaryDark text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all border border-white/20"
            >
              View Student Research
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;
