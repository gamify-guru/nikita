import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Home,
  Lock,
  Map,
  Pause,
  Play,
  Puzzle,
  RotateCcw,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { missions, ruleCards, type Mission } from "./lessonData";
import { BrandMark, RangerVisual } from "./components/Visuals";
import { RuleCards } from "./components/RuleCards";
import { MissionEngine, type MissionResult } from "./components/MissionEngine";
import { PuzzleBoard } from "./components/PuzzleBoard";
import { Reflection } from "./components/Reflection";
import { Homework } from "./components/Homework";

type Stage = "intro" | "briefing" | "india" | "china" | "australia" | "puzzle" | "secret" | "reflection";
type Page = "lesson" | "homework";

interface SavedProgress {
  completed: Mission["id"][];
  puzzleSolved: boolean;
  questions: string[];
  secondsLeft: number;
  started: boolean;
  lastStage: Stage;
}

const defaultProgress: SavedProgress = {
  completed: [],
  puzzleSolved: false,
  questions: [],
  secondsLeft: 45 * 60,
  started: false,
  lastStage: "briefing",
};

function readProgress(): SavedProgress {
  try {
    const saved = window.localStorage.getItem("ranger-lesson-progress");
    return saved ? { ...defaultProgress, ...(JSON.parse(saved) as Partial<SavedProgress>) } : defaultProgress;
  } catch {
    return defaultProgress;
  }
}

const lessonSteps: { id: Exclude<Stage, "intro">; short: string; title: string; time: string }[] = [
  { id: "briefing", short: "Старт", title: "Карточки и сюжет", time: "2 мин" },
  { id: "india", short: "India", title: "Река крокодилов", time: "7–8 мин" },
  { id: "china", short: "China", title: "Бамбуковый лес", time: "7–8 мин" },
  { id: "australia", short: "Australia", title: "Долина кенгуру", time: "7–8 мин" },
  { id: "puzzle", short: "Пазл", title: "Сборка карты", time: "2 мин" },
  { id: "secret", short: "Secret", title: "Секретная зона", time: "8–10 мин" },
  { id: "reflection", short: "Финал", title: "Рефлексия", time: "2–3 мин" },
];

const route = [
  { number: "01", title: "Вход в экспедицию", text: "Сюжет и настройка сканера", time: "3–4 мин" },
  { number: "02", title: "Карточки правил", text: "Три опоры, доступные весь урок", time: "2 мин" },
  { number: "03", title: "India Zone", text: "Диалог с опорой + 2 своих вопроса", time: "7–8 мин" },
  { number: "04", title: "China Zone", text: "Выбор и дополнение фраз", time: "7–8 мин" },
  { number: "05", title: "Australia Zone", text: "Самостоятельные вопросы", time: "7–8 мин" },
  { number: "06", title: "Secret Zone", text: "Пазл и финальная миссия", time: "10–12 мин" },
  { number: "07", title: "Рефлексия", text: "Лучший вопрос и цель", time: "2–3 мин" },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export default function App() {
  const [initial] = useState(readProgress);
  const [page, setPage] = useState<Page>("lesson");
  const [stage, setStage] = useState<Stage>("intro");
  const [lastStage, setLastStage] = useState<Stage>(initial.lastStage);
  const [completed, setCompleted] = useState<Mission["id"][]>(initial.completed);
  const [puzzleSolved, setPuzzleSolved] = useState(initial.puzzleSolved);
  const [questions, setQuestions] = useState<string[]>(initial.questions);
  const [secondsLeft, setSecondsLeft] = useState(initial.secondsLeft);
  const [started, setStarted] = useState(initial.started);
  const [timerRunning, setTimerRunning] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [ruleIndex, setRuleIndex] = useState(0);

  const closeRules = useCallback(() => setRulesOpen(false), []);
  const openRules = useCallback((index = 0) => {
    setRuleIndex(index);
    setRulesOpen(true);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    try {
      const progress: SavedProgress = { completed, puzzleSolved, questions, secondsLeft, started, lastStage };
      window.localStorage.setItem("ranger-lesson-progress", JSON.stringify(progress));
    } catch {
      // The lesson still works when local storage is unavailable.
    }
  }, [completed, puzzleSolved, questions, secondsLeft, started, lastStage]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [stage, page]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goStage = (next: Stage) => {
    setStage(next);
    if (next !== "intro") setLastStage(next);
    window.setTimeout(scrollTop, 20);
  };

  const isUnlocked = (id: Stage) => {
    if (id === "intro" || id === "briefing" || id === "india") return true;
    if (id === "china") return completed.includes("india");
    if (id === "australia") return completed.includes("china");
    if (id === "puzzle") return ["india", "china", "australia"].every((id) => completed.includes(id as Mission["id"]));
    if (id === "secret") return puzzleSolved;
    if (id === "reflection") return completed.includes("secret");
    return false;
  };

  const startLesson = () => {
    setStarted(true);
    setTimerRunning(secondsLeft > 0);
    goStage(started ? lastStage : "briefing");
  };

  const resetLesson = () => {
    setCompleted([]);
    setPuzzleSolved(false);
    setQuestions([]);
    setSecondsLeft(45 * 60);
    setStarted(true);
    setTimerRunning(true);
    goStage("briefing");
  };

  const completeMission = (result: MissionResult) => {
    setCompleted((items) => (items.includes(result.missionId) ? items : [...items, result.missionId]));
    setQuestions((items) => [...items, ...result.questions.filter((question) => !items.includes(question))]);
  };

  const continueFromMission = (id: Mission["id"]) => {
    const next: Record<Mission["id"], Stage> = {
      india: "china",
      china: "australia",
      australia: "puzzle",
      secret: "reflection",
    };
    goStage(next[id]);
  };

  const openHomework = () => {
    setPage("homework");
    setTimerRunning(false);
    window.setTimeout(scrollTop, 20);
  };

  const currentMission = missions.find((mission) => mission.id === stage);
  const zoneFragments = ["india", "china", "australia"].filter((id) => completed.includes(id as Mission["id"])).length;

  return (
    <div className={`app ${stage === "intro" && page === "lesson" ? "intro-mode" : "lesson-mode"}`}>
      <a className="skip-link" href="#main-content">Перейти к содержанию</a>
      <header className="app-header">
        <button className="brand" type="button" onClick={() => { setPage("lesson"); setStage("intro"); window.setTimeout(scrollTop, 20); }} aria-label="На главную страницу урока">
          <BrandMark />
          <span className="brand-copy"><strong>RANGER<span>LAB</span></strong><small>English expedition</small></span>
        </button>
        <div className="header-lesson-meta">
          <span>Academy Stars 2</span>
          <strong>Unit 1 · Lesson 6</strong>
        </div>
        <div className="header-actions">
          {started && (
            <button
              className={`timer-chip ${secondsLeft === 0 ? "is-finished" : ""}`}
              type="button"
              onClick={() => secondsLeft > 0 && setTimerRunning((value) => !value)}
              title={timerRunning ? "Поставить таймер на паузу" : "Запустить таймер"}
            >
              {timerRunning ? <Pause size={15} /> : <Play size={15} />}
              <Clock3 size={16} /><span>{formatTime(secondsLeft)}</span>
            </button>
          )}
          <button className={`header-link ${page === "homework" ? "is-active" : ""}`} type="button" onClick={openHomework}><Home size={17} /><span>Домашнее задание</span></button>
          <button className="header-rules" type="button" onClick={() => openRules()}><BookOpen size={17} /><span>Карточки правил</span></button>
        </div>
      </header>

      {page === "lesson" && stage !== "intro" && (
        <nav className="lesson-step-nav" aria-label="Этапы урока">
          <div className="steps-scroll">
            {lessonSteps.map((step, index) => {
              const unlocked = isUnlocked(step.id);
              const done = step.id === "briefing" ? stage !== "briefing" : step.id === "puzzle" ? puzzleSolved : completed.includes(step.id as Mission["id"]);
              return (
                <button
                  type="button"
                  key={step.id}
                  disabled={!unlocked}
                  className={`${stage === step.id ? "is-current" : ""} ${done ? "is-done" : ""}`}
                  onClick={() => goStage(step.id)}
                  title={unlocked ? step.title : "Сначала заверши предыдущий этап"}
                >
                  <span className="step-dot">{done ? <Check size={13} /> : unlocked ? index + 1 : <Lock size={11} />}</span>
                  <span>{step.short}</span>
                </button>
              );
            })}
          </div>
          <div className="fragment-counter" title="Фрагменты карты Секретной зоны"><Puzzle size={17} /><strong>{zoneFragments}/3</strong><span>фрагмента</span></div>
        </nav>
      )}

      {page === "homework" ? (
        <Homework onBack={() => { setPage("lesson"); goStage(started ? lastStage : "intro"); }} onOpenRules={() => openRules()} />
      ) : stage === "intro" ? (
        <main id="main-content">
          <section className="hero-section">
            <div className="hero-grid" aria-hidden="true" />
            <div className="hero-glow" aria-hidden="true" />
            <div className="hero-inner">
              <div className="hero-copy">
                <span className="hero-eyebrow"><span>ACADEMY STARS 2</span><i />UNIT 1 · LESSON 6</span>
                <h1>Are there <em>any…?</em><span>+ short answers</span></h1>
                <p className="hero-lead">Сканируй зоны. Задавай вопросы.<br />Открой Секретную зону.</p>
                <div className="hero-story">
                  <span><ScanLine size={19} /></span>
                  <p><strong>Сегодня ты — младший рейнджер.</strong> Каждая миссия даёт фрагмент пазла. Собери все три — и сканер покажет неизвестную зону.</p>
                </div>
                <div className="hero-actions">
                  <button className="button button-primary button-large" type="button" onClick={startLesson}>{started ? "Продолжить экспедицию" : "Начать сканирование"}<ArrowRight size={20} /></button>
                  <button className="button button-ghost-light button-large" type="button" onClick={() => openRules()}><BookOpen size={19} /> Сначала правила</button>
                </div>
                {started && <button className="restart-link" type="button" onClick={resetLesson}><RotateCcw size={14} /> Начать урок заново</button>}
                <div className="hero-facts">
                  <span><Clock3 size={17} /><strong>45</strong> минут</span>
                  <span><Map size={17} /><strong>4</strong> миссии</span>
                  <span><Puzzle size={17} /><strong>3</strong> фрагмента</span>
                </div>
              </div>
              <div className="hero-art-wrap">
                <RangerVisual priority className="hero-art" />
                <div className="hero-mission-tag"><span className="live-dot" /><div><small>NEW EXPEDITION</small><strong>3 zones to scan</strong></div><ScanLine size={22} /></div>
                <div className="hero-puzzle-progress"><Puzzle size={19} /><span>Secret map</span><div>{[0, 1, 2].map((piece) => <i className={piece < zoneFragments ? "is-earned" : ""} key={piece} />)}</div><strong>{zoneFragments}/3</strong></div>
              </div>
            </div>
            <div className="hero-bottom-fade" aria-hidden="true" />
          </section>

          <section className="route-section">
            <div className="section-heading reveal">
              <div><span className="eyebrow"><Map size={15} /> Маршрут на 45 минут</span><h2>От первой подсказки<br />до собственных вопросов</h2></div>
              <p>Каждый этап убирает немного опоры: сначала выбираешь ответ, затем дополняешь фразы, а в финале сам ведёшь сканирование.</p>
            </div>
            <div className="route-grid reveal">
              {route.map((item, index) => (
                <article className={`route-item ${index === 5 ? "is-secret" : ""}`} key={item.number}>
                  <div className="route-number">{item.number}</div>
                  <span className="route-time">{item.time}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  {index < route.length - 1 && <ChevronRight className="route-arrow" size={17} aria-hidden="true" />}
                </article>
              ))}
            </div>
          </section>

          <section className="support-section">
            <div className="section-heading reveal">
              <div><span className="eyebrow"><BookOpen size={15} /> Всегда под рукой</span><h2>Три карточки. Одна кнопка.<br />В любой момент урока.</h2></div>
              <button className="button button-outline" type="button" onClick={() => openRules()}>Открыть все карточки <ArrowRight size={17} /></button>
            </div>
            <div className="support-grid">
              {ruleCards.map((card, index) => (
                <button className="support-card reveal" type="button" onClick={() => openRules(index)} key={card.id} style={{ transitionDelay: `${index * 80}ms` }}>
                  <span className="support-number">{card.number}</span>
                  <div className="support-icon">{index === 0 ? <ScanLine /> : index === 1 ? <Check /> : <Sparkles />}</div>
                  <h3>{card.title}</h3>
                  <p>{card.lines[0]}</p>
                  <span className="support-open">Открыть карточку <ArrowRight size={15} /></span>
                </button>
              ))}
            </div>
          </section>

          <section className="intro-cta reveal">
            <div><span className="eyebrow"><Sparkles size={15} /> Сканер заряжен</span><h2>Секретная зона уже передаёт сигнал.</h2><p>Начни с India Zone — первая подсказка ждёт в карточках.</p></div>
            <button className="button button-primary button-large" type="button" onClick={startLesson}>{started ? "Продолжить" : "Я готов"}<ArrowRight size={20} /></button>
          </section>
        </main>
      ) : stage === "briefing" ? (
        <main className="briefing-screen screen-enter" id="main-content">
          <div className="briefing-hero">
            <RangerVisual priority />
            <div className="briefing-copy">
              <span className="eyebrow"><ScanLine size={15} /> Центр управления · 2 минуты</span>
              <h1>Настрой сканер,<br />младший рейнджер</h1>
              <p>Перед экспедицией проверь три главные фразы. Нажми на звук, чтобы послушать. Если забудешь правило, кнопка <strong>«Карточки правил»</strong> всегда будет на экране.</p>
              <div className="briefing-objective"><Puzzle size={23} /><div><strong>Твоя цель</strong><span>Собрать 3 фрагмента и найти Секретную зону</span></div></div>
            </div>
          </div>
          <div className="briefing-rules">
            {ruleCards.map((card, index) => (
              <button className="briefing-rule-card" type="button" onClick={() => openRules(index)} key={card.id}>
                <span>{card.number}</span><div><h2>{card.title}</h2><p>{card.lines.slice(0, 2).join("  ·  ")}</p></div><ArrowRight size={20} />
              </button>
            ))}
          </div>
          <div className="briefing-footer"><span><Check size={17} /> Сканер настроен. Первая зона: India.</span><button className="button button-primary button-large" type="button" onClick={() => goStage("india")}>Начать Миссию 1 <ArrowRight size={19} /></button></div>
        </main>
      ) : currentMission ? (
        <main className="lesson-main" id="main-content">
          <MissionEngine mission={currentMission} onComplete={completeMission} onContinue={() => continueFromMission(currentMission.id)} onOpenRules={() => openRules()} />
        </main>
      ) : stage === "puzzle" ? (
        <main className="lesson-main puzzle-main" id="main-content">
          <PuzzleBoard solved={puzzleSolved} onSolved={() => setPuzzleSolved(true)} onContinue={() => goStage("secret")} />
        </main>
      ) : (
        <main className="lesson-main" id="main-content">
          <Reflection questions={questions} completedCount={completed.length} onOpenRules={() => openRules()} onHomework={openHomework} />
        </main>
      )}

      {page === "lesson" && stage === "intro" && (
        <footer className="app-footer"><div className="brand"><BrandMark small /><span className="brand-copy"><strong>RANGER<span>LAB</span></strong></span></div><span>Unit 1 · Lesson 6 · Are there any…? + short answers</span><button type="button" onClick={openHomework}>Домашнее задание <ArrowRight size={15} /></button></footer>
      )}

      <button className="floating-rules" type="button" onClick={() => openRules()} aria-label="Открыть карточки правил"><BookOpen size={20} /><span>Карточки правил</span><i>3</i></button>
      <RuleCards open={rulesOpen} initialCard={ruleIndex} onClose={closeRules} />
    </div>
  );
}
