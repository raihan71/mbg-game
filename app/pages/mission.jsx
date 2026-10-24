import { useNavigate } from "react-router";
import { mission } from "../lib/mission";
import Shell from "../components/shell";
import Button from "../elements/button";
import ModelImage from "../components/model-image";
import { images, mealImages } from "../configs/images";

export default function Mission() {
  const go = useNavigate();
  return (
    <Shell phase="MISSION BRIEFING" step={1}>
      <section className="mission-layout">
        <div className="mission-copy">
          <span className="eyebrow">A NOTE FROM THE OPERATIONS DESK</span>
          <h1>
            Today’s
            <br />
            <em>assignment.</em>
          </h1>
          <p>The morning is young. The rice cooker has made no promises.</p>
          <Button
            variant="dark"
            onClick={() => {
              try {
                sessionStorage.setItem("mbg-safety", "100");
              } catch {}
              go("/kitchen");
            }}
          >
            Start cooking <span>↗</span>
          </Button>
          <button className="back-link" onClick={() => go("/")}>
            ← back to base
          </button>
        </div>
        <div className="mission-card">
          <div className="card-top">
            <span className="day-pill">DAILY MISSION · 01</span>
            <span className="status-dot" />{" "}
            <span className="status-text">READY-ISH</span>
          </div>
          <div className="school-line">
            <div>
              <span className="eyebrow">DESTINATION</span>
              <h2>{mission.school}</h2>
            </div>
            <ModelImage asset={images.chefHappy} className="mission-mascot" />
          </div>
          <div className="mission-stats">
            <div>
              <span>MEALS REQUIRED</span>
              <strong>100</strong>
            </div>
            <div>
              <span>DEADLINE</span>
              <strong>
                10:30 <small>AM</small>
              </strong>
            </div>
          </div>
          <div className="menu-block">
            <span className="eyebrow">TODAY’S MENU</span>
            <div className="menu-items">
              {mission.menu.map((item, i) => (
                <span key={item}>
                  <ModelImage asset={mealImages[i].image} decorative />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="weather-row">
            <span>☼ &nbsp;{mission.weather}</span>
            <span>
              DIFFICULTY &nbsp;<b>NORMAL-ISH</b>
            </span>
          </div>
          <div className="mission-stamp">
            APPROVED
            <br />
            <b>PROBABLY</b>
          </div>
        </div>
      </section>
    </Shell>
  );
}
