'use client';

import { FadeIn } from './AnimatedSection';
import { useState, useEffect } from 'react';
import { 
  HiSparkles, 
  HiBolt, 
  HiArrowTrendingUp, 
  HiUserGroup, 
  HiShieldCheck, 
  HiRocketLaunch, 
  HiChartBar, 
  HiLightBulb 
} from 'react-icons/hi2';

const solutions = [
  {
    icon: HiSparkles,
    title: 'AI-Powered Consulting',
    description: 'Leverage cutting-edge AI technology to get instant business insights and strategic recommendations.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: HiBolt,
    title: 'Automation Solutions',
    description: 'Streamline your operations with intelligent automation that saves time and reduces costs.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: HiArrowTrendingUp,
    title: 'Growth Strategies',
    description: 'Data-driven strategies designed to accelerate your business growth and market expansion.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: HiUserGroup,
    title: 'Team Collaboration',
    description: 'Enhanced collaboration tools that bring your team together for maximum productivity.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: HiShieldCheck,
    title: 'Security & Compliance',
    description: 'Enterprise-grade security measures to protect your data and ensure regulatory compliance.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: HiRocketLaunch,
    title: 'Rapid Deployment',
    description: 'Quick implementation and seamless integration with your existing business infrastructure.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: HiChartBar,
    title: 'Analytics & Insights',
    description: 'Comprehensive analytics dashboard providing real-time insights into your business performance.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: HiLightBulb,
    title: 'Innovation Lab',
    description: 'Access to cutting-edge tools and technologies to keep your business ahead of the curve.',
    color: 'from-teal-500 to-green-500',
  },
];

export default function SolutionsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % solutions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % solutions.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + solutions.length) % solutions.length);
    setIsAutoPlaying(false);
  };

  const currentSolution = solutions[currentIndex];
  const Icon = currentSolution.icon;

  return (
    <section id="solutions" className="py-12 bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="relative inline-block">
              Everything You Need
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C82.5 2.5 217.5 2.5 298 10" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
            <br />
            <span className="text-gray-900">For Business Success</span>
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive solutions designed to transform your business operations and drive sustainable growth.
          </p>
        </FadeIn>

        {/* Carousel Container with White Background */}
        <div className="relative max-w-[1400px] mx-auto">
          <div 
            key={`slide-${currentIndex}`}
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 animate-fadeIn border border-gray-200"
          >
            <div className="grid lg:grid-cols-[45%_55%] gap-8 items-center">
              {/* Left Side - Icon Display */}
              <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                {/* Geometric Pattern Background */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 ${
                          i % 2 === 0 ? 'border-green-400' : 'border-blue-400'
                        }`}
                        style={{
                          width: `${100 + i * 60}px`,
                          height: `${80 + i * 48}px`,
                          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                          transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Center Icon */}
                <div className={`relative z-10 w-48 h-48 rounded-3xl bg-gradient-to-r ${currentSolution.color} flex items-center justify-center shadow-2xl`}>
                  <Icon className="w-28 h-28 text-white" />
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="space-y-6">
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900">
                  {currentSolution.title}
                </h3>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  {currentSolution.description}
                </p>

                {/* Sub-benefits */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sub-Benefit 1</span>
                      <p className="text-gray-700">Quick implementation and seamless integration with your existing systems</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sub-Benefit 2</span>
                      <p className="text-gray-700">Continuous updates and improvements based on the latest AI research</p>
                    </div>
                  </div>
                </div>

                {/* Learn More Button */}
                <button className="group mt-8 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2">
                  <span className="font-semibold">Learn More</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center shadow-md group"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dot Indicators */}
            <div className="flex gap-2">
              {solutions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`transition-all rounded-full ${
                    index === currentIndex
                      ? 'w-8 h-3 bg-green-500'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center shadow-md group"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </section>
  );
}
