import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { readBest, readSafety } from "../lib/storage";
import Shell from "../components/shell";
import Button from "../elements/button";
import ModelImage from "../components/model-image";
import { images } from "../configs/images";

export default function Results() {
  const go = useNavigate();
  const [params] = useSearchParams();
  const late = params.get("late");
  const [stored, setStored] = useState(null);
  const safety = stored?.safety ?? 100;
  const best = stored?.best ?? 0;
  const score = Math.max(0, (late ? 6940 : 8790) - (100 - safety) * 24);
  useEffect(() => {
    const safety = readSafety();
    const score = Math.max(0, (late ? 6940 : 8790) - (100 - safety) * 24);
    const best = Math.max(readBest(), score);
    try {
      localStorage.setItem("mbg-best", String(best));
    } catch {}
    setStored({ safety, best });
  }, [late]);
  const rank = safety < 75 ? "C" : late ? "B" : "A";
  return (
    <Shell phase="DAILY DEBRIEF" step={5}>
      <section className="results-hero">
        <ModelImage asset={images.chefHappy} className="result-mascot" />
        <span className="eyebrow">DAY COMPLETE · SD MERDEKA</span>
        <h1>
          {late ? (
            "We made it."
          ) : (
            <>
              Lunch has <em>landed.</em>
            </>
          )}
        </h1>
        <p>
          {late
            ? "The bell waits for no clipboard. The meals arrived, and that still counts."
            : "One hundred complete lunches. Everyone made it through the paperwork."}
        </p>
        <div className="result-score">
          <span>TODAY’S MBG SCORE</span>
          <strong>{score.toLocaleString("en-US")}</strong>
          <span className="rank-pill">
            RANK {rank} ·{" "}
            {safety < 75
              ? "PAPERWORK PENDING"
              : late
                ? "YANG PENTING SAMPAI"
                : "DAPUR AMAN"}
          </span>
        </div>
      </section>
      <section className="results-grid">
        <div className="score-card">
          <div className="score-card-head">
            <span className="eyebrow">THE BREAKDOWN</span>
            <span>OUT OF 100</span>
          </div>
          {[
            ["Food safety", safety],
            ["Packing accuracy", 100],
            ["Cooking quality", 88],
            ["Freshness", 92],
            ["On-time delivery", late ? 55 : 94],
          ].map(([label, n]) => (
            <div className="score-row" key={label}>
              <div>
                <span>{label}</span>
                <b>{n}%</b>
              </div>
              <div className="score-track">
                <i style={{ width: `${n}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="reaction-card">
          <span className="eyebrow">THE NEIGHBORHOOD FEED</span>
          <div className="reaction-post">
            <span className="avatar avatar-mint">i</span>
            <div>
              <b>
                @ibukantin <small>· just now</small>
              </b>
              <p>
                {late
                  ? "Makan siang datang agak sore, tapi masih hangat."
                  : "Hari ini datang tepat waktu. Mantap."}
              </p>
            </div>
          </div>
          <div className="reaction-post">
            <span className="avatar avatar-lav">42</span>
            <div>
              <b>
                @warganet42 <small>· 2m</small>
              </b>
              <p>
                {late
                  ? "The bell and lunch had different calendars."
                  : "A whole operation for one banana. Respect."}
              </p>
            </div>
          </div>
          <div className="trending">
            <span>TODAY’S TRENDING</span>
            <b>{late ? "#MakanSiangAtauMakanMalam" : "#ClipboardVictory"}</b>
            <small>Fictional neighborhood feed · in-game only</small>
          </div>
        </div>
      </section>
      <div className="results-actions">
        <Button variant="dark" onClick={() => go("/mission")}>
          Run it back <span>↗</span>
        </Button>
        <Button variant="quiet" onClick={() => go("/")}>
          Back to base <span>⌂</span>
        </Button>
        <span className="best-note">
          PERSONAL BEST &nbsp;
          <b>{Math.max(best, score).toLocaleString("en-US")}</b>
        </span>
      </div>
    </Shell>
  );
}
