import { useEffect, useMemo, useRef, useState } from "react";
import { defaultTextSize } from "./types/photo";
import type {
  FilterId,
  FrameId,
  LayoutId,
  Photo,
  PhotoTransform,
  Screen,
  Settings,
  TextAlignment,
  TextSize,
  TypographyId,
} from "./types/photo";
import { frames, frameById } from "./frames/presets";
import { filterById } from "./filters/presets";
import { defaultSkinRetouch } from "./filters/skin-retouch";
import type { SkinRetouchLevel } from "./filters/skin-retouch";
import { layoutById } from "./layouts/presets";
import { defaultTypographyId, typographyById } from "./typography/presets";
import { capture, compose, name } from "./utils/photo";
import { useCamera } from "./hooks/useCamera";
import { PhotoStrip } from "./components/PhotoStrip";
import { PhotoEditor } from "./components/PhotoEditor";
import { FilterSelector } from "./components/FilterSelector";
import { LayoutSelector } from "./components/LayoutSelector";
import { TypographySelector } from "./components/TypographySelector";
import { defaultTransform } from "./utils/crop";
import {
  canSharePhoto,
  createPhotoFile,
  downloadBlob,
  messageLimit,
  truncateMessage,
} from "./utils/result";
import "./edit.css";
import "./layout.css";
import "./mobile-polish.css";
import "./portrait-retouch.css";
import { captureProgress, nextCaptureFeedback } from "./utils/capture-feedback";
import type { CaptureFeedback } from "./utils/capture-feedback";
import { CaptureCountdownOverlay } from "./components/CaptureCountdownOverlay";
import { canCaptureManually, defaultCaptureMode, isCaptureComplete, nextCaptureCount } from "./utils/capture-session";
const wait = (n: number) => new Promise((r) => setTimeout(r, n));
function Landing({ go }: { go: () => void }) {
  return (
    <main className="landing">
      <i>
        GAMSUNG
        <br />
        PHOTO STUDIO
      </i>
      <section>
        <h1>감성사진관</h1>
        <p>
          오래 남기고 싶은 순간을
          <br />네 장의 사진으로.
        </p>
      </section>
      <button className="primary" onClick={go}>
        시작하기
      </button>
    </main>
  );
}
function Setup({
  s,
  set,
  go,
}: {
  s: Settings;
  set: (x: Partial<Settings>) => void;
  go: () => void;
}) {
  return (
    <main className="screen setup">
      <header>
        <em>촬영 준비</em>
        <h1>잠시만 설정할게요.</h1>
      </header>
      <article>
        <span>촬영 방식</span>
        <nav>
          <button
            className={s.captureMode === "auto" ? "on" : ""}
            onClick={() => set({ captureMode: "auto" })}
          >
            자동 촬영
          </button>
          <button
            className={s.captureMode === "manual" ? "on" : ""}
            onClick={() => set({ captureMode: "manual" })}
          >
            수동 촬영
          </button>
        </nav>
      </article>
      {s.captureMode === "auto" && (
        <article>
          <span>촬영 간격</span>
          <nav>
            {([3, 5, 10] as const).map((n) => (
              <button
                className={s.interval === n ? "on" : ""}
                onClick={() => set({ interval: n })}
              >
                {n}초
              </button>
            ))}
          </nav>
        </article>
      )}
      <article>
        <span>카메라</span>
        <nav>
          <button
            className={s.facingMode === "user" ? "on" : ""}
            onClick={() => set({ facingMode: "user" })}
          >
            전면
          </button>
          <button
            className={s.facingMode === "environment" ? "on" : ""}
            onClick={() => set({ facingMode: "environment" })}
          >
            후면
          </button>
        </nav>
      </article>
      <button className="primary" onClick={go}>
        촬영 시작하기
      </button>
    </main>
  );
}
function Capture({
  s,
  done,
  cancel,
}: {
  s: Settings;
  done: (p: Photo[]) => void;
  cancel: () => void;
}) {
  const { ref, ready, error, start, stop } = useCamera(s),
    [number, setNumber] = useState<number | null>(null),
    [running, setRunning] = useState(false),
    [feedback, setFeedback] = useState<CaptureFeedback>("idle"),
    [captureIndex, setCaptureIndex] = useState(0),
    manualPhotos = useRef<Photo[]>([]);
  useEffect(() => {
    void start();
    return stop;
  }, [start, stop]);
  const advanceFeedback = () =>
    setFeedback((current) => nextCaptureFeedback(current));
  const captureOne = async (photos: Photo[]) => {
    if (!ref.current) return false;
    advanceFeedback(); await wait(160);
    const blob = await capture(ref.current, s.facingMode === "user");
    photos.push({ id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) });
    try { navigator.vibrate?.(12); } catch { /* unsupported */ }
    setCaptureIndex(nextCaptureCount(photos.length - 1));
    advanceFeedback(); await wait(240); advanceFeedback();
    return isCaptureComplete(photos.length);
  };
  const shoot = async () => {
    setRunning(true);
    setNumber(-1);
    await wait(850);
    const photos: Photo[] = [];
    for (let n = 0; n < 8; n++) {
      for (let i = n ? s.interval : 3; i > 0; i--) {
        setNumber(i);
        await wait(1000);
      }
      setNumber(null);
      await captureOne(photos);
    }
    stop();
    done(photos);
  };
  const shootManual = async () => {
    if (!canCaptureManually({ ready, capturing: running, count: manualPhotos.current.length })) return;
    setRunning(true);
    const complete = await captureOne(manualPhotos.current);
    setRunning(false);
    if (complete) { stop(); done(manualPhotos.current); }
  };
  return (
    <main className="capture">
      <div className="bar">
        <button
          onClick={() => {
            stop();
            cancel();
          }}
        >
          ×
        </button>
        <output className="capture-progress" aria-live="polite">
          {captureProgress(captureIndex)}
        </output>
      </div>
      {error ? (
        <section className="error">
          <p>{error}</p>
        </section>
      ) : (
        <>
          <video
            ref={ref}
            autoPlay
            muted
            playsInline
            className={s.facingMode === "user" ? "mirror" : ""}
          />
          {number !== null && <CaptureCountdownOverlay value={number} />}{" "}
          {feedback === "flash" && <div className="flash" aria-hidden="true" />}
          {feedback === "captured" && (
            <div
              className="capture-confirmation"
              role="status"
              aria-label="사진이 촬영되었습니다"
            >
              <span aria-hidden="true">✓</span>
            </div>
          )}
          <footer>
            {s.captureMode === "auto" ? ready && !running && <button className="shutter" onClick={() => void shoot()} /> : <button className="shutter" disabled={!canCaptureManually({ ready, capturing: running, count: manualPhotos.current.length })} onClick={() => void shootManual()} />}
          </footer>
        </>
      )}
    </main>
  );
}
function Edit({
  photos,
  frame,
  setFrame,
  filter,
  setFilter,
  skinRetouch,
  setSkinRetouch,
  layout,
  setLayout,
  transforms,
  setTransform,
  date,
  onDate,
  message,
  onMessage,
  typography,
  setTypography,
  alignment,
  setAlignment,
  textSize,
  setTextSize,
  finish,
}: {
  photos: Photo[];
  frame: FrameId;
  setFrame: (v: FrameId) => void;
  filter: FilterId;
  setFilter: (v: FilterId) => void;
  skinRetouch: SkinRetouchLevel;
  setSkinRetouch: (value: SkinRetouchLevel) => void;
  layout: LayoutId;
  setLayout: (v: LayoutId) => void;
  transforms: Record<string, PhotoTransform>;
  setTransform: (id: string, v: PhotoTransform) => void;
  date: boolean;
  onDate: (v: boolean) => void;
  message: string;
  onMessage: (v: string) => void;
  typography: TypographyId;
  setTypography: (v: TypographyId) => void;
  alignment: TextAlignment;
  setAlignment: (v: TextAlignment) => void;
  textSize: TextSize;
  setTextSize: (v: TextSize) => void;
  finish: () => void;
}) {
  const [tab, setTab] = useState("photo"),
    [active, setActive] = useState(photos[0].id),
    photo = photos.find((p) => p.id === active) ?? photos[0],
    preset = layoutById(layout),
    slot = preset.slots[photos.findIndex((item) => item.id === photo.id)];
  return (
    <main className="screen edit">
      <header>
        <em>사진 꾸미기</em>
        <h1>오늘의 네 컷</h1>
      </header>
      <PhotoStrip
        photos={photos}
        frame={frameById(frame)}
        layout={preset}
        filter={filterById(filter)}
        skinRetouch={skinRetouch}
        transforms={transforms}
        active={active}
        onSelect={setActive}
        message={message}
        showDate={date}
        typography={typographyById(typography)}
        alignment={alignment}
        textSize={textSize}
      />
      <nav className="edit-tabs">
        {[
          ["photo", "사진"],
          ["filter", "필터"],
          ["frame", "프레임"],
          ["layout", "레이아웃"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "on" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <section className="edit-options">
        {tab === "photo" ? (
          <PhotoEditor
            photo={photo}
            layout={preset}
            slot={slot}
            value={transforms[photo.id] ?? defaultTransform}
            onChange={(value) => setTransform(photo.id, value)}
          />
        ) : tab === "filter" ? (
          <>
            <FilterSelector photo={photo} value={filter} onChange={setFilter} skinRetouch={skinRetouch} />
            <section className="portrait-retouch" aria-label="피부 보정">
              <span>피부 보정</span>
              <nav>
                {([['none','없음'],['natural','자연스럽게'],['clean','깨끗하게'],['booth','부스']] as const).map(([value,label])=><button key={value} aria-pressed={skinRetouch===value} className={skinRetouch===value ? "active" : ""} onClick={() => setSkinRetouch(value)}>{label}</button>)}
              </nav>
            </section>
          </>
        ) : tab === "frame" ? (
          <nav className="frames">
            {frames.map((item) => (
              <button
                key={item.id}
                className={item.id === frame ? "active" : ""}
                onClick={() => setFrame(item.id)}
              >
                <i style={{ background: item.background }} />
                {item.name}
              </button>
            ))}
          </nav>
        ) : (
          <LayoutSelector value={layout} onChange={setLayout} />
        )}
      </section>
      <section className="metadata">
        <label className="message">
          <span>메시지</span>
          <input
            value={message}
            maxLength={messageLimit}
            placeholder="기억하고 싶은 한마디를 남겨보세요"
            onChange={(event) => onMessage(truncateMessage(event.target.value))}
          />
          <small>
            {message.length} / {messageLimit}
          </small>
        </label>
        <TypographySelector
          typography={typography}
          alignment={alignment}
          textSize={textSize}
          onTypographyChange={setTypography}
          onAlignmentChange={setAlignment}
          onTextSizeChange={setTextSize}
        />
        <label className="date-toggle">
          <input
            type="checkbox"
            checked={date}
            onChange={(event) => onDate(event.target.checked)}
          />{" "}
          날짜 표시
        </label>
      </section>
      <button className="primary" onClick={finish}>
        완성하기
      </button>
    </main>
  );
}
const defaultTextAlignment: TextAlignment = "center";
export default function App() {
  const [screen, setScreen] = useState<Screen>("landing"),
    [s, setS] = useState<Settings>({ interval: 5, facingMode: "user", captureMode: defaultCaptureMode }),
    [photos, setPhotos] = useState<Photo[]>([]),
    [ids, setIds] = useState<string[]>([]),
    [frame, setFrame] = useState<FrameId>("white"),
    [filter, setFilter] = useState<FilterId>("original"),
    [skinRetouch, setSkinRetouch] = useState<SkinRetouchLevel>(defaultSkinRetouch),
    [layout, setLayout] = useState<LayoutId>("classic"),
    [transforms, setTransforms] = useState<Record<string, PhotoTransform>>({}),
    [date, setDate] = useState(true),
    [message, setMessage] = useState(""),
    [typography, setTypography] = useState<TypographyId>(defaultTypographyId),
    [alignment, setAlignment] = useState<TextAlignment>(defaultTextAlignment),
    [textSize, setTextSize] = useState<TextSize>(defaultTextSize),
    [blob, setBlob] = useState<Blob | null>(null),
    [url, setUrl] = useState<string | null>(null);
  const selected = useMemo(
    () =>
      ids
        .map((id) => photos.find((p) => p.id === id))
        .filter((p): p is Photo => !!p),
    [ids, photos],
  );
  const finish = async () => {
    const b = await compose(
      selected,
      frameById(frame),
      filterById(filter),
      transforms,
      date,
      message,
      new Date(),
      layoutById(layout),
      typographyById(typography),
      alignment,
      textSize,
      skinRetouch,
    );
    if (url) URL.revokeObjectURL(url);
    setBlob(b);
    setUrl(URL.createObjectURL(b));
    setScreen("result");
  };
  if (screen === "landing") return <Landing go={() => setScreen("setup")} />;
  if (screen === "setup")
    return (
      <Setup
        s={s}
        set={(x) => setS((v) => ({ ...v, ...x }))}
        go={() => setScreen("capture")}
      />
    );
  if (screen === "capture")
    return (
      <Capture
        s={s}
        done={(p) => {
          setPhotos(p);
          setTransforms(
            Object.fromEntries(p.map((x) => [x.id, defaultTransform])),
          );
          setLayout("classic");
          setScreen("select");
        }}
        cancel={() => setScreen("setup")}
      />
    );
  if (screen === "select")
    return (
      <main className="screen">
        <header>
          <em>사진 고르기</em>
          <h1>네 장을 골라주세요.</h1>
        </header>
        <div className="grid">
          {photos.map((p, i) => {
            const n = ids.indexOf(p.id);
            return (
              <button
                className={n >= 0 ? "chosen" : ""}
                onClick={() =>
                  setIds((x) =>
                    x.includes(p.id)
                      ? x.filter((id) => id !== p.id)
                      : x.length < 4
                        ? [...x, p.id]
                        : x,
                  )
                }
              >
                <img src={p.url} alt={`${i + 1}번째 사진`} />
                {n >= 0 && <b>{n + 1}</b>}
              </button>
            );
          })}
        </div>
        <button
          className="primary"
          disabled={ids.length !== 4}
          onClick={() => setScreen("edit")}
        >
          꾸미러 가기
        </button>
      </main>
    );
  if (screen === "edit")
    return (
      <Edit
        photos={selected}
        frame={frame}
        setFrame={setFrame}
        filter={filter}
        setFilter={setFilter}
        skinRetouch={skinRetouch}
        setSkinRetouch={setSkinRetouch}
        layout={layout}
        setLayout={setLayout}
        transforms={transforms}
        setTransform={(id, v) => setTransforms((x) => ({ ...x, [id]: v }))}
        date={date}
        onDate={setDate}
        message={message}
        onMessage={setMessage}
        typography={typography}
        setTypography={setTypography}
        alignment={alignment}
        setAlignment={setAlignment}
        textSize={textSize}
        setTextSize={setTextSize}
        finish={() => void finish()}
      />
    );
  const file = blob ? createPhotoFile(blob, name()) : null;
  return (
    <main className="screen result">
      <header>
        <em>오늘의 순간</em>
        <h1>완성됐어요.</h1>
      </header>
      {url && <img src={url} alt="완성된 네컷" />}
      <footer className="result-actions">
        <button
          className="primary"
          onClick={() =>
            file &&
            canSharePhoto(file) &&
            void navigator.share({ files: [file] })
          }
        >
          공유하기
        </button>
        <button onClick={() => blob && downloadBlob(blob, name())}>
          사진 저장
        </button>
        <button onClick={() => setScreen("edit")}>다시 편집</button>
        <button
          onClick={() => {
            setLayout("classic");
            setTypography(defaultTypographyId);
            setAlignment(defaultTextAlignment);
            setTextSize(defaultTextSize);
            setSkinRetouch(defaultSkinRetouch);
            setIds([]);
            setScreen("landing");
          }}
        >
          새로 찍기
        </button>
      </footer>
    </main>
  );
}
