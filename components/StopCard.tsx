'use client';

import React from 'react';
import Image from 'next/image';
import { Stop, VenueStop, AttractionStop } from '@/lib/types/route';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { buildGoogleMapLink, buildYandexMapLink, getPlaceIdentity } from '@/lib/utils/mapLinks';
import EmojiIcon from '@/components/ui/EmojiIcon';
import Badge from '@/components/ui/Badge';
import Callout from '@/components/ui/Callout';
import { getStopRatings, fetchPlaceRatingsFromAPI, ResolvedRatings } from '@/lib/services/places';
import LightboxModal from '@/components/timeline/LightboxModal';
import { SiGooglemaps } from 'react-icons/si';
import { FaYandex, FaInstagram, FaGlobe } from 'react-icons/fa6';
import { COLORS, TYPOGRAPHY, COMPONENT_TOKENS } from '@/lib/theme/tokens';

export interface StopCardProps {
  stop: Stop;
  routeId?: string;
  isLast?: boolean;
  totalStops?: number;
  isVisited?: boolean;
}

function GoogleMapsIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return <SiGooglemaps className={className} style={{ color: COLORS.brand.googleMaps }} />;
}

function YandexMapsIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return <FaYandex className={className} style={{ color: COLORS.brand.yandexMaps }} />;
}

function GlobeIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return <FaGlobe className={className} style={{ color: COLORS.iconMuted }} />;
}

function InstagramIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return <FaInstagram className={className} style={{ color: COLORS.brand.instagram }} />;
}

interface ActionButtonLinkProps {
  href: string;
  ariaLabel: string;
  title: string;
  children: React.ReactNode;
}

function ActionButtonLink({ href, ariaLabel, title, children }: ActionButtonLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-2xl bg-white shadow-xs flex items-center justify-center transition-all active:scale-95"
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: COLORS.actionBorder,
        color: COLORS.textPrimary,
      }}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </a>
  );
}

const CATEGORY_KEYS: Record<string, string> = {
  cafe: 'cafe',
  restaurant: 'restaurant',
  bar: 'bar',
  wine_bar: 'wine_bar',
};

function formatCategoryCuisine(venueStop: VenueStop, t: (key: any) => string): string {
  const categoryKey = CATEGORY_KEYS[venueStop.venueDetails.category] || venueStop.venueDetails.category;
  const categoryText = t(categoryKey as any) || venueStop.venueDetails.category;

  if (venueStop.venueDetails.cuisines && venueStop.venueDetails.cuisines.length > 0) {
    const cuisinesText = venueStop.venueDetails.cuisines
      .map((c) => t(c as any) || c.charAt(0).toUpperCase() + c.slice(1))
      .join(', ');
    return `${categoryText} • ${cuisinesText}`;
  }
  return categoryText;
}function RecommendedDishesSection({ dishes, title }: { dishes: string[]; title: string }) {
  return (
    <div data-testid="recommended-dishes">
      <Callout emoji="utensils" title={title}>
        <ul data-testid="recommended-dishes-list" className="space-y-1 pl-1 pt-0.5">
          {dishes.map((dish, index) => (
            <li
              key={`${dish}-${index}`}
              data-testid="dish-item"
              className="text-xs sm:text-sm font-medium flex items-start gap-2"
              style={{ color: COLORS.dishText }}
            >
              <span style={{ color: COLORS.terracottaAccent }} className="font-bold shrink-0">•</span>
              <span>{dish}</span>
            </li>
          ))}
        </ul>
      </Callout>
    </div>
  );
}

function StopCard({ stop: rawStop, routeId, totalStops = 6, isVisited = false }: StopCardProps) {
  const { t, getLocalizedStop } = useLanguage();
  const stop = getLocalizedStop(rawStop);

  const placeIdentity = getPlaceIdentity(stop);
  const googleMapsUrl = buildGoogleMapLink(placeIdentity);
  const yandexMapsUrl = buildYandexMapLink(placeIdentity);

  // Website link if defined on stop
  const websiteUrl = stop.websiteUrl;

  const staticRatings = getStopRatings(stop);
  const [liveRatings, setLiveRatings] = React.useState<{ stopId: string; ratings: ResolvedRatings } | null>(null);

  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  const galleryImages = (stop.galleryImages && stop.galleryImages.length > 0)
    ? stop.galleryImages
    : (stop.imageUrl ? [stop.imageUrl] : []);

  const ratings = (liveRatings && liveRatings.stopId === stop.id) ? liveRatings.ratings : staticRatings;

  React.useEffect(() => {
    if (stop.placeIds?.google) {
      let isMounted = true;
      const initial = getStopRatings(stop);
      fetchPlaceRatingsFromAPI(stop).then((fetchedRatings) => {
        if (
          isMounted &&
          (fetchedRatings.google.rating !== initial.google.rating ||
            fetchedRatings.google.count !== initial.google.count)
        ) {
          setLiveRatings({ stopId: stop.id, ratings: fetchedRatings });
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [stop]);

  const stopLabel = t('stopOf', { order: stop.order, total: totalStops });

  const isVenue = stop.stopType === 'venue';
  const venueStop = isVenue ? (stop as VenueStop) : null;
  const attractionStop = !isVenue ? (stop as AttractionStop) : null;
  const isPitstop = isVenue && (venueStop?.isOptional ?? false);

  /* Part 1 & Part 2: Visual Cover with Floating Header Bar & Overlay Badges */
  const renderVisualCover = () => (
    <>
      {stop.imageUrl && (
        <div
          data-testid="hero-image-container"
          onClick={() => {
            setLightboxIndex(0);
            setIsLightboxOpen(true);
          }}
          className="relative w-full h-52 sm:h-60 shrink-0 overflow-hidden cursor-pointer group"
          style={{ backgroundColor: COLORS.canvasBg }}
          role="button"
          tabIndex={0}
          aria-label={`Open photo lightbox for ${stop.name}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setLightboxIndex(0);
              setIsLightboxOpen(true);
            }
          }}
        >
          <Image
            src={stop.imageUrl}
            alt={stop.name}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover transition-transform duration-300"
            priority={stop.order === 1}
          />

          {/* Top scrim gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 45%, rgba(250,247,242,0) 75%, rgba(250,247,242,1) 100%)',
            }}
          />

          {/* Floating frosted-glass badges */}
          <span
            className="absolute top-3 left-3 backdrop-blur-md bg-black/50 bg-slate-900/80 text-xs text-white px-3 py-1.5 rounded-full font-semibold z-20 flex items-center gap-1.5 border border-white/20 shadow-xs"
          >
            <EmojiIcon name="mapPin" size="xs" />
            {stop.neighborhood}
          </span>

          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {galleryImages.length > 1 && (
              <span
                data-testid="photo-count-badge"
                className="backdrop-blur-md bg-black/50 bg-slate-900/80 text-xs text-white px-2.5 py-1.5 rounded-full font-semibold flex items-center gap-1 border border-white/20 shadow-xs"
              >
                🖼️ 1/{galleryImages.length}
              </span>
            )}
            <span className="backdrop-blur-md bg-black/50 bg-slate-900/80 text-xs text-white px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border border-white/20 shadow-xs">
              <EmojiIcon name="clock" size="xs" />
              {stop.estimatedMinutes} {t('min')}
            </span>
          </div>
        </div>
      )}
    </>
  );

  /* Part 1: Header Bar & Map Proximity Layout */
  const renderHeaderBar = () => (
    <div className="space-y-3" data-testid="stop-card-header-container">
      {/* Top Header Toolbar Row */}
      <div className="flex items-center justify-between gap-2 min-w-0 w-full" data-testid="stop-card-header-top-row">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.06em]"
            style={{
              color: COLORS.terracottaAccent,
            }}
          >
            {stopLabel}
          </p>
          {isPitstop && (
            <Badge variant="subtle" data-testid="pitstop-badge" className="normal-case tracking-normal">
              ☕ {t('pitstop')}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isVisited && (
            <Badge variant="visited">
              {t('visited')}
            </Badge>
          )}
        </div>
      </div>

      {/* Location Title & Neighborhood Metadata */}
      <div className="space-y-1">
        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight leading-tight break-words min-w-0 max-w-full font-sans"
          style={{ color: COLORS.textPrimary }}
        >
          {stop.name}
        </h2>
        <div
          data-testid="stop-neighborhood-metadata"
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: COLORS.textSecondary }}
        >
          <EmojiIcon name="mapPin" size="xs" />
          <span>{stop.neighborhood}</span>
        </div>
      </div>

      {/* Google Rating Badge */}
      <div
        data-testid="google-rating-badge"
        className="flex items-center gap-1.5 text-xs font-medium pt-0.5"
        style={{ color: COLORS.textSecondary }}
      >
        <span className="font-bold text-sm" style={{ color: COLORS.terracottaAccent }}>
          ★ {ratings.google.rating.toFixed(1)}
        </span>
        <span> ({ratings.google.count.toLocaleString()} reviews on Google)</span>
      </div>

      {/* Map Provider Action Buttons directly underneath location title, neighborhood metadata, and rating */}
      <div className="flex items-center gap-3 pt-1" data-testid="map-pills-row">
        <ActionButtonLink href={googleMapsUrl} ariaLabel="Open in Google Maps" title="Google Maps">
          <GoogleMapsIcon />
        </ActionButtonLink>

        <ActionButtonLink href={yandexMapsUrl} ariaLabel="Open in Yandex Maps" title="Yandex Maps">
          <YandexMapsIcon />
        </ActionButtonLink>

        {websiteUrl && (
          <ActionButtonLink href={websiteUrl} ariaLabel="Visit Website" title="Website">
            <GlobeIcon />
          </ActionButtonLink>
        )}

        {stop.instagramUrl && (
          <ActionButtonLink href={stop.instagramUrl} ariaLabel="Visit Instagram" title="Instagram">
            <InstagramIcon />
          </ActionButtonLink>
        )}
      </div>
    </div>
  );

  /* Unified Content Blocks in Standard Hierarchy */
  const renderContentBlocks = () => {
    const hasVenueDishes = Boolean(venueStop?.venueDetails.recommendedDishes && venueStop.venueDetails.recommendedDishes.length > 0);
    const hasBookingAdvice = Boolean(venueStop?.venueDetails.bookingAdvice);

    return (
      <>
        {stop.historicalSummary && (
          <div data-testid="historical-summary">
            <Callout emoji="landmark" title={t('historicalSummary')}>
              <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: COLORS.dishText }}>
                {stop.historicalSummary}
              </p>
            </Callout>
          </div>
        )}

        {stop.funFact && (
          <div data-testid="fun-fact">
            <Callout emoji="bulb" title={t('funFact')}>
              <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: COLORS.dishText }}>
                {stop.funFact}
              </p>
            </Callout>
          </div>
        )}

        {stop.olyaTips && (
          <div data-testid="olya-tip">
            <Callout emoji="chat" title={t('olyaTip')}>
              <p className="text-xs sm:text-sm italic leading-relaxed font-medium" style={{ color: COLORS.dishText }}>
                &ldquo;{stop.olyaTips}&rdquo;
              </p>
            </Callout>
          </div>
        )}

        {hasVenueDishes && (
          <RecommendedDishesSection
            dishes={venueStop!.venueDetails.recommendedDishes}
            title={t('recommendedDishes')}
          />
        )}

        {hasBookingAdvice && (
          <div data-testid="booking-advice">
            <Callout emoji="calendar" title={t('bookingAdvice')}>
              <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: COLORS.dishText }}>
                {venueStop!.venueDetails.bookingAdvice}
              </p>
            </Callout>
          </div>
        )}

        {stop.photoSpot && (
          <div data-testid="photo-spot">
            <Callout emoji="camera" title={t('photoSpotRec')}>
              <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: COLORS.dishText }}>
                {stop.photoSpot}
              </p>
            </Callout>
          </div>
        )}

        {stop.logisticsWarning && (
          <div data-testid="logistics-warning">
            <Callout emoji="warning" title={t('logisticsWarning')} variant="warning">
              <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: COLORS.dishText }}>
                {stop.logisticsWarning}
              </p>
            </Callout>
          </div>
        )}
      </>
    );
  };

  /* Part 3: Short Overview Layout for AttractionStop */
  const renderAttractionLayout = (attraction: AttractionStop) => (
    <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
      {renderHeaderBar()}

      {stop.workingHours && (
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: COLORS.textSecondary }} data-testid="working-hours-badge">
          <EmojiIcon name="clock" size="xs" />
          <span>{t('workingHours')}: {stop.workingHours}</span>
        </div>
      )}

      {attraction.transitBadge && (
        <div data-testid="transit-badge">
          <Callout emoji="funicular" title={t('transitStep')}>
            <p className="font-semibold" style={{ color: COLORS.textPrimary }}>{attraction.transitBadge}</p>
          </Callout>
        </div>
      )}

      {renderContentBlocks()}
    </div>
  );

  /* Part 3: Short Overview Layout for VenueStop */
  const renderVenueLayout = (venue: VenueStop) => (
    <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
      {renderHeaderBar()}

      <div className="flex flex-wrap items-center gap-2 pt-0.5" data-testid="venue-details-header">
        <span
          data-testid="venue-category-cuisine"
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
          style={{
            backgroundColor: COLORS.badgeBg,
            color: COLORS.badgeText,
            borderColor: COLORS.badgeBorder,
          }}
        >
          {formatCategoryCuisine(venue, t)}
        </span>
        {venue.venueDetails.isVegetarianFriendly && (
          <Badge variant="visited" data-testid="veggie-friendly-badge" className="normal-case tracking-normal text-xs font-semibold">
            {t('veggieFriendly')}
          </Badge>
        )}
      </div>

      {stop.workingHours && (
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: COLORS.textSecondary }} data-testid="working-hours-badge">
          <EmojiIcon name="clock" size="xs" />
          <span>{t('workingHours')}: {stop.workingHours}</span>
        </div>
      )}

      {renderContentBlocks()}
    </div>
  );

  return (
    <div
      data-testid="stop-card-container"
      className="relative flex flex-col h-[100dvh] w-full overflow-hidden justify-between touch-pan-x touch-pan-y overscroll-y-contain transform-gpu"
      style={{ backgroundColor: COLORS.canvasBg, color: COLORS.textPrimary }}
    >
      <div className="w-full flex-1 overflow-y-auto scrollbar-none pb-24 sm:pb-28">
        {renderVisualCover()}
        {venueStop ? renderVenueLayout(venueStop) : renderAttractionLayout(attractionStop!)}
      </div>

      {/* Photo Lightbox Modal */}
      <LightboxModal
        isOpen={isLightboxOpen}
        images={galleryImages}
        initialIndex={lightboxIndex}
        altText={stop.name}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}

export default React.memo(StopCard);
