'use client';

import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What areas do you deliver to?",
    answer: "We currently deliver to Cape Town, Johannesburg, Pretoria, and Durban. Cape Town, Johannesburg, and Pretoria enjoy next-day delivery service, while Durban receives deliveries every Friday. You can check if we deliver to your area by entering your postal code on our delivery page."
  },
  {
    question: "How does your subscription service work?",
    answer: "Our subscription service offers regular deliveries at a discounted rate. You can choose between monthly (10% off), bi-monthly (7.5% off), or quarterly (5% off) deliveries. You can pause, skip, or cancel your subscription at any time through your account dashboard."
  },
  {
    question: "Is your seafood fresh or frozen?",
    answer: "We offer both fresh and frozen seafood. Our frozen products are flash-frozen at peak freshness to maintain quality. For fresh products, we work directly with local suppliers to ensure the highest quality and freshness."
  },
  {
    question: "What is your delivery process?",
    answer: "Orders placed before 10 PM qualify for next-day delivery (except Durban). All our deliveries are made in temperature-controlled vehicles to ensure your seafood arrives in perfect condition. You'll receive tracking information via SMS and email once your order is dispatched."
  },
  {
    question: "How do you ensure product quality?",
    answer: "We maintain strict cold chain management throughout our entire process. Our products are sourced from certified suppliers, and we conduct regular quality checks. All our seafood is properly packaged and transported in temperature-controlled conditions."
  },
  {
    question: "What is your return policy?",
    answer: "Due to the perishable nature of our products, we cannot accept returns. However, if you're not satisfied with the quality of your order, please contact us within 24 hours of delivery, and we'll make it right."
  },
  {
    question: "How do I store my seafood?",
    answer: "Fresh seafood should be stored in the refrigerator (0-4°C) and consumed within 2-3 days. Frozen seafood should be kept in the freezer (-18°C or below) and can be stored for up to 6 months. Once thawed, seafood should not be refrozen."
  },
  {
    question: "Do you offer bulk orders?",
    answer: "Yes, we cater to bulk orders for events, restaurants, and wholesale customers. Please contact our customer service team for bulk pricing and delivery arrangements."
  }
];

export default function FAQsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about our products and services
          </p>
        </div>

        <Card className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Still have questions? Contact our support team at{' '}
            <a 
              href="mailto:support@caughtonline.co.za" 
              className="text-[#f6424a] hover:underline"
            >
              support@caughtonline.co.za
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}