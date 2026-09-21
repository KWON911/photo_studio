import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BottomActionBar, FlowHeader } from './FlowChrome';

describe('flow chrome', () => {
  it('announces the current step and labels the back control', () => {
    const markup = renderToStaticMarkup(
      <FlowHeader eyebrow="사진 고르기" title="네 장을 골라주세요." step={3} onBack={() => undefined} backLabel="다시 촬영하기" />,
    );

    expect(markup).toContain('aria-label="다시 촬영하기"');
    expect(markup).toContain('aria-label="전체 5단계 중 3단계"');
    expect(markup).toContain('tabindex="-1"');
  });

  it('renders a persistent action container', () => {
    const markup = renderToStaticMarkup(
      <BottomActionBar><button type="button">계속</button></BottomActionBar>,
    );

    expect(markup).toContain('bottom-action-bar');
    expect(markup).toContain('계속');
  });
});
