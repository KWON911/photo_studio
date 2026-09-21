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
  isIOSDevice,
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
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";
import { BottomActionBar, FlowHeader } from "./components/FlowChrome";
import "./pwa.css";
import "./usability.css";
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
      <div className="landing-actions">
        <PwaInstallPrompt />
        <button className="primary" onClick={go}>
          시작하기
        </button>
      </div>
    </main>
  );
}
function Setup({
  s,
  set,
  go,
  back,
}: {
  s: Settings;
  set: (x: Partial<Settings>) => void;
  go: () => void;
  back: () => void;
}) {
  return (
    <main className="screen setup has-bottom-actions">
      <FlowHeader eyebrow="촬영 준비" title="잠시만 설정할게요." step={1} onBack={back} backLabel="시작 화면으로" />
      <p className="setup-note">사진 8장을 촬영한 뒤 마음에 드는 4장을 고릅니다.</p>
      <article>
        <span>촬영 방식</span>
        <nav>
          <button
            type="button"
            aria-pressed={s.captureMode === "auto"}
            className={s.captureMode === "auto" ? "on" : ""}
            onClick={() => set({ captureMode: "auto" })}
          >
            자동 촬영 · 추천
          </button>
          <button
            type="button"
            aria-pressed={s.captureMode === "manual"}
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
                type="button"
                aria-pressed={s.interval === n}
                className={s.interval === n ? "on" : ""}
                onClick={() => set({ interval: n })}
              >
                {n}초{n === 5 ? " · 추천" : ""}
              </button>
            ))}
          </nav>
        </article>
      )}
      <article>
        <span>카메라</span>
        <nav>
          <button
            type="button"
            aria-pressed={s.facingMode === "user"}
            className={s.facingMode === "user" ? "on" : ""}
            onClick={() => set({ facingMode: "user" })}
          >
            전면
          </button>
          <button
            type="button"
            aria-pressed={s.facingMode === "environment"}
            className={s.facingMode === "environment" ? "on" : ""}
            onClick={() => set({ facingMode: "environment" })}
          >
            후면
          </button>
        </nav>
      </article>
      <BottomActionBar>
        <button type="button" className="primary" onClick={go}>
          촬영 시작하기
        </button>
      </BottomActionBar>
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
    manualPhotos = useRef<Photo[]>([]),
    cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    void start();
    return () => {
      cancelled.current = true;
    };
  }, [start]);
  const advanceFeedback = () =>
    setFeedback((current) => nextCaptureFeedback(current));
  const captureOne = async (photos: Photo[]) => {
    if (!ref.current || cancelled.current) return false;
    advanceFeedback(); await wait(160);
    if (!ref.current || cancelled.current) return false;
    const blob = await capture(ref.current, s.facingMode === "user");
    if (cancelled.current) return false;
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
    if (cancelled.current) return;
    const photos: Photo[] = [];
    for (let n = 0; n < 8; n++) {
      for (let i = n ? s.interval : 3; i > 0; i--) {
        if (cancelled.current) return;
        setNumber(i);
        await wait(1000);
      }
      if (cancelled.current) return;
      setNumber(null);
      await captureOne(photos);
    }
    if (cancelled.current) return;
    stop();
    done(photos);
  };
  const shootManual = async () => {
    if (!canCaptureManually({ ready, capturing: running, count: manualPhotos.current.length })) return;
    setRunning(true);
    const complete = await captureOne(manualPhotos.current);
    if (cancelled.current) return;
    setRunning(false);
    if (complete) { stop(); done(manualPhotos.current); }
  };
  const leaveCapture = () => {
    const hasProgress = running || captureIndex > 0 || manualPhotos.current.length > 0;
    if (hasProgress && !window.confirm("촬영을 중단하고 이전 화면으로 돌아갈까요?")) return;
    cancelled.current = true;
    stop();
    cancel();
  };
  return (
    <main className="capture">
      <div className="bar">
        <button type="button" aria-label="촬영 설정으로 돌아가기" onClick={leaveCapture}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28">
            <path d="M5 5 19 19M19 5 5 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="capture-flow-step" aria-label="전체 5단계 중 2단계">2 / 5</span>
        <output className="capture-progress" aria-live="polite">
          {captureProgress(captureIndex)}
        </output>
      </div>
      <div className="capture-settings" aria-label="현재 촬영 설정">
        {s.captureMode === "auto" ? `자동 · ${s.interval}초` : "수동"} · {s.facingMode === "user" ? "전면" : "후면"}
      </div>
      {error ? (
        <section className="error">
          <p>{error}</p>
          <button type="button" onClick={() => void start()}>다시 시도</button>
          <small>브라우저 설정에서 카메라 권한을 허용해 주세요.</small>
        </section>
      ) : (
        <>
          <video
            ref={ref}
            autoPlay
            muted
            playsInline
            className={`${s.facingMode === "user" ? "mirror " : ""}${ready ? "camera-ready" : ""}`.trim()}
          />
          {number !== null && <CaptureCountdownOverlay value={number} />}{" "}
          {!ready && <p className="camera-loading" role="status">카메라 준비 중…</p>}
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
            {s.captureMode === "auto" ? ready && !running && <button type="button" className="shutter" aria-label="자동 촬영 시작" onClick={() => void shoot()} /> : <button type="button" className="shutter" aria-label="사진 촬영" disabled={!canCaptureManually({ ready, capturing: running, count: manualPhotos.current.length })} onClick={() => void shootManual()} />}
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
  back,
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
  finish: () => Promise<void>;
  back: () => void;
}) {
  const [tab, setTab] = useState("photo"),
    [active, setActive] = useState(photos[0].id),
    [finishing, setFinishing] = useState(false),
    [finishError, setFinishError] = useState(""),
    photo = photos.find((p) => p.id === active) ?? photos[0],
    preset = layoutById(layout),
    slot = preset.slots[photos.findIndex((item) => item.id === photo.id)];
  const complete = async () => {
    if (finishing) return;
    setFinishError("");
    setFinishing(true);
    try {
      await finish();
    } catch {
      setFinishError("사진을 완성하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setFinishing(false);
    }
  };
  return (
    <main className="screen edit has-bottom-actions">
      <FlowHeader eyebrow="사진 꾸미기" title="오늘의 네 컷" step={4} onBack={back} backLabel="사진 선택으로 돌아가기" />
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
      <nav className="edit-tabs" role="tablist" aria-label="편집 도구">
        {[
          ["photo", "사진"],
          ["tone", "색감"],
          ["design", "디자인"],
          ["text", "문구"],
        ].map(([id, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls="edit-panel"
            key={id}
            className={tab === id ? "on" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <section id="edit-panel" className="edit-options" role="tabpanel">
        {tab === "photo" ? (
          <>
            <nav className="photo-selector" aria-label="편집할 사진 선택">
              {photos.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={item.id === photo.id}
                  aria-label={`${index + 1}번째 사진 편집`}
                  className={item.id === photo.id ? "active" : ""}
                  onClick={() => setActive(item.id)}
                >
                  <img src={item.url} alt="" />
                  <span>{index + 1}</span>
                </button>
              ))}
            </nav>
            <PhotoEditor
              photo={photo}
              layout={preset}
              slot={slot}
              value={transforms[photo.id] ?? defaultTransform}
              onChange={(value) => setTransform(photo.id, value)}
            />
          </>
        ) : tab === "tone" ? (
          <>
            <FilterSelector photo={photo} value={filter} onChange={setFilter} skinRetouch={skinRetouch} />
            <section className="portrait-retouch" aria-label="피부 보정">
              <span>피부 보정</span>
              <nav>
                {([['none','끔'],['booth','스튜디오']] as const).map(([value,label])=><button type="button" key={value} aria-pressed={skinRetouch===value} className={skinRetouch===value ? "active" : ""} onClick={() => setSkinRetouch(value)}>{label}</button>)}
              </nav>
            </section>
          </>
        ) : tab === "design" ? (
          <div className="design-options">
            <section className="option-group">
              <h2>프레임</h2>
              <nav className="frames" aria-label="프레임 선택">
                {frames.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={item.id === frame}
                    className={item.id === frame ? "active" : ""}
                    onClick={() => setFrame(item.id)}
                  >
                    <i aria-hidden="true" className={`frame-swatch ${item.decoration ?? 'plain'}`} style={{ background: item.background, color: item.color }} />
                    {item.name}
                  </button>
                ))}
              </nav>
            </section>
            <section className="option-group">
              <h2>레이아웃</h2>
              <LayoutSelector value={layout} onChange={setLayout} />
            </section>
          </div>
        ) : (
          <section className="metadata">
            <label className="message">
              <span>메시지</span>
              <input
                value={message}
                maxLength={messageLimit}
                placeholder="기억하고 싶은 한마디를 남겨보세요"
                onChange={(event) => onMessage(truncateMessage(event.target.value))}
              />
              <small>{message.length} / {messageLimit}</small>
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
              <input type="checkbox" checked={date} onChange={(event) => onDate(event.target.checked)} />
              날짜 표시
            </label>
          </section>
        )}
      </section>
      {finishError && <p className="completion-error" role="alert">{finishError}</p>}
      <BottomActionBar>
        <button type="button" className="primary" disabled={finishing} onClick={() => void complete()}>
          {finishing ? "완성하는 중…" : "완성하기"}
        </button>
      </BottomActionBar>
    </main>
  );
}
function Result({
  blob,
  url,
  edit,
  newShot,
}: {
  blob: Blob | null;
  url: string | null;
  edit: () => void;
  newShot: () => void;
}) {
  const [feedback, setFeedback] = useState(""),
    file = blob ? createPhotoFile(blob, name()) : null,
    shareAvailable = !!file && canSharePhoto(file),
    saveToPhotos = isIOSDevice() && shareAvailable;
  const share = async () => {
    if (!file || !shareAvailable) return;
    try {
      await navigator.share({ files: [file] });
      setFeedback("공유를 완료했습니다.");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setFeedback("공유하지 못했습니다. 사진 저장을 이용해 주세요.");
    }
  };
  const save = async () => {
    if (!blob) return;
    if (saveToPhotos && file) {
      try {
        await navigator.share({ files: [file] });
        setFeedback("공유 메뉴에서 ‘이미지 저장’을 선택하면 사진 앱에 저장됩니다.");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setFeedback("사진 앱에 저장할 수 없습니다. 공유 메뉴를 다시 열어 주세요.");
      }
      return;
    }
    downloadBlob(blob, name());
    setFeedback("사진 저장을 시작했습니다.");
  };
  return (
    <main className="screen result">
      <FlowHeader eyebrow="오늘의 순간" title="완성됐어요." step={5} onBack={edit} backLabel="다시 편집하기" />
      {url && <img src={url} alt="완성된 네컷" />}
      <footer className="result-actions">
        {shareAvailable ? (
          <>
            <button type="button" className="primary" onClick={() => void share()}>공유하기</button>
            <button type="button" onClick={() => void save()}>{saveToPhotos ? "사진에 저장" : "사진 저장"}</button>
          </>
        ) : (
          <button type="button" className="primary" onClick={() => void save()}>{saveToPhotos ? "사진에 저장" : "사진 저장"}</button>
        )}
        <button type="button" onClick={edit}>다시 편집</button>
        <button type="button" className="quiet-action" onClick={newShot}>새로 찍기</button>
      </footer>
      {feedback && <p className="result-feedback" role="status">{feedback}</p>}
    </main>
  );
}
const defaultTextAlignment: TextAlignment = "center";
const flowScreens: Screen[] = ["landing", "setup", "capture", "select", "edit", "result"];
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
    [url, setUrl] = useState<string | null>(null),
    navigationSession = useRef(crypto.randomUUID());
  const selected = useMemo(
    () =>
      ids
        .map((id) => photos.find((p) => p.id === id))
        .filter((p): p is Photo => !!p),
    [ids, photos],
  );
  useEffect(() => {
    window.history.replaceState({ photoStudioScreen: "landing", photoStudioSession: navigationSession.current }, "");
    const restoreScreen = (event: PopStateEvent) => {
      const next = event.state?.photoStudioScreen as Screen | undefined;
      const sameSession = event.state?.photoStudioSession === navigationSession.current;
      if (!sameSession || !next || !flowScreens.includes(next)) {
        window.history.replaceState({ photoStudioScreen: "landing", photoStudioSession: navigationSession.current }, "");
        setScreen("landing");
        return;
      }
      setScreen(next);
    };
    window.addEventListener("popstate", restoreScreen);
    return () => window.removeEventListener("popstate", restoreScreen);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(".screen h1")?.focus({ preventScroll: true }));
  }, [screen]);
  const navigate = (next: Screen, replace = false) => {
    const state = { photoStudioScreen: next, photoStudioSession: navigationSession.current };
    if (replace) window.history.replaceState(state, "");
    else window.history.pushState(state, "");
    setScreen(next);
  };
  const goBack = (fallback: Screen) => {
    const current = window.history.state?.photoStudioScreen as Screen | undefined;
    if (current === screen && screen !== "landing") window.history.back();
    else navigate(fallback, true);
  };
  const discardPhotos = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    setPhotos([]);
    setIds([]);
    setTransforms({});
  };
  const retake = () => {
    if (photos.length && !window.confirm("촬영한 사진을 버리고 다시 촬영할까요?")) return;
    discardPhotos();
    goBack("capture");
  };
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
    navigate("result");
  };
  const startOver = () => {
    discardPhotos();
    if (url) URL.revokeObjectURL(url);
    setBlob(null);
    setUrl(null);
    setFrame("white");
    setFilter("original");
    setSkinRetouch(defaultSkinRetouch);
    setLayout("classic");
    setDate(true);
    setMessage("");
    setTypography(defaultTypographyId);
    setAlignment(defaultTextAlignment);
    setTextSize(defaultTextSize);
    navigationSession.current = crypto.randomUUID();
    navigate("landing", true);
  };
  if (screen === "landing") return <Landing go={() => navigate("setup")} />;
  if (screen === "setup")
    return (
      <Setup
        s={s}
        set={(x) => setS((v) => ({ ...v, ...x }))}
        go={() => navigate("capture")}
        back={() => goBack("landing")}
      />
    );
  if (screen === "capture")
    return (
      <Capture
        s={s}
        done={(p) => {
          photos.forEach((photo) => URL.revokeObjectURL(photo.url));
          setPhotos(p);
          setIds([]);
          setTransforms(
            Object.fromEntries(p.map((x) => [x.id, defaultTransform])),
          );
          setLayout("classic");
          navigate("select");
        }}
        cancel={() => goBack("setup")}
      />
    );
  if (screen === "select")
    return (
      <main className="screen has-bottom-actions">
        <FlowHeader eyebrow="사진 고르기" title="네 장을 골라주세요." step={3} onBack={retake} backLabel="다시 촬영하기" />
        <output className="selection-status" aria-live="polite">
          {ids.length} / 4 선택 · 선택한 순서대로 배치됩니다.
        </output>
        <div className="grid">
          {photos.map((p, i) => {
            const n = ids.indexOf(p.id);
            return (
              <button
                type="button"
                key={p.id}
                aria-pressed={n >= 0}
                aria-label={n >= 0 ? `${i + 1}번째 사진, ${n + 1}번째로 선택됨` : `${i + 1}번째 사진 선택`}
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
                <img src={p.url} alt="" />
                {n >= 0 && <b>{n + 1}</b>}
              </button>
            );
          })}
        </div>
        <BottomActionBar>
          <button type="button" className="secondary-action" onClick={retake}>다시 촬영</button>
          <button type="button" className="primary" disabled={ids.length !== 4} onClick={() => navigate("edit")}>
            {ids.length === 4 ? "선택 완료" : `${4 - ids.length}장 더 선택`}
          </button>
        </BottomActionBar>
      </main>
    );
  if (screen === "edit" && selected.length === 4)
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
        finish={finish}
        back={() => goBack("select")}
      />
    );
  if (screen === "result" && url) return <Result blob={blob} url={url} edit={() => goBack("edit")} newShot={startOver} />;
  return <Landing go={() => navigate("setup")} />;
}
