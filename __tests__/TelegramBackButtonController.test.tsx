import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TelegramBackButtonController from '@/components/TelegramBackButtonController';
import { useTelegram } from '@/components/TelegramProvider';

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

const mockShowBackButton = vi.fn();
const mockHideBackButton = vi.fn();

vi.mock('@/components/TelegramProvider', () => ({
  useTelegram: vi.fn(),
}));

describe('TelegramBackButtonController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTelegram as any).mockReturnValue({
      showBackButton: mockShowBackButton,
      hideBackButton: mockHideBackButton,
    });
  });

  it('calls showBackButton on mount and hideBackButton on unmount', () => {
    const { unmount } = render(<TelegramBackButtonController />);
    expect(mockShowBackButton).toHaveBeenCalledTimes(1);

    unmount();
    expect(mockHideBackButton).toHaveBeenCalledTimes(1);
  });

  it('navigates with router.push("/") when history.length <= 1 and no custom onBack is provided', () => {
    let capturedHandler: (() => void) | undefined;
    mockShowBackButton.mockImplementation((handler: () => void) => {
      capturedHandler = handler;
    });

    render(<TelegramBackButtonController />);

    expect(capturedHandler).toBeDefined();
    act(() => {
      capturedHandler?.();
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('executes custom onBack callback when provided', () => {
    const customOnBack = vi.fn();
    let capturedHandler: (() => void) | undefined;
    mockShowBackButton.mockImplementation((handler: () => void) => {
      capturedHandler = handler;
    });

    render(<TelegramBackButtonController onBack={customOnBack} />);

    act(() => {
      capturedHandler?.();
    });

    expect(customOnBack).toHaveBeenCalledTimes(1);
  });
});
