'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
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
  const [visitedStopIds, setVisitedStopIds] = useState<string[]>(() => getVisitedStops(route.id));
  const [prevRouteId, setPrevRouteId] = useState<string>(route.id);

  if (prevRouteId !== route.id) {
    setPrevRouteId(route.id);
    setVisitedStopIds(getVisitedStops(route.id));
  }

  const sortedStops = [...route.stops].sort((a, b) => a.order - b.order);
  const isCompleted = sortedStops.length > 0 && visitedStopIds.length === sortedStops.length;



  // Synchronize Swiper slide position whenever activeIndex changes
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.activeIndex !== activeIndex) {
      swiperRef.current.slideTo(activeIndex, 300);
    }
  }, [activeIndex]);

  const handleStartRoute = () => {
    handleStopClick(1);
  };

  const handleStopClick = (slideIndex: number) => {
    setActiveIndex(slideIndex);
    if (swiperRef.current) {
      swiperRef.current.slideTo(slideIndex, 300);
    }
  };

  const handleToggleVisited = () => {
    if (activeIndex === 0) {
      setActiveIndex(1);
      if (swiperRef.current) {
        swiperRef.current.slideTo(1, 300);
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
      if (!isLastStop) {
        const nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex);
        if (swiperRef.current) {
          swiperRef.current.slideTo(nextIndex, 300);
        }
      }
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-[var(--twa-bg-color,#f7f4ef)]">
      <Swiper
        modules={[Mousewheel]}
        mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          if (swiper.activeIndex !== activeIndex) {
            swiper.slideTo(activeIndex, 0);
          }
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
        onSlideChangeTransitionEnd={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
        slidesPerView={1}
        spaceBetween={0}
        allowTouchMove={true}
        simulateTouch={true}
        preventClicks={false}
        preventClicksPropagation={false}
        touchStartPreventDefault={false}
        threshold={10}
        touchAngle={45}
        touchEventsTarget="container"
        className="w-full min-h-screen"
      >
        {/* Slide 0: Route Intro Card */}
        <SwiperSlide key="route-intro">
          <RouteIntroCard route={route} onStartRoute={handleStartRoute} showStartButton={false} />
        </SwiperSlide>

        {/* Slide 1..N: Stop Cards */}
        {sortedStops.map((stop, index) => (
          <SwiperSlide key={stop.id}>
            <div className="min-h-screen p-4 sm:p-6 pb-28 max-w-2xl mx-auto overflow-y-auto">
              <StopCard
                stop={stop}
                isLast={index === sortedStops.length - 1}
                totalStops={sortedStops.length}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Sticky Bottom START ROUTE CTA in Preview mode */}
      {activeIndex === 0 && (
        <div
          data-testid="sticky-start-container"
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--twa-bg-color,#fafaf7)] via-[var(--twa-bg-color,#fafaf7)]/90 to-transparent z-30 max-w-2xl mx-auto pointer-events-auto"
        >
          <button
            type="button"
            onClick={handleStartRoute}
            className="w-full bg-[var(--terracotta)] hover:bg-orange-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base tracking-wide transition-all cursor-pointer min-h-[48px] min-w-[48px]"
          >
            <span>START ROUTE</span>
            <span className="text-lg">➔</span>
          </button>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar (Visible only on stop cards, activeIndex > 0) */}
      {activeIndex > 0 && (
        <TimelineBar
          stops={sortedStops}
          activeIndex={activeIndex}
          visitedStopIds={visitedStopIds}
          onStopClick={handleStopClick}
          onToggleVisited={handleToggleVisited}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}
