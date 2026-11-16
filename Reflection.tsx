import { useState } from "react";
import { ArrowRight, Award, BookOpen, Check, Printer, Sparkles, Target } from "lucide-react";
import { RangerVisual } from "./Visuals";

interface ReflectionProps {
  questions: string[];
  completedCount: number;
  onOpenRules: () => void;
  onHomework: () => void;
}

const practiceAreas = ["Короткие ответы", "How many…?", "Числа словами", "Строить вопрос без опоры"];

export function Reflection({ questions, completedCount, onOpenRules, onHomework }: ReflectionProps) {
  const fallbackQuestions = ["Are there any crocodiles?", "Are there any pandas?", "How many birds are there?"];
  const options = questions.length > 0 ? questions : fallbackQuestions;
  const [best, setBest] = useState("");
  const [confidence, setConfidence] = useState<"ready" | "practice" | "">("");
  const [practice, setPractice] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [finished, setFinished] = useState(false);

  const togglePractice = (area: string) => {
    setPractice((items) => (items.includes(area) ? items.filter((item) => item !== area) : [...items, area]));
  };

  if (finished) {
    return (
      <section className="certificate-screen screen-enter" aria-labelledby="certificate-title">
        <div className="certificate-card">
          <RangerVisual secret className="certificate-visual" />
          <div className="certificate-copy">
            <span className="success-kicker"><Award size={18} /> Junior Ranger · Level complete</span>
            <h1 id="certificate-title">Миссия выполнена!</h1>
            <p className="certificate-lead">Ты исследовал все зоны и умеешь спрашивать о животных с <strong>Are there any…?</strong></p>
            <blockquote>“{best}”<span>Твой лучший вопрос</span></blockquote>
            <div className="certificate-skills">
              <span><Check size={15} /> 4 зоны отсканированы</span>
              <span><Check size={15} /> Пазл собран</span>
              <span><Check size={15} /> {questions.length} вопросов создано</span>
            </div>
            {note && <p className="certificate-note"><strong>Моя цель:</strong> {note}</p>}
            <div className="certificate-actions">
              <button className="button button-primary" type="button" onClick={onHomework}>Перейти к домашнему заданию <ArrowRight size={18} /></button>
              <button className="button button-outline" type="button" onClick={() => window.print()}><Printer size={17} /> Распечатать результат</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="reflection-screen screen-enter" aria-labelledby="reflection-title">
      <div className="reflection-intro">
        <RangerVisual secret />
        <div className="reflection-intro-copy">
          <span className="eyebrow"><Sparkles size={15} /> Рефлексия · 2–3 минуты</span>
          <h1 id="reflection-title">Отчёт младшего рейнджера</h1>
          <p>Сканирование завершено. Выбери свою сильную сторону и отметь, что стоит потренировать ещё.</p>
          <div className="reflection-total"><Target size={19} /><strong>{completedCount}/4</strong><span>миссии выполнены</span></div>
        </div>
      </div>

      <div className="reflection-form">
        <fieldset>
          <legend><span>1</span> Какой вопрос получился лучше всего?</legend>
          <div className="best-question-list">
            {options.map((question) => (
              <label className={`best-question ${best === question ? "is-selected" : ""}`} key={question}>
                <input type="radio" name="best-question" value={question} checked={best === question} onChange={() => setBest(question)} />
                <span>{question}</span>
                <i>{best === question && <Check size={15} />}</i>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend><span>2</span> Как ты чувствуешь себя с новой темой?</legend>
          <div className="confidence-options">
            <label className={confidence === "ready" ? "is-selected" : ""}>
              <input type="radio" name="confidence" checked={confidence === "ready"} onChange={() => setConfidence("ready")} />
              <strong>Могу сам</strong><span>Могу задать вопрос без карточек.</span>
            </label>
            <label className={confidence === "practice" ? "is-selected" : ""}>
              <input type="radio" name="confidence" checked={confidence === "practice"} onChange={() => setConfidence("practice")} />
              <strong>Нужна тренировка</strong><span>Пока использую карточки как опору.</span>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend><span>3</span> Где ещё нужно потренироваться?</legend>
          <div className="practice-chips">
            {practiceAreas.map((area) => (
              <label className={practice.includes(area) ? "is-selected" : ""} key={area}>
                <input type="checkbox" checked={practice.includes(area)} onChange={() => togglePractice(area)} />
                {practice.includes(area) && <Check size={14} />}{area}
              </label>
            ))}
          </div>
          <label className="reflection-note">Моя цель на следующий урок <span>необязательно</span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Например: я хочу быстрее называть числа…" rows={3} />
          </label>
        </fieldset>

        <div className="reflection-actions">
          <button className="text-button" type="button" onClick={onOpenRules}><BookOpen size={16} /> Ещё раз посмотреть правила</button>
          <button className="button button-primary button-large" type="button" disabled={!best || !confidence} onClick={() => setFinished(true)}>
            Завершить урок <Award size={19} />
          </button>
        </div>
      </div>
    </section>
  );
}
