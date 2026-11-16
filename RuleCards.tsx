import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, MousePointer2, X } from "lucide-react";
import { ruleCards } from "../lessonData";
import { SpeechButton } from "./Visuals";

const cropPositions: Record<string, string> = {
  india: "43% 45%",
  china: "62% 42%",
  australia: "82% 44%",
};

interface RuleCardsProps {
  open: boolean;
  initialCard?: number;
  onClose: () => void;
}

export function RuleCards({ open, initialCard = 0, onClose }: RuleCardsProps) {
  const [active, setActive] = useState(initialCard);
  const closeRef = useRef<HTMLButtonElement>(null);
  const card = ruleCards[active];

  useEffect(() => {
    if (open) {
      setActive(initialCard);
      window.setTimeout(() => closeRef.current?.focus(), 50);
    }
  }, [open, initialCard]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.speechSynthesis?.cancel();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="rules-drawer" role="dialog" aria-modal="true" aria-labelledby="rules-title">
        <header className="rules-header">
          <div>
            <span className="eyebrow"><BookOpen size={15} /> Твоя опора на уроке</span>
            <h2 id="rules-title">Карточки правил</h2>
            <p>Открывай их в любой момент — даже во время миссии.</p>
          </div>
          <button ref={closeRef} className="icon-button modal-close" type="button" onClick={onClose} aria-label="Закрыть карточки">
            <X size={22} />
          </button>
        </header>

        <div className="rule-tabs" role="tablist" aria-label="Правила урока">
          {ruleCards.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={active === index}
              className={`rule-tab ${active === index ? "is-active" : ""}`}
              onClick={() => setActive(index)}
              key={item.id}
            >
              <span>{item.number}</span>
              <strong>{index === 0 ? "Are there any…?" : index === 1 ? "Short answers" : "How many…?"}</strong>
              {active === index && <Check size={16} />}
            </button>
          ))}
        </div>

        <article className="rule-card-detail" key={card.id} role="tabpanel">
          <div className="rule-card-main">
            <span className="rule-number">RULE {card.number}</span>
            <h3>{card.title}</h3>
            <p>{card.short}</p>
            <div className="rule-lines">
              {card.lines.map((line) => (
                <div className="rule-line" key={line}>
                  <span>{line}</span>
                  <SpeechButton text={line} />
                </div>
              ))}
            </div>
          </div>
          <div className="rule-examples">
            <span className="examples-label"><MousePointer2 size={14} /> Примеры из зон</span>
            {card.examples.map((example) => (
              <div className="rule-example" key={example.text}>
                <div
                  className="rule-example-image"
                  style={{
                    backgroundImage: "url('/images/ranger-scanner.jpg')",
                    backgroundPosition: cropPositions[example.image],
                  }}
                  role="img"
                  aria-label={`Иллюстрация зоны: ${example.image}`}
                />
                <div>
                  <div className="example-question">
                    <strong>{example.text}</strong>
                    <SpeechButton text={`${example.text} ${example.answer}`} />
                  </div>
                  <p>{example.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
        <footer className="rules-footer">
          <span>Запомни: <strong>any</strong> — в вопросе и отрицании.</span>
          <button type="button" className="button button-dark button-small" onClick={onClose}>Вернуться к миссии</button>
        </footer>
      </section>
    </div>
  );
}
