"use client";
import React, { useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const slidesData = [
  {
    image: "/Images/HeroImage-1.PNG",
    badge: "Welcome to ArtHub Gallery",
    headingFirst: "Discover & Collect",
    headingHighlight: "Extraordinary",
    headingLast: "Artworks",
    description:
      "Explore a curated world of finest paintings, digital arts, and hand-crafted masterpieces created by passionate artists worldwide.",
  },
  {
    image: "/Images/HeroImage-2.PNG",
    badge: "Empower Global Creators",
    headingFirst: "Support Real & Unique",
    headingHighlight: "Talented",
    headingLast: "Artists",
    description:
      "Connect directly with independent creators around the globe. Secure verified ownership of premium digital assets and physical masterpieces.",
  },
  {
    image: "/Images/HeroImage-3.PNG",
    badge: "Curated Showcase System",
    headingFirst: "Transform Spaces with",
    headingHighlight: "Exquisite",
    headingLast: "Vibes",
    description:
      "Dive deep into modern abstractions, classic landscapes, and cutting-edge digital renders tailored for art collectors and enthusiasts.",
  },
];

const badgeVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const headingVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.25 } },
};

const highlightVariants = {
  hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  visible: {
    opacity: 1,
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const descVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.42 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const btnContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } },
  exit: {},
};

const btnVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const Hero = ({ currentUser }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const isArtist = currentUser?.role === "artist";
  const artistTargetLink = isArtist ? "/dashboard/artist" : "/register";

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
    setAnimKey((k) => k + 1);
  };

  const slide = slidesData[activeIndex];

  return (
    <div
      className="w-full h-[calc(100vh-64px)] sm:h-[calc(100vh-35px)] relative bg-[#2f3f48] overflow-hidden custom-swiper-container"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{ nextEl: ".custom-next", prevEl: ".custom-prev" }}
        pagination={{ clickable: true }}
        loop
        onSlideChange={handleSlideChange}
        className="h-full w-full"
      >
        {slidesData.map((s, i) => (
          <SwiperSlide key={i} className="relative h-full w-full">
            {/* Background Image Setup */}
            <div className="absolute inset-0 z-0">
              <Image
                src={s.image}
                alt={`ArtHub slide ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[#2f3f48]/62" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Floating Content Layer Layered Securely Over Sliders */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] 2xl:w-[70%] mx-auto px-4 text-center text-white space-y-6 pt-0 sm:pt-7.5">
          {/* Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`badge-${animKey}`}
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="inline-flex items-center gap-2 bg-[#df6742]/20 border border-[#df6742]/40 px-4 py-1.5 rounded-full select-none"
            >
              <span className="w-2 h-2 rounded-full bg-[#df6742] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#df6742]">
                {slide.badge}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`heading-${animKey}`}
              variants={headingVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
            >
              {slide.headingFirst}
              <br />
              <motion.span
                key={`highlight-${animKey}`}
                variants={highlightVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="inline-block text-[#df6742]"
              >
                {slide.headingHighlight}
              </motion.span>{" "}
              {slide.headingLast}
            </motion.h1>
          </AnimatePresence>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${animKey}`}
              variants={descVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              {slide.description}
            </motion.p>
          </AnimatePresence>

          {/* Core Navigation Actions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`btns-${animKey}`}
              variants={btnContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 pointer-events-auto"
            >
              <motion.div variants={btnVariants}>
                <NextLink
                  href="/browse"
                  className="inline-block px-8 py-3.5 bg-[#df6742] hover:bg-[#c55332] text-white font-bold rounded-xl shadow-lg shadow-[#df6742]/20 transition-all active:scale-95 text-sm tracking-wide"
                >
                  Explore Artworks
                </NextLink>
              </motion.div>

              <motion.div variants={btnVariants}>
                <NextLink
                  href={artistTargetLink}
                  className="inline-block px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-md transition-all active:scale-95 text-sm tracking-wide"
                >
                  {isArtist ? "Go to Dashboard" : "Join as an Artist"}
                </NextLink>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button className="custom-prev absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-transparent border-none text-white/35 hover:text-white/90 transition-colors duration-300 outline-none select-none hidden sm:block">
        <HiOutlineChevronLeft size={44} strokeWidth={1} />
      </button>
      <button className="custom-next absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-transparent border-none text-white/35 hover:text-white/90 transition-colors duration-300 outline-none select-none hidden sm:block">
        <HiOutlineChevronRight size={44} strokeWidth={1} />
      </button>
    </div>
  );
};

export default Hero;
