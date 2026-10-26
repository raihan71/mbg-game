import { House, RotateCw } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Shell from '../components/shell';
import Button from '../elements/button';
import Celebration from '../components/game/celebration';
import { useGame } from '../components/game-provider';
import { menuFor, countryFor } from '../lib/game';
import { sound, stopSound } from '../lib/audio';

export default function Results() {
  const go = useNavigate();
  const { game } = useGame();
  const run = game.run;
  const menu = menuFor(run);
  const country = countryFor(run);
  const late = run.drive.elapsed > 100;
  useEffect(() => {
    let timer;
    let attempts = 0;
    const cheer = () => {
      if (sound('cheer') || ++attempts >= 25) clearInterval(timer);
    };
    timer = setInterval(cheer, 200);
    cheer();
    return () => {
      clearInterval(timer);
      stopSound('cheer');
    };
  }, []);

  return (
    <Shell phase="DELIVERY COMPLETE" step={5}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden="true">
        <DotLottieReact src="/motions/particle-export.lottie" loop autoplay />
      </div>
      <section className="results-hero">
        <span className="eyebrow">
          DAY {game.day} COMPLETE · {country.flag} {country.school}
        </span>
        <Celebration color={country.color} school={country.school} />
        <h1>
          Lunch has <em>landed.</em>
        </h1>
        <p>
          {menu.name}, with every extra in its place. Happy students in{' '}
          {country.city} are cheering for their chef!
        </p>
        <div className="result-score">
          <span>TODAY’S SCORE</span>
          <strong>{run.score.toLocaleString('en-US')}</strong>
          <span className="rank-pill">
            {run.score >= 9000 ?
              'A · LUNCH HERO'
            : run.score >= 7000 ?
              'B · GREAT DELIVERY'
            : 'C · KEEP PRACTICING'}
          </span>
        </div>
      </section>
      <section className="results-grid">
        <div className="score-card">
          <span className="eyebrow">YOUR ADVENTURE</span>
          {[
            ['Menu', menu.name],
            ['Destination', country.name],
            ['Recipe & packing mistakes', run.mistakes],
            ['Traffic bumps', run.drive.hits],
            ['Delivery time', `${Math.floor(run.drive.elapsed)} seconds`],
            [
              'Arrival',
              late ? 'A little late, still a happy lunch' : 'Right on time',
            ],
          ].map(([label, value]) => (
            <div className="score-row" key={label}>
              <div>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            </div>
          ))}
        </div>
        <div className="reaction-card">
          <span className="eyebrow">A NOTE FROM THE SCHOOL</span>
          <h2>Thank you, chef!</h2>
          <p>
            “The whole class says hooray! You cooked our lunch, packed our
            extras, and brought it all the way to school.”
          </p>
          <p>
            {country.school} · {country.city}
          </p>
          <p className="game-notice">
            10,000 points − 200 per recipe or packing mistake − 100 per traffic
            bump − 20 per full second after 100 seconds.
          </p>
        </div>
      </section>
      <div className="results-actions">
        <Button onClick={() => go('/mission')}>
          Spin tomorrow’s menu <RotateCw aria-hidden="true" />
        </Button>
        <Button variant="quiet" onClick={() => go('/')}>
          Back to base <House aria-hidden="true" />
        </Button>
        <span className="best-note">
          PERSONAL BEST <b>{game.best.toLocaleString('en-US')}</b>
        </span>
      </div>
    </Shell>
  );
}
