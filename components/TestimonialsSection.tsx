'use client';

import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { FadeIn } from './AnimatedSection';
import { useState } from 'react';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager",
    text: "Mind Channel has transformed how our team collaborates. The AI assistant is incredibly intuitive and saves us hours every week.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    text: "The productivity boost is real! I can focus on what matters while the AI handles routine tasks seamlessly.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director",
    text: "Best investment we've made this year. The 24/7 support and quick response times are game-changers for our global team.",
    rating: 5
  },
  {
    name: "David Park",
    role: "CEO",
    text: "Mind Channel's AI capabilities have revolutionized our workflow. Highly recommend for any team looking to scale efficiently.",
    rating: 5
  },
  {
    name: "Jessica Williams",
    role: "Designer",
    text: "The interface is beautiful and the AI understands context perfectly. It's like having an extra team member who never sleeps!",
    rating: 5
  },
  {
    name: "James Martinez",
    role: "Operations Manager",
    text: "Incredible tool! Our team productivity increased by 40% within the first month. The ROI speaks for itself.",
    rating: 5
  },
  {
    name: "Laura Thompson",
    role: "Consultant",
    text: "Mind Channel made remote work so much easier. The AI chat feature feels natural and truly understands our needs.",
    rating: 5
  },
  {
    name: "Robert Kim",
    role: "Entrepreneur",
    text: "As a startup founder, Mind Channel has been invaluable. It's like having a full support team at a fraction of the cost.",
    rating: 5
  }
];

function TestimonialCard({ name, role, text, rating, onHoverChange }: typeof testimonials[0] & { onHoverChange: (isHovered: boolean) => void }) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg p-8 min-w-[350px] max-w-[350px] min-h-[380px] flex-shrink-0 border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-shadow cursor-pointer"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl">
            {name[0]}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{name}</h4>
            <p className="text-sm text-gray-600">{role}</p>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed text-base mb-6">{text}</p>
      </div>
      <div className="flex">
        {[...Array(rating)].map((_, i) => (
          <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [isFirstRowPaused, setIsFirstRowPaused] = useState(false);
  const [isSecondRowPaused, setIsSecondRowPaused] = useState(false);

  // Split testimonials into two rows
  const firstRow = testimonials.slice(0, 4);
  const secondRow = testimonials.slice(4, 8);

  // Triple the arrays for seamless infinite scroll
  const firstRowTripled = [...firstRow, ...firstRow, ...firstRow];
  const secondRowTripled = [...secondRow, ...secondRow, ...secondRow];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join hundreds of satisfied users who have transformed their productivity with Mind Channel
            </p>
          </div>
        </FadeIn>
      </div>

      {/* First Row - Scrolling Left */}
      <div className="mb-8 relative">
        <motion.div
          className="flex space-x-6"
          animate={isFirstRowPaused ? {} : {
            x: [0, -1920],
          }}
          transition={{
            x: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {firstRowTripled.map((testimonial, index) => (
            <TestimonialCard 
              key={`first-${index}`} 
              {...testimonial} 
              onHoverChange={setIsFirstRowPaused}
            />
          ))}
        </motion.div>
      </div>

      {/* Second Row - Scrolling Right */}
      <div className="relative">
        <motion.div
          className="flex space-x-6"
          animate={isSecondRowPaused ? {} : {
            x: [-1920, 0],
          }}
          transition={{
            x: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {secondRowTripled.map((testimonial, index) => (
            <TestimonialCard 
              key={`second-${index}`} 
              {...testimonial} 
              onHoverChange={setIsSecondRowPaused}
            />
          ))}
        </motion.div>
      </div>

      {/* Logos Section */}
      <div className="mt-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-gray-500 font-medium text-sm">Trusted by leading companies worldwide</p>
          </div>
          <div className="relative overflow-hidden py-8">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-green-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-green-50 to-transparent z-10 pointer-events-none"></div>
            
            <motion.div
              className="flex space-x-16 items-center"
              animate={{
                x: [0, -1400],
              }}
              transition={{
                x: {
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              {/* Repeat logos for seamless loop */}
              {[...Array(3)].map((_, groupIndex) => (
                <div key={groupIndex} className="flex space-x-16 items-center">
                  {/* Logo 1 */}
                  <div className="flex items-center space-x-2 opacity-40 hover:opacity-60 transition-opacity">
                    <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span className="text-2xl font-semibold text-gray-600">dipy</span>
                  </div>
                  
                  {/* Logo 2 */}
                  <div className="flex items-center space-x-2 opacity-40 hover:opacity-60 transition-opacity">
                    <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.8 18.1c0 2.7-2.2 4.8-4.8 4.8s-4.8-2.1-4.8-4.8c0-2.7 2.2-4.8 4.8-4.8 2.7.1 4.8 2.2 4.8 4.8zm-.3-7.2c0 2-1.6 3.6-3.6 3.6s-3.6-1.6-3.6-3.6 1.6-3.6 3.6-3.6 3.6 1.6 3.6 3.6zM4 12.5c0 2.9 2.4 5.3 5.3 5.3s5.3-2.4 5.3-5.3-2.4-5.3-5.3-5.3S4 9.6 4 12.5z"/>
                    </svg>
                    <span className="text-2xl font-semibold text-gray-600">SmartSend</span>
                  </div>
                  
                  {/* Logo 3 */}
                  <div className="flex items-center space-x-2 opacity-40 hover:opacity-60 transition-opacity">
                    <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="text-2xl font-semibold italic text-gray-600">webiz</span>
                  </div>
                  
                  {/* Logo 4 */}
                  <div className="flex items-center space-x-2 opacity-40 hover:opacity-60 transition-opacity">
                    <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                    <span className="text-2xl font-semibold text-gray-600">Landsman</span>
                  </div>
                  
                  {/* Logo 5 */}
                  <div className="flex items-center space-x-2 opacity-40 hover:opacity-60 transition-opacity">
                    <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                    <span className="text-2xl font-semibold text-gray-600">Schwarzkopf</span>
                  </div>
                  
                  {/* Logo 6 */}
                  <div className="flex items-center space-x-2 opacity-40 hover:opacity-60 transition-opacity">
                    <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span className="text-2xl font-semibold text-gray-600">TechFlow</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
