import type {
  LayoutPreset,
  TextAlignment,
  TypographyPreset,
} from '../types/photo';

export type FooterTextLayoutOptions = {
  layout: LayoutPreset;
  typography: TypographyPreset;
  alignment: TextAlignment;
  hasMessage: boolean;
  hasDate: boolean;
  outputWidth: number;
};

export type FooterTextLayout = {
  contentLeft: number;
  contentRight: number;
  anchorX: number;
  canvasAlign: CanvasTextAlign;
  messageSize: number;
  dateSize: number;
  brandSize: number;
  messageY: number;
  dateY: number;
  brandY: number;
};

const BASELINE_RATIO = 0.72;
const HORIZONTAL_PADDING_RATIO = 0.08;
const LINE_GAP_RATIO = 0.008;

export function getFooterTextLayout({
  layout,
  alignment,
  hasMessage,
  hasDate,
  outputWidth,
}: FooterTextLayoutOptions): FooterTextLayout {
  const outputHeight = outputWidth / layout.previewAspectRatio;
  const footerTop = layout.footerY * outputHeight;
  const footerHeight = layout.footerHeight * outputHeight;
  const contentLeft = outputWidth * HORIZONTAL_PADDING_RATIO;
  const contentRight = outputWidth - contentLeft;
  const messageSize = outputWidth * 0.03;
  const dateSize = outputWidth * 0.021;
  const brandSize = outputWidth * 0.017;
  const gap = outputWidth * LINE_GAP_RATIO;
  const visibleSizes = [
    ...(hasMessage ? [messageSize] : []),
    ...(hasDate ? [dateSize] : []),
    brandSize,
  ];
  const contentHeight =
    visibleSizes.reduce((total, size) => total + size, 0) +
    gap * (visibleSizes.length - 1);
  let cursorY = footerTop + (footerHeight - contentHeight) / 2;
  let messageY = cursorY + messageSize * BASELINE_RATIO;
  let dateY = messageY;

  if (hasMessage) cursorY += messageSize + gap;
  if (hasDate) {
    dateY = cursorY + dateSize * BASELINE_RATIO;
    cursorY += dateSize + gap;
  }

  const brandY = cursorY + brandSize * BASELINE_RATIO;
  if (!hasMessage) messageY = hasDate ? dateY : brandY;
  if (!hasDate) dateY = brandY;

  const anchorX =
    alignment === 'left'
      ? contentLeft
      : alignment === 'right'
        ? contentRight
        : outputWidth / 2;

  return {
    contentLeft,
    contentRight,
    anchorX,
    canvasAlign: alignment,
    messageSize,
    dateSize,
    brandSize,
    messageY,
    dateY,
    brandY,
  };
}
