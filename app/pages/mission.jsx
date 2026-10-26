import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router";
import Shell from "../components/shell";
import Button from "../elements/button";
import Roulette from "../components/game/roulette";
import { useGame } from "../components/game-provider";
import { menus, menuFor, runPath } from "../lib/game";
export default function Mission() {
  const go = useNavigate();
  const { game, dispatch, ready } = useGame();
  const active = game.run && game.run.phase !== "results";
  return (
    <Shell phase="MENU ROULETTE" step={1}>
      <section className="mission-layout">
        <div className="mission-copy">
          <span className="eyebrow">A NEW DAY. A FRESH RECIPE.</span>
          <h1>
            What’s for
            <br />
            <em>lunch?</em>
          </h1>
          <p>
            Spin for today’s menu. Find the right ingredients, cook your dish,
            then follow its packing ticket. A school somewhere in the world is
            waiting!
          </p>
          {active && (
            <div className="resume-card">
              <h2>Your lunch is waiting.</h2>
              <p>
                {menuFor(game.run).name} · Day {game.day} · {game.run.phase}
              </p>
              <Button onClick={() => go(runPath(game.run))}>
                Resume adventure <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          )}
          <button className="back-link" onClick={() => go("/")}>
            <ArrowLeft aria-hidden="true" /> back to base
          </button>
        </div>
        {ready &&
          (active ? (
            <div className="task-card">
              <h2>Finish today’s adventure.</h2>
              <p>
                Your menu and packing instructions are saved. Complete this
                delivery or cancel it to spin again from the beginning.
              </p>
              <Button onClick={() => go(runPath(game.run))}>
                Continue {game.run.phase} <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                variant="soft"
                className="mission-cancel"
                onClick={() => dispatch({ type: "CANCEL" })}
              >
                <RotateCcw aria-hidden="true" /> Cancel & start over
              </Button>
            </div>
          ) : (
            <Roulette
              items={menus}
              title="TODAY’S MENU ROULETTE"
              onPick={(menu) => {
                dispatch({ type: "NEW", menuId: menu.id });
                go("/kitchen");
              }}
            />
          ))}
      </section>
    </Shell>
  );
}
