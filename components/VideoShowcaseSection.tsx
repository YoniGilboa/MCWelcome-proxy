'use client';

import { motion } from 'framer-motion';
import { Play, Users, Star } from 'lucide-react';
import { FadeIn } from './AnimatedSection';

export default function VideoShowcaseSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              More than 25,000 teams use Mind Channel
            </h2>
          </FadeIn>
        </div>

        {/* Centered Video */}
        <FadeIn delay={0.2} className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-100 to-green-50 p-1">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden relative group cursor-pointer">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto opacity-90"
                style={{ minHeight: '400px', objectFit: 'cover' }}
              >
                <source src="/Mind Channel MCWelcome Canva 2.mp4" type="video/mp4" />
              </video>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-full p-6 shadow-2xl"
                >
                  <Play className="w-12 h-12 text-green-500 fill-green-500" />
                </motion.div>
              </div>
            </div>

            {/* Floating Stats Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 hidden lg:block"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-lg p-2">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Active Users</div>
                  <div className="text-lg font-bold text-gray-900">25K+</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 hidden lg:block"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 rounded-lg p-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Rating</div>
                  <div className="text-lg font-bold text-gray-900">4.9/5</div>
                </div>
              </div>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
