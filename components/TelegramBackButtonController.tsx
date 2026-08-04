'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/components/TelegramProvider';

interface TelegramBackButtonControllerProps {
  onBack?: () => void;
}

export default function TelegramBackButtonController({ onBack }: TelegramBackButtonControllerProps) {
  const { showBackButton, hideBackButton } = useTelegram();
  const router = useRouter();

  useEffect(() => {
    const handleBack = onBack || (() => {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    });

    showBackButton(handleBack);

    return () => {
      hideBackButton();
    };
  }, [showBackButton, hideBackButton, onBack, router]);

  return null;
}
