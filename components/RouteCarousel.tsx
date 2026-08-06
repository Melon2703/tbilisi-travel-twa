'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Route } from '@/lib/types/route';
import { getVisitedStops, toggleVisitedStop } from '@/lib/utils/visited';
import RouteIntroCard from './RouteIntroCard';
import StopCard from './StopCard';
import TimelineBar from './TimelineBar';
import TelegramBackButtonController from './TelegramBackButtonController';
import { useTelegram } from '@/components/TelegramProvider';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Button from '@/components/ui/Button';

export interface RouteCarouselProps {
  route: Route;
}

export default function RouteCarousel({ route: rawRoute }: RouteCarouselProps) {
  const { getLocalizedRoute, t } = useLanguage();
  const route = getLocalizedRoute(rawRoute);
  const { webApp } = useTelegram();
  const router = useRouter();

  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [visitedStopIds, setVisitedStopIds] = useState<string[]>([]);

  useEffect(() => {
    setVisitedStopIds(getVisitedStops(route.id));
  }, [route.id]);

  const sortedStops = [...route.stops].sort((a, b) => a.order - b.order);
  const isCompleted = sortedStops.length > 0 && visitedStopIds.length === sortedStops.length;

  const isProgrammatic = useRef<boolean>(false);

  // Synchronize Swiper slide position when activeIndex changes programmatically (e.g. via Timeline button tap)
  useEffect(() => {
    if (isProgrammatic.current) {
      if (swiperRef.current && swiperRef.current.activeIndex !== activeIndex) {
        swiperRef.current.slideTo(activeIndex, 250);
      }
      isProgrammatic.current = false;
    }
  }, [activeIndex]);

  const handleStartRoute = () => {
    handleStopClick(1);
  };

  const handleStopClick = (slideIndex: number) => {
    isProgrammatic.current = true;
    setActiveIndex(slideIndex);
    if (swiperRef.current) {
      swiperRef.current.slideTo(slideIndex, 250);
    }
  };

  const handleBackNav = useCallback(() => {
    if (activeIndex > 0) {
      handleStopClick(activeIndex - 1);
    } else {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else if (webApp) {
        webApp.close();
      } else {
        router.push('/');
      }
    }
  }, [activeIndex, webApp, router]);

  const handleToggleVisited = () => {
    if (activeIndex === 0) {
      handleStopClick(1);
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
        handleStopClick(nextIndex);
      }
    }
  };

  return (
    <div className="w-full h-[100dvh] relative overflow-hidden bg-[#FAF7F2] transform-gpu text-[#1C1008]">
      <TelegramBackButtonController onBack={handleBackNav} />
      <Swiper
        speed={300}
        resistanceRatio={0.65}
        watchSlidesProgress={true}
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
        touchReleaseOnEdges={true}
        threshold={25}
        touchAngle={45}
        touchEventsTarget="container"
        className="w-full h-[100dvh]"
      >
        {/* Slide 0: Route Intro Card */}
        <SwiperSlide key="route-intro">
          <div className="h-[100dvh] w-full overflow-hidden bg-[#FAF7F2]">
            <RouteIntroCard route={route} onStartRoute={handleStartRoute} showStartButton={false} />
          </div>
        </SwiperSlide>

        {/* Slide 1..N: Stop Cards */}
        {sortedStops.map((stop, index) => (
          <SwiperSlide key={stop.id}>
            <div className="h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-[#FAF7F2] max-w-2xl mx-auto">
              <StopCard
                stop={stop}
                routeId={route.id}
                isLast={index === sortedStops.length - 1}
                totalStops={sortedStops.length}
                isVisited={visitedStopIds.includes(stop.id)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Sticky Bottom START ROUTE CTA in Preview mode */}
      {activeIndex === 0 && (
        <div
          data-testid="sticky-start-container"
          className="fixed bottom-0 left-0 right-0 p-4 pt-6 max-w-2xl mx-auto z-[99999] pointer-events-auto bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent"
        >
          <Button onClick={handleStartRoute} emoji="arrowRight">
            {t('startRoute')}
          </Button>
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
