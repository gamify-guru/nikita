import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Home,
  ImagePlus,
  Lightbulb,
  Map,
  Printer,
  RotateCcw,
  Save,
  ScanLine,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { homeworkOne } from "../lessonData";

type HomeworkTab = "scanner" | "park";
type AnswerState = "idle" | "correct" | "wrong";

interface HomeworkProps {
  onBack: () => void;
  onOpenRules: () => void;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function readSaved<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

const emptyAnswers = () => Object.fromEntries(homeworkOne.map((item) => [item.id, ""]));

const ownPrompts = [
  { prompt: "Ask about any objects in your photo.", pattern: /are there any/i, hint: "Начни с Are there any…?" },
  { prompt: "Give a short answer.", pattern: /^(yes,?\s*there are|no,?\s*there aren[’']?t)\.?$/i, hint: "Yes, there are. / No, there aren’t." },
  { prompt: "Ask about the number of objects.", pattern: /how many/i, hint: "How many … are there?" },
  { prompt: "Write how many there are.", pattern: /there are(?!n[’']?t)/i, hint: "There are three…" },
  { prompt: "Ask about something that is NOT in your photo.", pattern: /are there any/i, hint: "Are there any…?" },
  { prompt: "Give a negative short answer.", pattern: /no,?\s*there aren[’']?t/i, hint: "No, there aren’t." },
  { prompt: "Write one more question about your photo.", pattern: /are there any|how many/i, hint: "Are there any…? или How many…?" },
  { prompt: "Finish with an answer.", pattern: /there are|there aren[’']?t/i, hint: "Напиши полный или короткий ответ." },
];

const dialogueFrames = [
  { speaker: "YOU", prompt: "Спроси про первых животных своей зоны.", placeholder: "Are there any tigers?", pattern: /are there any/i },
  { speaker: "RANGER", prompt: "Дай положительный короткий ответ.", placeholder: "Yes, there are.", pattern: /yes,?\s*there are/i },
  { speaker: "YOU", prompt: "Спроси, сколько их.", placeholder: "How many tigers are there?", pattern: /how many/i },
  { speaker: "RANGER", prompt: "Назови количество.", placeholder: "There are four tigers.", pattern: /there are(?!n[’']?t)/i },
  { speaker: "YOU", prompt: "Спроси про животных, которых нет.", placeholder: "Are there any lions?", pattern: /are there any/i },
  { speaker: "RANGER", prompt: "Дай отрицательный короткий ответ.", placeholder: "No, there aren’t.", pattern: /no,?\s*there aren[’']?t/i },
  { speaker: "YOU", prompt: "Задай ещё один свой вопрос.", placeholder: "Are there any birds?", pattern: /are there any|how many/i },
  { speaker: "RANGER", prompt: "Заверши диалог ответом.", placeholder: "Yes, there are.", pattern: /there are|there aren[’']?t/i },
];

function RoomPicture() {
  return (
    <div className="room-picture" role="img" aria-label="Готовая картинка комнаты: пять книг, двенадцать карандашей, два мяча; кошек и птиц нет">
      <div className="room-window"><span /><span /><i /></div>
      <div className="room-shelf">
        <div className="books" aria-hidden="true">{[1, 2, 3, 4, 5].map((book) => <i key={book} />)}</div>
      </div>
      <div className="room-desk">
        <div className="pencil-cup"><span className="pencils">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ transform: `rotate(${-18 + index * 3.2}deg)` }} />)}</span></div>
        <span className="desk-leg left" /><span className="desk-leg right" />
      </div>
      <div className="room-plant"><i /><i /><i /><span /></div>
      <div className="room-ball ball-one" /><div className="room-ball ball-two" />
      <div className="room-rug" />
      <div className="room-scan-tag"><ScanLine size={14} /><span>ROOM SCAN · OBJECTS DETECTED</span></div>
    </div>
  );
}

export function Homework({ onBack, onOpenRules }: HomeworkProps) {
  const [tab, setTab] = useState<HomeworkTab>("scanner");
  const [mode, setMode] = useState<"ready" | "own">("ready");
  const [answers, setAnswers] = useState<Record<string, string>>(() => readSaved("ranger-homework-one", emptyAnswers()));
  const [states, setStates] = useState<Record<string, AnswerState>>({});
  const [hints, setHints] = useState<string[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [ownImage, setOwnImage] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [zone, setZone] = useState(() => readSaved("ranger-homework-zone", ""));
  const [dialogue, setDialogue] = useState<string[]>(() => readSaved("ranger-homework-dialogue", Array(8).fill("") as string[]));
  const [dialogueChecked, setDialogueChecked] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("ranger-homework-one", JSON.stringify(answers));
    setSaved(true);
    const timeout = window.setTimeout(() => setSaved(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [answers]);

  useEffect(() => {
    window.localStorage.setItem("ranger-homework-zone", JSON.stringify(zone));
    window.localStorage.setItem("ranger-homework-dialogue", JSON.stringify(dialogue));
  }, [zone, dialogue]);

  useEffect(() => () => {
    if (ownImage) URL.revokeObjectURL(ownImage);
  }, [ownImage]);

  const completedCount = Object.values(states).filter((state) => state === "correct").length;
  const dialogueValid = dialogueFrames.map((frame, index) => frame.pattern.test(dialogue[index]?.trim() ?? ""));
  const dialogueReady = zone.trim().length > 0 && dialogueValid.every(Boolean);

  const checkScanner = () => {
    const next: Record<string, AnswerState> = {};
    homeworkOne.forEach((item, index) => {
      const value = answers[item.id]?.trim() ?? "";
      if (mode === "ready") {
        next[item.id] = item.accepted.map(normalize).includes(normalize(value)) ? "correct" : "wrong";
      } else {
        next[item.id] = ownPrompts[index].pattern.test(value) ? "correct" : "wrong";
      }
    });
    setStates(next);
  };

  const resetScanner = () => {
    setAnswers(emptyAnswers());
    setStates({});
    setHints([]);
    setShowAnswers(false);
  };

  const updateDialogue = (index: number, value: string) => {
    setDialogue((lines) => lines.map((line, lineIndex) => (lineIndex === index ? value : line)));
    setDialogueChecked(false);
  };

  const dialogueText = useMemo(
    () => dialogue.map((line, index) => `${dialogueFrames[index].speaker}: ${line}`).join(" "),
    [dialogue],
  );

  return (
    <main className="homework-page screen-enter" id="main-content">
      <section className="homework-hero">
        <div>
          <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={17} /> Вернуться к уроку</button>
          <span className="eyebrow"><Home size={15} /> Домашнее сканирование · отдельные задания</span>
          <h1>Продолжи исследование дома</h1>
          <p>Два новых задания: сначала опора на готовую картинку или своё фото, затем собственная зона и мини-диалог.</p>
        </div>
        <div className="homework-hero-actions">
          <button className="button button-outline" type="button" onClick={onOpenRules}><BookOpen size={17} /> Карточки правил</button>
          <button className="button button-dark" type="button" onClick={() => window.print()}><Printer size={17} /> Печать</button>
        </div>
      </section>

      <nav className="homework-tabs" aria-label="Домашние задания">
        <button className={tab === "scanner" ? "is-active" : ""} type="button" onClick={() => setTab("scanner")}>
          <span><ScanLine size={21} /></span><div><small>ДЗ 1 · 8 предложений</small><strong>Сканер дома</strong></div>{tab === "scanner" && <Check size={18} />}
        </button>
        <button className={tab === "park" ? "is-active" : ""} type="button" onClick={() => setTab("park")}>
          <span><Map size={21} /></span><div><small>ДЗ 2 · 8 реплик</small><strong>Мой зоопарк / мой парк</strong></div>{tab === "park" && <Check size={18} />}
        </button>
      </nav>

      {tab === "scanner" ? (
        <section className="homework-sheet" aria-labelledby="hw1-title">
          <header className="sheet-header">
            <div><span className="sheet-number">ДЗ 1</span><h2 id="hw1-title">Сканер дома</h2><p>Напиши 8 ответов по картинке. В классных миссиях этих предметов не было.</p></div>
            <div className="sheet-score"><strong>{completedCount}<span>/8</span></strong><small>{mode === "ready" ? "верно" : "по структуре"}</small></div>
          </header>

          <div className="picture-mode" role="group" aria-label="Выбор картинки">
            <button type="button" className={mode === "ready" ? "is-active" : ""} onClick={() => { setMode("ready"); setStates({}); }}><ImagePlus size={16} /> Готовая картинка</button>
            <button type="button" className={mode === "own" ? "is-active" : ""} onClick={() => { setMode("own"); setStates({}); }}><ImagePlus size={16} /> Моё фото</button>
          </div>

          <div className="homework-one-layout">
            <aside className="room-column">
              {mode === "ready" ? <RoomPicture /> : (
                <div className="own-photo-panel">
                  {ownImage ? <img src={ownImage} alt="Загруженная фотография ученика для домашнего сканирования" /> : <div className="photo-placeholder"><ImagePlus size={36} /><strong>Добавь фото комнаты, игрушек или двора</strong><span>Фото останется только в этом браузере и никуда не отправится.</span></div>}
                  <label className="button button-outline upload-button"><ImagePlus size={17} /> {ownImage ? "Заменить фото" : "Выбрать фото"}
                    <input type="file" accept="image/*" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (ownImage) URL.revokeObjectURL(ownImage);
                      setOwnImage(URL.createObjectURL(file));
                    }} />
                  </label>
                  {ownImage && <button className="photo-remove" type="button" onClick={() => { URL.revokeObjectURL(ownImage); setOwnImage(""); }}><X size={15} /> Убрать</button>}
                </div>
              )}
              {mode === "ready" && <div className="room-inventory"><span><strong>5</strong> books</span><span><strong>12</strong> pencils</span><span><strong>2</strong> balls</span><span><strong>0</strong> cats / birds</span></div>}
              <div className="save-note"><Save size={15} />{saved ? "Изменения сохранены" : "Ответы сохраняются на этом устройстве"}</div>
            </aside>

            <div className="homework-answer-list">
              {homeworkOne.map((item, index) => {
                const ownItem = ownPrompts[index];
                const status = states[item.id] ?? "idle";
                return (
                  <div className={`homework-answer ${status !== "idle" ? `is-${status}` : ""}`} key={item.id}>
                    <div className="homework-answer-top">
                      <label htmlFor={item.id}><span>{index + 1}</span>{mode === "ready" ? item.prompt : ownItem.prompt}</label>
                      <button type="button" className="hint-icon" onClick={() => setHints((items) => items.includes(item.id) ? items.filter((id) => id !== item.id) : [...items, item.id])} aria-label="Показать подсказку"><Lightbulb size={16} /></button>
                    </div>
                    <div className="homework-input-wrap">
                      <input id={item.id} value={answers[item.id] ?? ""} onChange={(event) => {
                        setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
                        setStates((current) => ({ ...current, [item.id]: "idle" }));
                      }} placeholder={mode === "ready" ? "Write your answer…" : ownItem.hint} autoComplete="off" />
                      {status === "correct" && <CheckCircle2 size={19} />}
                    </div>
                    {hints.includes(item.id) && <p className="homework-hint"><Lightbulb size={14} />{mode === "ready" ? item.hint : ownItem.hint}</p>}
                    {status === "wrong" && <p className="answer-error">Проверь структуру фразы и данные картинки.</p>}
                    {showAnswers && mode === "ready" && <p className="model-answer">Образец: <strong>{item.answer}</strong></p>}
                  </div>
                );
              })}
              <div className="homework-check-actions">
                <button className="button button-primary" type="button" onClick={checkScanner}><Check size={18} /> Проверить 8 ответов</button>
                {mode === "ready" && <button className="text-button" type="button" onClick={() => setShowAnswers((value) => !value)}>{showAnswers ? "Скрыть образцы" : "Показать образцы"}</button>}
                <button className="text-button" type="button" onClick={resetScanner}><RotateCcw size={15} /> Очистить</button>
              </div>
              {completedCount === 8 && <div className="homework-success" role="status"><Sparkles size={21} /><div><strong>{mode === "ready" ? "Все ответы верны!" : "Все 8 фраз построены верно!"}</strong><span>{mode === "ready" ? "Домашний сканер работает отлично." : "Самопроверка пройдена: сравни содержание со своим фото."}</span></div></div>}
            </div>
          </div>
        </section>
      ) : (
        <section className="homework-sheet dialogue-sheet" aria-labelledby="hw2-title">
          <header className="sheet-header">
            <div><span className="sheet-number">ДЗ 2</span><h2 id="hw2-title">Мой зоопарк / мой парк</h2><p>Придумай зону и напиши новый мини-диалог из 8 реплик.</p></div>
            <div className="sheet-score"><strong>{dialogueValid.filter(Boolean).length}<span>/8</span></strong><small>реплик по структуре</small></div>
          </header>

          <div className="dialogue-layout">
            <div className="dialogue-editor">
              <label className="zone-name-label">Название твоей зоны
                <input value={zone} onChange={(event) => setZone(event.target.value)} placeholder="Например: Rainbow Park" />
              </label>
              <div className="dialogue-lines">
                {dialogueFrames.map((frame, index) => (
                  <div className={`dialogue-line ${dialogueChecked ? (dialogueValid[index] ? "is-valid" : "is-invalid") : ""}`} key={index}>
                    <div className="dialogue-line-label"><span className={frame.speaker === "YOU" ? "you" : "ranger"}>{frame.speaker}</span><label htmlFor={`dialogue-${index}`}>{frame.prompt}</label><b>{index + 1}</b></div>
                    <input id={`dialogue-${index}`} value={dialogue[index] ?? ""} onChange={(event) => updateDialogue(index, event.target.value)} placeholder={frame.placeholder} />
                    {dialogueChecked && !dialogueValid[index] && <small>Используй нужную конструкцию, как в образце.</small>}
                  </div>
                ))}
              </div>
              <div className="homework-check-actions">
                <button className="button button-primary" type="button" onClick={() => setDialogueChecked(true)}><Check size={18} /> Проверить диалог</button>
                <button className="text-button" type="button" onClick={() => { setDialogue(Array(8).fill("")); setZone(""); setDialogueChecked(false); }}><RotateCcw size={15} /> Начать заново</button>
              </div>
              {dialogueChecked && dialogueReady && <div className="homework-success" role="status"><Sparkles size={21} /><div><strong>Твоя зона готова к открытию!</strong><span>Все 8 реплик используют конструкции урока.</span></div></div>}
              {dialogueChecked && !dialogueReady && <p className="dialogue-summary-error">Добавь название зоны и исправь отмеченные реплики.</p>}
            </div>

            <aside className="dialogue-preview">
              <div className="preview-map"><img src="/images/ranger-scanner.jpg" alt="Рейнджер готов сканировать придуманную зону" /><span><ScanLine size={15} /> CUSTOM ZONE</span></div>
              <div className="preview-paper">
                <span className="eyebrow">Мой мини-диалог</span>
                <h3>{zone.trim() || "My Secret Park"}</h3>
                <div className="preview-dialogue-lines">
                  {dialogueFrames.map((frame, index) => (
                    <p key={index} className={frame.speaker === "YOU" ? "is-you" : ""}><strong>{frame.speaker}</strong><span>{dialogue[index] || <em>{frame.placeholder}</em>}</span></p>
                  ))}
                </div>
                <button className="button button-outline button-wide" type="button" disabled={!dialogue.some((line) => line.trim())} onClick={() => {
                  if (!("speechSynthesis" in window)) return;
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(dialogueText);
                  utterance.lang = "en-GB";
                  utterance.rate = 0.82;
                  window.speechSynthesis.speak(utterance);
                }}><Volume2 size={17} /> Прослушать диалог</button>
              </div>
              <button className="text-button preview-rules" type="button" onClick={onOpenRules}><BookOpen size={15} /> Нужна опора? Открыть правила</button>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}
