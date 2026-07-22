'use client';

import React, { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Route } from '@/lib/types/route';
import RouteIntroCard from './RouteIntroCard';
import StopCard from './StopCard';

export interface RouteCarouselProps {
  route: Route;
}

export default function RouteCarousel({ route }: RouteCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const sortedStops = [...route.stops].sort((a, b) => a.order - b.order);

  const handleStartRoute = () => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(1);
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-[var(--twa-bg-color,#f7f4ef)]">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        slidesPerView={1}
        spaceBetween={0}
        touchAngle={45}
        className="w-full min-h-screen"
      >
        {/* Slide 0: Route Intro Card */}
        <SwiperSlide key="route-intro">
          <RouteIntroCard route={route} onStartRoute={handleStartRoute} />
        </SwiperSlide>

        {/* Slide 1..N: Stop Cards */}
        {sortedStops.map((stop, index) => (
          <SwiperSlide key={stop.id}>
            <div className="min-h-screen p-4 sm:p-6 pb-24 max-w-2xl mx-auto overflow-y-auto">
              <StopCard
                stop={stop}
                isLast={index === sortedStops.length - 1}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
