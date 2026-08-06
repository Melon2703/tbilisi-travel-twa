'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Route } from '@/lib/types/route';
import { getVisitedStops, toggleVisitedStop } from '@/lib/utils/visited';
import {
  getProgressPosition,
  recordProgressPosition,
  stopAtProgressPosition,
} from '@/lib/utils/progress';
import RouteIntroCard, { routeEntryCtaLabel } from './RouteIntroCard';
import StopCard from './StopCard';
import TimelineBar from './TimelineBar';
import TelegramBackButtonController from './TelegramBackButtonController';
import { useTelegram } from '@/components/TelegramProvider';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Button from '@/components/ui/Button';

/** Slide 0 is the Route Intro Card; the Route's first Stop Card is Slide 1. */
const ROUTE_INTRO_SLIDE_INDEX = 0;
const FIRST_STOP_SLIDE_INDEX = 1;

export interface RouteCarouselProps {
  route: Route;
  /**
   * The Progress Position to open at, carried in the URL by the catalog's Continue
   * affordance. A position that names no Stop on this Route opens the Route Intro
   * Card instead.
   */
  entryProgressPosition?: number;
}

export default function RouteCarousel({
  route: rawRoute,
  entryProgressPosition,
}: RouteCarouselProps) {
  const { getLocalizedRoute, t } = useLanguage();
  const route = getLocalizedRoute(rawRoute);
  const { webApp } = useTelegram();
  const router = useRouter();

  const swiperRef = useRef<SwiperType | null>(null);
  const entrySlide = stopAtProgressPosition(rawRoute.stops, entryProgressPosition ?? null)
    ? (entryProgressPosition ?? ROUTE_INTRO_SLIDE_INDEX)
    : ROUTE_INTRO_SLIDE_INDEX;
  const [activeIndex, setActiveIndex] = useState<number>(entrySlide);
  const [visitedStopIds, setVisitedStopIds] = useState<string[]>([]);
  const [progressPosition, setProgressPosition] = useState<number | null>(null);

  useEffect(() => {
    setVisitedStopIds(getVisitedStops(route.id));
    setProgressPosition(getProgressPosition(route.id));
  }, [route.id]);

  /**
   * The single place a Card becomes the current one. Every navigation path — swipe,
   * Stop indicator, overview control, marking a Stop visited — arrives here, so
   * Progress Position is recorded once, for all of them.
   */
  const reachCard = useCallback(
    (slideIndex: number) => {
      setActiveIndex(slideIndex);
      setProgressPosition(recordProgressPosition(route.id, slideIndex));
    },
    [route.id]
  );

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

  // A Progress Position past the end of the Route — a Route that lost Stops since the
  // traveler walked it — names no Stop, so entry falls back to the first Stop.
  const progressStop = stopAtProgressPosition(sortedStops, progressPosition);
  const entryPosition =
    progressStop && progressPosition !== null ? progressPosition : FIRST_STOP_SLIDE_INDEX;

  const handleEnterRoute = () => {
    handleStopClick(entryPosition);
  };

  const handleStopClick = (slideIndex: number) => {
    isProgrammatic.current = true;
    reachCard(slideIndex);
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
          reachCard(swiper.activeIndex);
        }}
        onSlideChangeTransitionEnd={(swiper) => {
          reachCard(swiper.activeIndex);
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
            <RouteIntroCard
              route={route}
              onStartRoute={handleEnterRoute}
              showStartButton={false}
              progressStopName={progressStop?.name}
            />
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
          <Button onClick={handleEnterRoute} emoji="arrowRight">
            {routeEntryCtaLabel(t, progressStop?.name)}
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
