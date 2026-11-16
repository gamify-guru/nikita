import { useEffect, useState } from "react";
import { ArrowRight, Check, LockKeyhole, MousePointer2, RotateCcw, ScanLine, Sparkles } from "lucide-react";

const fragments = [
  { name: "India", color: "#e9a23b" },
  { name: "China", color: "#54a875" },
  { name: "Australia", color: "#d8844f" },
];

interface PuzzleBoardProps {
  solved: boolean;
  onSolved: () => void;
  onContinue: () => void;
}

export function PuzzleBoard({ solved, onSolved, onContinue }: PuzzleBoardProps) {
  const [placed, setPlaced] = useState<boolean[]>(solved ? [true, true, true] : [false, false, false]);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("Выбери фрагмент и перенеси его в нужную часть карты.");

  useEffect(() => {
    if (solved) setPlaced([true, true, true]);
  }, [solved]);

  const placePiece = (pieceIndex: number, slotIndex: number) => {
    if (placed[pieceIndex]) return;
    if (pieceIndex !== slotIndex) {
      setMessage("Пока не совпадает. Посмотри на цвет и линии голограммы.");
      return;
    }
    const next = placed.map((value, index) => (index === pieceIndex ? true : value));
    setPlaced(next);
    setSelected(null);
    if (next.every(Boolean)) {
      setMessage("Карта восстановлена! Обнаружен неизвестный сигнал.");
      onSolved();
    } else {
      setMessage(`Фрагмент ${fragments[pieceIndex].name} установлен. Осталось: ${next.filter((value) => !value).length}.`);
    }
  };

  const reset = () => {
    setPlaced([false, false, false]);
    setSelected(null);
    setMessage("Фрагменты возвращены в рюкзак. Попробуй собрать карту снова.");
  };

  return (
    <section className="puzzle-screen screen-enter" aria-labelledby="puzzle-title">
      <header className="puzzle-heading">
        <span className="eyebrow"><Sparkles size={15} /> Все три сигнала получены</span>
        <h1 id="puzzle-title">Собери карту Секретной зоны</h1>
        <p>Соедини фрагменты India, China и Australia. Можно перетащить их мышью или нажать на фрагмент, а затем на место.</p>
      </header>

      <div className="puzzle-workspace">
        <div className="puzzle-map-wrap">
          <div className="map-status"><ScanLine size={15} /><span>{solved ? "SECRET SIGNAL FOUND" : "MAP RECONSTRUCTION"}</span><strong>{placed.filter(Boolean).length}/3</strong></div>
          <div className={`puzzle-map ${solved ? "is-solved" : ""}`}>
            {fragments.map((fragment, slotIndex) => (
              <button
                type="button"
                className={`puzzle-slot ${placed[slotIndex] ? "is-filled" : ""} ${selected !== null && !placed[slotIndex] ? "is-target" : ""}`}
                key={fragment.name}
                onClick={() => selected !== null && placePiece(selected, slotIndex)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const pieceIndex = Number(event.dataTransfer.getData("text/plain"));
                  if (Number.isInteger(pieceIndex)) placePiece(pieceIndex, slotIndex);
                }}
                aria-label={placed[slotIndex] ? `Фрагмент ${fragment.name} установлен` : `Пустое место ${slotIndex + 1}`}
                disabled={placed[slotIndex]}
              >
                <span
                  className="puzzle-image-segment"
                  style={{
                    backgroundImage: "url('/images/ranger-scanner.jpg')",
                    backgroundPosition: `${slotIndex * 50}% center`,
                  }}
                />
                {!placed[slotIndex] && <span className="slot-outline"><span>{slotIndex + 1}</span></span>}
                {placed[slotIndex] && !solved && <span className="placed-check"><Check size={15} /></span>}
              </button>
            ))}
            {solved && (
              <div className="secret-signal" aria-live="polite">
                <span><LockKeyhole size={18} /></span>
                <div><strong>UNKNOWN SIGNAL</strong><small>Новая зона обнаружена</small></div>
              </div>
            )}
          </div>
          <div className={`puzzle-message ${solved ? "is-success" : ""}`} role="status">
            {solved ? <Check size={17} /> : <MousePointer2 size={17} />}{message}
          </div>
        </div>

        <aside className="fragment-tray">
          <div className="tray-heading"><span>Рюкзак рейнджера</span><strong>{placed.filter((value) => !value).length} фрагмента</strong></div>
          <div className="fragment-list">
            {fragments.map((fragment, index) => (
              <button
                type="button"
                draggable={!placed[index]}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", String(index));
                  event.dataTransfer.effectAllowed = "move";
                  setSelected(index);
                }}
                onClick={() => {
                  if (placed[index]) return;
                  setSelected(selected === index ? null : index);
                  setMessage(`Фрагмент ${fragment.name} выбран. Теперь укажи его место на карте.`);
                }}
                className={`fragment-item ${selected === index ? "is-selected" : ""} ${placed[index] ? "is-placed" : ""}`}
                key={fragment.name}
                disabled={placed[index]}
              >
                <span
                  className="fragment-thumb"
                  style={{
                    backgroundImage: "url('/images/ranger-scanner.jpg')",
                    backgroundPosition: `${index * 50}% center`,
                    borderColor: fragment.color,
                  }}
                />
                <span><strong>{fragment.name}</strong><small>{placed[index] ? "На карте" : selected === index ? "Выбран" : "Перетащи или нажми"}</small></span>
                {placed[index] ? <Check size={18} /> : <span className="fragment-index">0{index + 1}</span>}
              </button>
            ))}
          </div>
          {!solved && placed.some(Boolean) && <button className="text-button" type="button" onClick={reset}><RotateCcw size={15} /> Разобрать и начать заново</button>}
          {solved && (
            <button className="button button-primary button-wide" type="button" onClick={onContinue}>
              Сканировать Секретную зону <ArrowRight size={18} />
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}
