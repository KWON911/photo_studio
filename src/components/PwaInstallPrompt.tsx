import { useEffect, useState } from 'react';

type InstallChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

type StandaloneNavigator = Navigator & { standalone?: boolean };

export function isStandaloneDisplay(
  matches = window.matchMedia('(display-mode: standalone)').matches,
  navigatorStandalone = (navigator as StandaloneNavigator).standalone === true,
) {
  return matches || navigatorStandalone;
}

export function isIosSafari(
  userAgent = navigator.userAgent,
  platform = navigator.platform,
  maxTouchPoints = navigator.maxTouchPoints,
) {
  const isIos = /iPad|iPhone|iPod/.test(userAgent)
    || (platform === 'MacIntel' && maxTouchPoints > 1);
  const isSafari = /Safari/.test(userAgent)
    && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);

  return isIos && isSafari;
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [standalone, setStandalone] = useState(() => isStandaloneDisplay());
  const [showIosHint] = useState(() => isIosSafari());

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const updateStandalone = () => setStandalone(isStandaloneDisplay());
    const rememberInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const markInstalled = () => {
      setInstallPrompt(null);
      setStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', rememberInstallPrompt);
    window.addEventListener('appinstalled', markInstalled);
    displayMode.addEventListener('change', updateStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', rememberInstallPrompt);
      window.removeEventListener('appinstalled', markInstalled);
      displayMode.removeEventListener('change', updateStandalone);
    };
  }, []);

  if (standalone) return null;

  const install = async () => {
    if (!installPrompt || installing) return;

    setInstalling(true);
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(null);
      setInstalling(false);
    }
  };

  if (installPrompt) {
    return (
      <button className="pwa-install-button" type="button" disabled={installing} onClick={install}>
        {installing ? '설치 중…' : '앱으로 설치'}
      </button>
    );
  }

  if (showIosHint) {
    return (
      <p className="pwa-install-hint">
        iPhone에서는 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택하세요.
      </p>
    );
  }

  return null;
}
