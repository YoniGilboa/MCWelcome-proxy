'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FadeIn } from './AnimatedSection';
import { 
  ChatBubbleLeftIcon, 
  XMarkIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/solid';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function HeroSection() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <>
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-100 via-green-50 to-white">
      {/* Curved Bottom Edge */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-br from-green-50 to-white">
        <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,0 C480,100 960,100 1440,0 L1440,120 L0,120 Z" fill="white" />
        </svg>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-green-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-green-200/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <FadeIn delay={0.1}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                We're here to{' '}
                <span className="relative inline-block">
                  Increase your
                  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C82.5 2.5 217.5 2.5 298 10" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
                <br />
                <span className="text-gray-900">Productivity</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Let's make your work more organize and easily using the Mind Channel Dashboard with many of the latest features in managing work every day.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link
                  href="/chat"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                >
                  Start Chat with MCWelcome
                </Link>
                <Link
                  href="/solutions"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 rounded-full hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-medium text-lg border border-gray-200"
                >
                  Explore Solutions
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex items-center justify-center sm:justify-start space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Happy Clients</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">AI Support</div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Content - Hero Image */}
          <FadeIn delay={0.5} className="relative">
            <div className="relative max-w-md mx-auto">
              {/* Main Hero Image - Smaller with Rounded Corners */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero_image.png"
                  alt="Mind Channel AI Assistant"
                  width={450}
                  height={450}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Floating Card 1 - AI Chat - Top Left */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 -left-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl shadow-2xl p-4 hidden lg:block z-20 min-w-[140px]"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">AI Chat</div>
                    <div className="text-white/80 text-xs">Active Now</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2 - 24/7 Support - Top Right */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-8 -right-14 bg-white rounded-2xl shadow-2xl p-4 border border-green-100 hidden lg:block z-20 min-w-[120px]"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">24/7</div>
                  <div className="text-xs text-gray-600 font-medium mt-1">Support</div>
                </div>
              </motion.div>

              {/* Floating Card 3 - Active Users - Middle Left */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/3 -left-16 bg-white rounded-2xl shadow-2xl p-4 border border-blue-100 hidden lg:block z-20 min-w-[140px]"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-2">
                    <UserGroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">500+</div>
                    <div className="text-xs text-gray-600">Users</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 4 - Success Rate - Bottom Right */}
              <motion.div
                animate={{ y: [0, -13, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-8 -right-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl p-4 px-5 hidden lg:block z-20 min-w-[120px]"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">98%</div>
                  <div className="text-xs text-purple-100 font-medium mt-1">Success</div>
                </div>
              </motion.div>

              {/* Floating Card 5 - Response Time - Bottom Left */}
              <motion.div
                animate={{ 
                  y: [0, -11, 0],
                  rotate: [0, 2, 0, -2, 0]
                }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-12 -left-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-2xl p-4 hidden lg:block z-20 min-w-[130px]"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">&lt;2min</div>
                  <div className="text-xs text-orange-100 font-medium mt-1">Response</div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>

    {/* Video Tutorial Modal */}
    <AnimatePresence>
      {showVideoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
            <div className="aspect-video">
              <video
                autoPlay
                controls
                className="w-full h-full"
              >
                <source src="/Mind Channel MCWelcome Canva 2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
