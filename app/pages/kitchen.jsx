import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import Shell from '../components/shell';
import Button from '../elements/button';

const stations = [
  { id: 'crate', label: 'Ingredient crate', icon: '🥬', x: 13, y: 70 },
  { id: 'prep', label: 'Chop station', icon: '🔪', x: 74, y: 42 },
  { id: 'stove', label: 'Hot line', icon: '🔥', x: 48, y: 22 },
  { id: 'pass', label: 'Service pass', icon: '🍱', x: 88, y: 68 },
];

export default function Kitchen() {
  const go = useNavigate();
  const [state, setState] = useState({
    inspected: false,
    prepped: false,
    cooked: false,
    plated: false,
    safety: 100,
    accepted: false,
  });
  const [chef, setChef] = useState({ x: 50, y: 78 });
  const [notice, setNotice] = useState('');
  const keys = useRef({});

  useEffect(() => {
    const down = (event) => {
      const key = event.key.toLowerCase();
      if (
        [
          'arrowup',
          'arrowdown',
          'arrowleft',
          'arrowright',
          'w',
          'a',
          's',
          'd',
        ].includes(key)
      ) {
        event.preventDefault();
        keys.current[key] = true;
      }
    };
    const up = (event) => {
      keys.current[event.key.toLowerCase()] = false;
    };
    let frame;
    const move = () => {
      setChef((current) => {
        const dx =
          (keys.current.arrowright || keys.current.d ? 0.7 : 0) -
          (keys.current.arrowleft || keys.current.a ? 0.7 : 0);
        const dy =
          (keys.current.arrowdown || keys.current.s ? 0.5 : 0) -
          (keys.current.arrowup || keys.current.w ? 0.5 : 0);
        if (!dx && !dy) return current;
        return {
          x: Math.max(7, Math.min(93, current.x + dx)),
          y: Math.max(17, Math.min(84, current.y + dy)),
        };
      });
      frame = requestAnimationFrame(move);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    frame = requestAnimationFrame(move);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  function inspect(accept) {
    setState((s) => ({
      ...s,
      inspected: true,
      accepted: accept,
      safety: accept ? 55 : 100,
    }));
    try {
      sessionStorage.setItem('mbg-safety', accept ? '55' : '100');
    } catch {}
    setNotice(
      accept ?
        'You chose the “it’s probably fine” route. The clipboard disagrees.'
      : 'Questionable chicken rejected. The kitchen exhales.',
    );
  }

  function useStation(id) {
    const station = stations.find((item) => item.id === id);
    if (!station) return;
    setChef({ x: station.x, y: station.y + (id === 'stove' ? 14 : 10) });

    if (id === 'crate' && !state.inspected) {
      setNotice('Ingredient crate ready. Start with the suspicious chicken.');
      return;
    }
    if (id === 'prep' && state.inspected && !state.prepped) {
      setState((s) => ({ ...s, prepped: true }));
      setNotice(
        'Prep complete. The chopping board has entered its focused era.',
      );
      return;
    }
    if (id === 'stove' && state.prepped && !state.cooked) {
      setState((s) => ({ ...s, cooked: true }));
      setNotice('Safe zone reached. The rice cooker is taking a victory lap.');
      return;
    }
    if (id === 'pass' && state.cooked && !state.plated) {
      setState((s) => ({ ...s, plated: true }));
      setNotice(
        'Order up! One hundred lunches are ready for the loading dock.',
      );
      return;
    }
    if (id === 'prep' && !state.inspected)
      setNotice('Inspect the crate first. The kitchen has standards.');
    else if (id === 'stove' && !state.prepped)
      setNotice('Prep the chicken before you turn on the burners.');
    else if (id === 'pass' && !state.cooked)
      setNotice('Nothing to plate yet. Hot line first.');
  }

  const stage =
    !state.inspected ? 'INSPECT'
    : !state.prepped ? 'PREP'
    : !state.cooked ? 'COOK'
    : !state.plated ? 'PLATE'
    : 'READY';

  return (
    <Shell phase="KITCHEN · QUALITY CHECK" step={2}>
      <div className="game-heading">
        <div>
          <span className="eyebrow">PHASE 01 / 02</span>
          <h1>
            Handle with <em>care.</em>
          </h1>
        </div>
        <div className="hud-chip">
          <span>FOOD SAFETY</span>
          <b>{state.safety}%</b>
        </div>
      </div>
      <section className="kitchen-layout">
        <div className="kitchen-arena">
          <div className="kitchen-arena-top">
            <span className="kitchen-sticker">RUSH KITCHEN</span>
            <span className="kitchen-timer">
              RUSH METER {state.plated ? 'FULL' : 'LIVE'}
            </span>
          </div>
          <div className="station-map" aria-label="Kitchen stations">
            {stations.map((station) => (
              <button
                className={`station station-${station.id}`}
                key={station.id}
                style={{ left: `${station.x}%`, top: `${station.y}%` }}
                onClick={() => useStation(station.id)}>
                <span>{station.icon}</span>
                <b>{station.label}</b>
                <small>
                  {station.id === 'crate' ?
                    'CHECK'
                  : station.id === 'prep' ?
                    'CHOP'
                  : station.id === 'stove' ?
                    'COOK'
                  : 'PASS'}
                </small>
              </button>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="chef-avatar"
            style={{ left: `${chef.x}%`, top: `${chef.y}%` }}
            aria-label="Chef player"
          />
          <div className="kitchen-controls">
            <span>MOVE THE CHEF</span>
            <b>WASD / ARROWS</b>
            <small>Tap a station on mobile</small>
          </div>
          <div className="kitchen-progress">
            <span className={stage === 'INSPECT' ? 'active' : 'done'}>1</span>
            <i />
            <span
              className={
                stage === 'PREP' ? 'active'
                : state.prepped ?
                  'done'
                : ''
              }>
              2
            </span>
            <i />
            <span
              className={
                stage === 'COOK' ? 'active'
                : state.cooked ?
                  'done'
                : ''
              }>
              3
            </span>
            <i />
            <span
              className={
                stage === 'PLATE' ? 'active'
                : state.plated ?
                  'done'
                : ''
              }>
              4
            </span>
          </div>
        </div>
        <div className="task-card">
          <div className="task-head">
            <span className="eyebrow">QUALITY CONTROL</span>
            <span className="step-count">{stage} · 04</span>
          </div>
          <h2>
            {!state.inspected ?
              'Something smells fishy.'
            : !state.prepped ?
              'Chop, chop, chef.'
            : !state.cooked ?
              'Turn up the heat.'
            : !state.plated ?
              'Send it to the pass.'
            : 'Looking good, chef.'}
          </h2>
          <p>
            {!state.inspected ?
              'One chicken crate arrived with a suspiciously vague expiry label. What does the responsible clipboard-holder do?'
            : !state.prepped ?
              'Move to the chop station and prep the chicken before the hot line gets impatient.'
            : !state.cooked ?
              'Move to the hot line and cook the batch. Stop before it turns into a budget meeting.'
            : !state.plated ?
              'Move to the service pass and plate the complete meal. Fast hands, safe food.'
            : 'Everything is safely plated. Proceed to packing before the rice gets ideas.'
            }
          </p>
          {!state.inspected ?
            <div className="choice-row">
              <Button variant="dark" onClick={() => inspect(false)}>
                Reject crate <span>↗</span>
              </Button>
              <Button variant="soft" onClick={() => inspect(true)}>
                Use it anyway
              </Button>
            </div>
          : !state.prepped ?
            <Button
              variant="dark"
              className="full-button"
              onClick={() => useStation('prep')}>
              Chop the batch <span>↗</span>
            </Button>
          : !state.cooked ?
            <div className="cook-control">
              <div className="cook-track">
                <span />
                <i />
              </div>
              <div className="cook-labels">
                <span>RAW</span>
                <b>SAFE ZONE</b>
                <span>BURNT</span>
              </div>
              <Button
                variant="dark"
                className="full-button"
                onClick={() => useStation('stove')}>
                Stop in the safe zone <span>↗</span>
              </Button>
            </div>
          : !state.plated ?
            <Button
              variant="dark"
              className="full-button"
              onClick={() => useStation('pass')}>
              Plate the meals <span>↗</span>
            </Button>
          : <Button variant="dark" onClick={() => go('/packing')}>
              Pack the meals <span>↗</span>
            </Button>
          }
          {notice && (
            <div className={`notice ${state.accepted ? 'notice-warn' : ''}`}>
              <span>{state.accepted ? '!' : '✓'}</span>
              {notice}
            </div>
          )}
          <div className="task-foot">
            <span>FOOD SAFETY IS WORTH MORE THAN SPEED.</span>
            <span>01 / 04</span>
          </div>
        </div>
      </section>
      <div className="stage-note">
        <span>GOOD SYSTEMS MAKE SAFE CHOICES EASY.</span>
        <span>INGREDIENTS &nbsp;·&nbsp; TEMPERATURE &nbsp;·&nbsp; CARE</span>
      </div>
    </Shell>
  );
}
