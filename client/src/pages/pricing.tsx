import { useState } from "react";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, Zap, Award, Crown, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: typeof Zap;
  color: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "Free",
    description: "Free plan optimized for individual job seekers",
    features: [
      "Job search and browsing",
      "Resume creation and management",
      "Job applications (10 per month)",
      "Company information access",
      "Community feed access",
      "Basic notifications",
    ],
    limitations: [
      "No premium job listings",
      "Limited resume downloads",
      "Limited advanced search filters",
    ],
    icon: Zap,
    color: "text-gray-600",
  },
  {
    id: "professional",
    name: "Professional",
    price: 99000,
    period: "month",
    description: "Professional recruitment solution for companies",
    popular: true,
    features: [
      "Unlimited job postings",
      "Premium job listing exposure",
      "Applicant management dashboard",
      "Talent search and filtering",
      "Interview scheduling",
      "Basic analytics and reports",
      "Email support",
    ],
    limitations: [
      "Limited pro job posting options",
      "Limited advanced analytics",
    ],
    icon: Award,
    color: "text-blue-600",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299000,
    period: "month",
    description: "Complete recruitment platform for large enterprises",
    features: [
      "All Professional features",
      "Unlimited pro job postings",
      "Advanced analytics and insights",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
      "Priority support",
      "Phone and video conference support",
    ],
    limitations: [],
    icon: Crown,
    color: "text-purple-600",
  },
];

const faqs = [
  {
    question: "Can I use all features with the free plan?",
    answer: "The free plan includes basic job search and application features. Premium features are only available with paid plans.",
  },
  {
    question: "Can I change my plan anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    question: "What is your refund policy?",
    answer: "We offer a full refund if you request it within 7 days of subscription. After that, partial refunds are available.",
  },
  {
    question: "How do I create a company account?",
    answer: "When signing up, select 'Employer' account type to create a company account. Then you can enter your company information.",
  },
];

export default function Pricing() {
  useDisableRightClick();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = (planId: string) => {
    if (!isAuthenticated) {
      setLocation("/register");
    } else if (user?.userType === "employer") {
      // Redirect employers to subscription page
      setLocation("/company/settings?tab=billing");
    } else {
      // Redirect job seekers to home
      setLocation("/user/home");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the plan that fits your needs. All plans come with a 7-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-2 border-blue-500 shadow-xl scale-105"
                    : "border border-gray-200 dark:border-gray-700"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {plan.price === 0 ? "무료" : `${plan.price.toLocaleString()} MNT`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleGetStarted(plan.id)}
                    className={`w-full mb-6 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.price === 0 ? "Get Started Free" : "Get Started"}
                  </Button>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Included Features</h3>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-gray-500">Limitations</h3>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <HelpCircle className="h-8 w-8 text-blue-600" />
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Have questions? Find answers below.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Get Started Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Find new opportunities on Mongolia's premier job platform
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation("/register")}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/user/companies")}
              className="border-white text-white hover:bg-white/10"
            >
              Browse Companies
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
