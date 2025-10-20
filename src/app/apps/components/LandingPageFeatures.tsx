'use client';

import { AppData } from '@/lib/appsData';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface LandingPageFeaturesProps {
  app: AppData;
}

export default function LandingPageFeatures({ app }: LandingPageFeaturesProps) {
  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  return (
    <section className="bg-background text-foreground py-20 px-4">
      <div className="container mx-auto space-y-16">
        {app.features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className={`flex flex-col md:flex-row items-center gap-12 ${
              index % 2 !== 0 ? 'md:flex-row-reverse' : '' // Alternating layout
            }`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }} // Trigger animation when 30% of it is visible
            variants={featureVariants}
          >
            {/* Text Content */}
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4" style={{ color: app.themeColor.primary }}>
                {feature.title}
              </h2>
              <p className="text-lg text-muted-foreground">{feature.description}</p>
            </div>

            {/* Image Content */}
            <div className="md:w-1/2 flex justify-center">
              <Image
                src={feature.imageUrl}
                alt={feature.title}
                width={350}
                height={700}
                className="rounded-xl shadow-2xl object-contain"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
