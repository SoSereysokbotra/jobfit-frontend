import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { SectionCard } from "@/shared/components/layout/section-card";
import { Target, Zap, Shield, Briefcase, Heart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | JobFits",
  description: "Learn more about JobFits and our mission to connect talent with opportunity.",
};

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-content mb-4">
          About <span className="text-primary-600">JobFits</span>
        </h1>
        <p className="text-lg sm:text-xl max-w-3xl mx-auto text-content-secondary leading-relaxed">
          Our mission is to help job seekers find the perfect fit and empower employers to discover top talent through intuitive, AI-driven connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <SectionCard
          title="Our Mission"
          headerIcon={<Target className="w-5 h-5 text-primary-600" />}
          className="h-full"
        >
          <p className="text-content-secondary leading-relaxed">
            Founded with the belief that the right job can transform a person&apos;s life, JobFits is designed to bridge the gap between talented professionals and forward-thinking companies. We remove the friction from hiring to let true potential shine.
          </p>
        </SectionCard>

        <SectionCard
          title="What We Do"
          headerIcon={<Briefcase className="w-5 h-5 text-primary-600" />}
          className="h-full"
        >
          <p className="text-content-secondary leading-relaxed">
            Whether you are actively looking for your next career move or passively exploring opportunities, JobFits provides tailored job recommendations, powerful resume tools, and deep insights. For employers, we offer a seamless way to post jobs and discover culture-aligned candidates.
          </p>
        </SectionCard>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-content">Our Core Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SectionCard
            title="Transparency"
            headerIcon={<Shield className="w-5 h-5 text-primary-500" />}
            className="h-full"
          >
            <p className="text-sm text-content-secondary">
              We believe in clear, honest communication between candidates and employers at every stage.
            </p>
          </SectionCard>
          <SectionCard
            title="Empowerment"
            headerIcon={<Zap className="w-5 h-5 text-warning-500" />}
            className="h-full"
          >
            <p className="text-sm text-content-secondary">
              We equip our users with the powerful resources and insights they need to succeed in their career journeys.
            </p>
          </SectionCard>
          <SectionCard
            title="Innovation"
            headerIcon={<Sparkles className="w-5 h-5 text-info-500" />}
            className="h-full"
          >
            <p className="text-sm text-content-secondary">
              We continuously evolve our platform with cutting-edge AI to provide the best possible experience.
            </p>
          </SectionCard>
          <SectionCard
            title="Inclusivity"
            headerIcon={<Heart className="w-5 h-5 text-error-500" />}
            className="h-full"
          >
            <p className="text-sm text-content-secondary">
              We strive to create a diverse, welcoming environment that champions opportunities for all.
            </p>
          </SectionCard>
        </div>
      </div>

      <div className="text-center p-10 rounded-2xl bg-surface border border-border shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-content">
          Ready to find your fit?
        </h2>
        <p className="text-content-secondary mb-8 max-w-xl mx-auto">
          Join thousands of professionals and companies who have already discovered their perfect match on JobFits.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-md text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-primary-600 hover:bg-primary-700 text-white"
          >
            Create a free account
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-md text-sm font-semibold transition-all duration-200 active:scale-[0.98] border-2 border-primary-500 text-primary-600 bg-transparent hover:bg-primary-50"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
