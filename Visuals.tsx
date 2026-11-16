import { useEffect, useState } from "react";
import { Pause, ScanLine, Volume2 } from "lucide-react";
import type { Mission } from "../lessonData";

export function SpeechButton({ text, label = "Прослушать фразу" }: { text: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.replace(/___/g, "blank"));
    utterance.lang = "en-GB";
    utterance.rate = 0.82;
    utterance.pitch = 1.04;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      className={`icon-button speech-button ${speaking ? "is-speaking" : ""}`}
      type="button"
      onClick={speak}
      aria-label={speaking ? "Остановить озвучивание" : label}
      title={speaking ? "Остановить" : label}
      disabled={!("speechSynthesis" in window)}
    >
      {speaking ? <Pause size={17} /> : <Volume2 size={18} />}
    </button>
  );
}

interface RangerVisualProps {
  mission?: Mission;
  secret?: boolean;
  className?: string;
  priority?: boolean;
}

export function RangerVisual({ mission, secret = false, className = "", priority = false }: RangerVisualProps) {
  const image = mission?.image ?? (secret ? "/images/secret-zone.jpg" : "/images/ranger-scanner.jpg");
  const zone = mission?.zone ?? (secret ? "Secret Zone" : "Junior Ranger HQ");

  return (
    <figure className={`ranger-visual ${className}`}>
      <img
        src={image}
        alt={
          secret || mission?.id === "secret"
            ? "Девочка-рейнджер сканирует Секретную зону с лисами, птицами и пауком"
            : "Девочка-рейнджер со сканером и голограммами зон крокодилов, панд и кенгуру"
        }
        style={{ objectPosition: mission?.imagePosition ?? "center" }}
        loading={priority ? "eager" : "lazy"}
      />
      <div className="visual-vignette" aria-hidden="true" />
      <div className="scan-line" aria-hidden="true" />
      <figcaption className="scan-caption">
        <span className="live-dot" aria-hidden="true" />
        <span>{zone}</span>
        <span className="scan-caption-status">LIVE SCAN</span>
      </figcaption>
      <div className="scan-corners" aria-hidden="true" />
      {mission && (
        <div className="scan-stats" aria-label="Данные сканера">
          <div className="scan-stats-heading">
            <ScanLine size={15} />
            <span>Данные сканера</span>
          </div>
          <div className="scan-stats-grid">
            {mission.stats.map((stat) => (
              <div className={`scan-stat ${!stat.present ? "is-empty" : ""}`} key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </figure>
  );
}

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? "is-small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 42 42" role="img">
        <path d="M21 4 36 12v18l-15 8L6 30V12Z" fill="currentColor" opacity=".16" />
        <path d="M21 5.5 34.5 13v16L21 36.5 7.5 29V13Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 26.5c5-1 7.8-5.2 9-12 4.5 3.4 7 7.1 8.5 11.2-5.2-.4-9.2.2-12 2.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 30c3.2-4.2 7-7 11.5-8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
