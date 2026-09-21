import type { ReactNode } from 'react';

export function FlowHeader({
  eyebrow,
  title,
  step,
  onBack,
  backLabel = '이전 단계',
}: {
  eyebrow: string;
  title: string;
  step: number;
  onBack: () => void;
  backLabel?: string;
}) {
  return (
    <header className="flow-header">
      <div className="flow-navigation">
        <button type="button" className="back-button" aria-label={backLabel} onClick={onBack}>
          <span>이전</span>
        </button>
        <span className="flow-step" aria-label={`전체 5단계 중 ${step}단계`}>
          {step} / 5
        </span>
      </div>
      <em>{eyebrow}</em>
      <h1 tabIndex={-1}>{title}</h1>
    </header>
  );
}

export function BottomActionBar({ children }: { children: ReactNode }) {
  return <footer className="bottom-action-bar">{children}</footer>;
}
