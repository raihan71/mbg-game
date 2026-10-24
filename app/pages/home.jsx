import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Art from "../components/art";
import ModelImage from "../components/model-image";
import { images } from "../configs/images";
import { readBest } from "../lib/storage";
import Shell from "../components/shell";
import Button from "../elements/button";
export default function Home() {
  const go = useNavigate();
  const [best, setBest] = useState(0);
  useEffect(() => {
    setBest(readBest());
  }, []);
  return (
    <Shell>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">A LITTLE CARE. A LOT OF LUNCH.</span>
          <h1>
            Little lunches.
            <br />
            <em>Big adventures.</em>
          </h1>
          <p className="hero-sub">
            Cook with care. Pack a little happiness. Get one hundred warm
            lunches to school in your very own lunch adventure.
          </p>
          <div className="hero-actions">
            <Button onClick={() => go("/mission")}>
              Let’s get cooking <span>→</span>
            </Button>
            <Button
              variant="quiet"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              How it works <span>↓</span>
            </Button>
          </div>
          <div className="hero-foot">
            <span>3 little challenges</span>
            <span>100 happy lunches</span>
          </div>
        </div>
        <Art />
      </section>
      <div className="chapter-strip" aria-label="Your adventure">
        <span>
          <b>01</b> Cook with care
        </span>
        <span>
          <b>02</b> Pack it right
        </span>
        <span>
          <b>03</b> Deliver a smile
        </span>
      </div>
      <section className="story-section" id="how-it-works">
        <ModelImage asset={images.chefPlate} className="story-illustration" />
        <div>
          <span className="eyebrow">SMALL STEPS. REAL GOOD.</span>
          <h2>
            A good lunch
            <br />
            starts with you.
          </h2>
          <p>
            Meet your chef, check the ingredients, and bring a balanced meal
            together. Every safe choice makes a difference.
          </p>
          <button className="text-link" onClick={() => go("/mission")}>
            Meet today’s mission <span>→</span>
          </button>
        </div>
      </section>
      <section className="story-section story-reverse">
        <ModelImage
          asset={images.mealTray}
          className="story-illustration meal-illustration"
        />
        <div>
          <span className="eyebrow">ONE SCHOOL. ONE TEAM.</span>
          <h2>
            Ready. Set.
            <br />
            Lunch!
          </h2>
          <p>
            SD Merdeka is waiting. Fill each tray, hop in your van, and find
            your way through a wonderfully busy neighborhood.
          </p>
          <div className="personal-best">
            <span>YOUR PERSONAL BEST</span>
            <strong>
              {best ? best.toLocaleString("en-US") : "Your story starts here."}
            </strong>
          </div>
        </div>
      </section>
    </Shell>
  );
}
