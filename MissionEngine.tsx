import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Lightbulb,
  MessageCircle,
  RotateCcw,
  ScanLine,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LessonTask, Mission } from "../lessonData";
import { RangerVisual, SpeechButton } from "./Visuals";

export interface MissionResult {
  missionId: Mission["id"];
  firstTry: number;
  total: number;
  questions: string[];
}

interface MissionEngineProps {
  mission: Mission;
  onComplete: (result: MissionResult) => void;
  onContinue: () => void;
  onOpenRules: () => void;
}

type Feedback = "idle" | "correct" | "wrong";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isAnswerCorrect(task: LessonTask, value: string) {
  if (task.type === "choice") return value === task.answer;
  const accepted = [task.answer, ...(task.accepted ?? [])].map(normalize);
  return accepted.includes(normalize(value));
}

export function MissionEngine({ mission, onComplete, onContinue, onOpenRules }: MissionEngineProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [fill, setFill] = useState("");
  const [built, setBuilt] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [attempts, setAttempts] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);

  const task = mission.tasks[index];
  const isLast = index === mission.tasks.length - 1;
  const builtText = useMemo(
    () => built.map((wordIndex) => task.words?.[wordIndex] ?? "").join(" ").replace(/\s\?/g, "?"),
    [built, task.words],
  );

  useEffect(() => {
    setIndex(0);
    setFinished(false);
    setFirstTry(0);
    setQuestions([]);
  }, [mission.id]);

  useEffect(() => {
    setSelected("");
    setFill("");
    setBuilt([]);
    setFeedback("idle");
    setAttempts(0);
    setShowHint(false);
  }, [task.id]);

  const currentValue = task.type === "choice" ? selected : task.type === "fill" ? fill : builtText;
  const audioText = [task.prompt, task.instruction ?? ""]
    .filter((text) => text.trim().length > 0 && !/[а-яё]/i.test(text))
    .join(" ") || task.answer;
  const canCheck = currentValue.trim().length > 0 && feedback !== "correct";

  const checkAnswer = () => {
    if (!canCheck) return;
    if (isAnswerCorrect(task, currentValue)) {
      setFeedback("correct");
      if (attempts === 0 && !showHint) setFirstTry((value) => value + 1);
      if (task.type === "build") {
        setQuestions((items) => (items.includes(task.answer) ? items : [...items, task.answer]));
      }
      return;
    }
    setFeedback("wrong");
    setAttempts((value) => value + 1);
  };

  const nextTask = () => {
    if (feedback !== "correct") return;
    if (isLast) {
      setFinished(true);
      onComplete({ missionId: mission.id, firstTry, total: mission.tasks.length, questions });
      return;
    }
    setIndex((value) => value + 1);
  };

  const addWord = (wordIndex: number) => {
    if (feedback === "correct" || built.includes(wordIndex)) return;
    setBuilt((items) => [...items, wordIndex]);
    setFeedback("idle");
  };

  const removeWord = (wordIndex: number) => {
    if (feedback === "correct") return;
    setBuilt((items) => items.filter((item) => item !== wordIndex));
    setFeedback("idle");
  };

  if (finished) {
    const accuracy = Math.round((firstTry / mission.tasks.length) * 100);
    const isSecret = mission.id === "secret";
    return (
      <section className="mission-complete screen-enter" aria-labelledby="complete-title">
        <div className="completion-rays" aria-hidden="true" />
        <div className="completion-content">
          <span className="success-kicker"><Sparkles size={17} /> {isSecret ? "Сканирование завершено" : "Новый фрагмент найден"}</span>
          <div className={`earned-fragment fragment-${mission.number} ${isSecret ? "secret-badge" : ""}`}>
            {isSecret ? <ScanLine size={54} /> : <span>{mission.number}</span>}
          </div>
          <h2 id="complete-title">{isSecret ? "Секретная зона открыта!" : `${mission.zone} исследована!`}</h2>
          <p>
            {isSecret
              ? "Ты задал вопросы самостоятельно и собрал всю карту младшего рейнджера."
              : "Фрагмент Секретной зоны добавлен в твой рюкзак. Отправляемся дальше!"}
          </p>
          <div className="completion-stats">
            <div><strong>{mission.tasks.length}/{mission.tasks.length}</strong><span>заданий выполнено</span></div>
            <div><strong>{accuracy}%</strong><span>с первой попытки</span></div>
            <div><strong>{questions.length}</strong><span>вопросов построено</span></div>
          </div>
          <button className="button button-primary button-large" type="button" onClick={onContinue}>
            {isSecret ? "Перейти к рефлексии" : mission.id === "australia" ? "Собрать пазл" : "Следующая зона"}
            <ArrowRight size={19} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mission-engine screen-enter" aria-labelledby="mission-title">
      <header className="mission-heading">
        <div className="mission-number">{mission.number}</div>
        <div>
          <span className="eyebrow">{mission.zone} · {mission.duration}</span>
          <h1 id="mission-title">{mission.title}</h1>
          <p>{mission.subtitle}</p>
        </div>
        <div className="mission-question-count">
          <strong>{index + 1}<span>/{mission.tasks.length}</span></strong>
          <small>реплика</small>
        </div>
      </header>

      <div className="mission-progress" aria-label={`Пройдено ${index} из ${mission.tasks.length} заданий`}>
        {mission.tasks.map((item, itemIndex) => (
          <span
            key={item.id}
            className={`${itemIndex < index ? "is-done" : ""} ${itemIndex === index ? "is-current" : ""}`}
          />
        ))}
      </div>

      <div className="mission-layout">
        <aside className="mission-scene-column">
          <RangerVisual mission={mission} priority={mission.id === "india"} />
          <div className="ranger-briefing">
            <MessageCircle size={19} />
            <p>{index === 0 ? mission.briefing : task.speaker === "ranger" ? "Теперь говоришь ты. Сканер ждёт твою фразу." : "Старший рейнджер передаёт новый вопрос по рации."}</p>
          </div>
        </aside>

        <div className="task-panel">
          <div className="task-panel-top">
            <span className={`speaker-badge ${task.speaker}`}>
              {task.speaker === "teacher" ? <UserRound size={16} /> : <ScanLine size={16} />}
              {task.speaker === "teacher" ? "Вопрос рейнджера" : "Твоя реплика"}
            </span>
            {task.type === "build" && <span className="task-type-label">Собери из слов</span>}
            {task.type === "fill" && <span className="task-type-label">Впиши слово</span>}
          </div>

          <div className="task-prompt">
            <div>
              <h2>{task.prompt}</h2>
              {task.instruction && <p className={task.type === "fill" ? "fill-sentence" : ""}>{task.instruction}</p>}
            </div>
            <SpeechButton text={audioText} />
          </div>

          <div className="task-answer-area">
            {task.type === "choice" && (
              <div className="choice-list" role="radiogroup" aria-label="Варианты ответа">
                {task.options?.map((option, optionIndex) => {
                  const isSelected = selected === option;
                  const showCorrect = feedback === "correct" && isSelected;
                  const showWrong = feedback === "wrong" && isSelected;
                  return (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`choice-option ${isSelected ? "is-selected" : ""} ${showCorrect ? "is-correct" : ""} ${showWrong ? "is-wrong" : ""}`}
                      key={option}
                      onClick={() => {
                        if (feedback === "correct") return;
                        setSelected(option);
                        setFeedback("idle");
                      }}
                    >
                      <span className="choice-letter">{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                      <span className="choice-indicator">{showCorrect && <Check size={16} />}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {task.type === "fill" && (
              <div className={`fill-answer ${feedback === "wrong" ? "is-wrong" : ""} ${feedback === "correct" ? "is-correct" : ""}`}>
                <label htmlFor={`answer-${task.id}`}>Твой ответ</label>
                <div className="fill-input-row">
                  <input
                    id={`answer-${task.id}`}
                    value={fill}
                    onChange={(event) => {
                      setFill(event.target.value);
                      setFeedback("idle");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") checkAnswer();
                    }}
                    placeholder={task.id === "hw" ? "" : "Впиши здесь…"}
                    autoComplete="off"
                    disabled={feedback === "correct"}
                    autoFocus
                  />
                  {feedback === "correct" && <CheckCircle2 size={23} />}
                </div>
                <span className="fill-format">Можно написать число словом или цифрой, если указано количество.</span>
              </div>
            )}

            {task.type === "build" && (
              <div className="word-builder">
                <div className={`built-sentence ${built.length === 0 ? "is-empty" : ""} ${feedback === "correct" ? "is-correct" : ""}`} aria-live="polite">
                  {built.length === 0 ? (
                    <span>Здесь появится твой вопрос…</span>
                  ) : (
                    built.map((wordIndex) => (
                      <button type="button" onClick={() => removeWord(wordIndex)} key={wordIndex} title="Убрать слово">
                        {task.words?.[wordIndex]}
                      </button>
                    ))
                  )}
                </div>
                <div className="word-bank" aria-label="Слова для вопроса">
                  {task.words?.map((word, wordIndex) => (
                    <button
                      type="button"
                      key={`${word}-${wordIndex}`}
                      onClick={() => addWord(wordIndex)}
                      disabled={built.includes(wordIndex) || feedback === "correct"}
                      className={built.includes(wordIndex) ? "is-used" : ""}
                    >
                      {word}
                    </button>
                  ))}
                </div>
                {built.length > 0 && feedback !== "correct" && (
                  <button className="reset-builder" type="button" onClick={() => setBuilt([])}><RotateCcw size={14} /> Начать заново</button>
                )}
              </div>
            )}
          </div>

          {showHint && feedback !== "correct" && (
            <div className="hint-box screen-enter"><Lightbulb size={18} /><span>{task.hint}</span></div>
          )}
          {feedback === "wrong" && (
            <div className="feedback feedback-wrong" role="alert">
              <span className="feedback-icon"><RotateCcw size={18} /></span>
              <div><strong>Почти получилось!</strong><p>Проверь данные сканера и попробуй ещё раз.</p></div>
            </div>
          )}
          {feedback === "correct" && (
            <div className="feedback feedback-correct" role="status">
              <span className="feedback-icon"><Check size={19} /></span>
              <div><strong>Точно! Сигнал принят.</strong><p>{task.answer}</p></div>
            </div>
          )}

          <div className="task-actions">
            <div className="task-help">
              <button type="button" onClick={() => setShowHint((value) => !value)} disabled={feedback === "correct"}>
                <Lightbulb size={16} /> {showHint ? "Скрыть подсказку" : "Подсказка"}
              </button>
              <button type="button" onClick={onOpenRules}><BookOpen size={16} /> Правила</button>
            </div>
            {feedback === "correct" ? (
              <button className="button button-primary" type="button" onClick={nextTask} autoFocus>
                {isLast ? "Завершить миссию" : "Дальше"}<ArrowRight size={18} />
              </button>
            ) : (
              <button className="button button-dark" type="button" onClick={checkAnswer} disabled={!canCheck}>
                Проверить <Check size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
