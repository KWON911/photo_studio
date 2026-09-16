import type { TextAlignment, TextSize, TypographyId } from '../types/photo';
import { typography as typographyPresets } from '../typography/presets';

const alignments: Array<{ id: TextAlignment; label: string; glyph: string }> = [
  { id: 'left', label: '왼쪽 정렬', glyph: '≡' },
  { id: 'center', label: '가운데 정렬', glyph: '≡' },
  { id: 'right', label: '오른쪽 정렬', glyph: '≡' },
];

const textSizes = [
  { id: 'small', label: '작게' },
  { id: 'medium', label: '기본' },
  { id: 'large', label: '크게' },
] as const;

export function TypographySelector({
  typography,
  alignment,
  textSize,
  onTypographyChange,
  onAlignmentChange,
  onTextSizeChange,
}: {
  typography: TypographyId;
  alignment: TextAlignment;
  textSize: TextSize;
  onTypographyChange: (id: TypographyId) => void;
  onAlignmentChange: (id: TextAlignment) => void;
  onTextSizeChange: (size: TextSize) => void;
}) {
  return (
    <div className="typography-selector">
      <div className="typography-row">
        <span id="typography-label">글꼴</span>
        <div className="typography-options" role="group" aria-labelledby="typography-label">
          {typographyPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={preset.id === typography ? 'active' : ''}
              style={{ fontFamily: preset.fontFamily }}
              aria-pressed={preset.id === typography}
              onClick={() => onTypographyChange(preset.id)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      <div className="typography-row">
        <span id="alignment-label">정렬</span>
        <div className="alignment-options" role="group" aria-labelledby="alignment-label">
          {alignments.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${option.id} ${option.id === alignment ? 'active' : ''}`.trim()}
              aria-label={option.label}
              aria-pressed={option.id === alignment}
              onClick={() => onAlignmentChange(option.id)}
            >
              <span aria-hidden="true">{option.glyph}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="typography-row">
        <span id="text-size-label">글자 크기</span>
        <div className="alignment-options" role="group" aria-labelledby="text-size-label">
          {textSizes.map((size) => (
            <button
              key={size.id}
              type="button"
              className={size.id === textSize ? 'active' : ''}
              aria-pressed={size.id === textSize}
              onClick={() => onTextSizeChange(size.id)}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
