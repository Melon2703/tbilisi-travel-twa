'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Route } from '@/lib/types/route';
import { getVisitedStops, toggleVisitedStop } from '@/lib/utils/visited';
import RouteIntroCard from './RouteIntroCard';
import StopCard from './StopCard';
import TimelineBar from './TimelineBar';

export interface RouteCarouselProps {
  route: Route;
}

export default function RouteCarousel({ route }: RouteCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [visitedStopIds, setVisitedStopIds] = useState<string[]>([]);

  const sortedStops = [...route.stops].sort((a, b) => a.order - b.order);
  const isCompleted = sortedStops.length > 0 && visitedStopIds.length === sortedStops.length;

  useEffect(() => {
    const initialVisited = getVisitedStops(route.id);
    setVisitedStopIds(initialVisited);
  }, [route.id]);

  const handleStartRoute = () => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(1);
      setActiveIndex(1);
    }
  };

  const handleStopClick = (slideIndex: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(slideIndex);
      setActiveIndex(slideIndex);
    }
  };

  const handleToggleVisited = () => {
    if (activeIndex === 0) {
      if (swiperRef.current) {
        swiperRef.current.slideTo(1);
        setActiveIndex(1);
      }
      return;
    }

    const stopIndex = activeIndex - 1;
    if (stopIndex < 0 || stopIndex >= sortedStops.length) return;

    const currentStop = sortedStops[stopIndex];
    const { visited, isVisitedNow } = toggleVisitedStop(route.id, currentStop.id);
    setVisitedStopIds(visited);

    if (isVisitedNow) {
      const isLastStop = activeIndex === sortedStops.length;
      if (!isLastStop && swiperRef.current) {
        swiperRef.current.slideNext();
        setActiveIndex((prev) => Math.min(prev + 1, sortedStops.length));
      }
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-[var(--twa-bg-color,#f7f4ef)]">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setActiveIndex(swiper.activeIndex);
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
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
            <div className="min-h-screen p-4 sm:p-6 pb-28 max-w-2xl mx-auto overflow-y-auto">
              <StopCard
                stop={stop}
                isLast={index === sortedStops.length - 1}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Sticky Bottom Navigation Bar */}
      <TimelineBar
        stops={sortedStops}
        activeIndex={activeIndex}
        visitedStopIds={visitedStopIds}
        onStopClick={handleStopClick}
        onToggleVisited={handleToggleVisited}
        isCompleted={isCompleted}
      />
    </div>
  );
}
