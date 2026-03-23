import { useState, useEffect } from "react";
import SCENES from "./scense";
import "./styles.css";

const TASKS = [
  {
    prompt: "What do you see in this image?",
    scene: "street",
    labels: [
      "Car","Person","Tree","Building","Bicycle","Street sign",
      "Bus","Bench","Child","Dog","Lamp post","Cloud"
    ]
  },
  {
    prompt: "What objects are in this kitchen scene?",
    scene: "kitchen",
    labels: [
      "Stove","Fridge","Table","Chair","Window","Pot",
      "Mug","Plant","Shelf","Clock","Sink","Cabinet"
    ]
  },
  {
    prompt: "What can you identify in this nature scene?",
    scene: "nature",
    labels: [
      "Tree","Mountain","River","Bird","Cloud","Rock",
      "Grass","Sun","Fog","Flower","Path","Sky"
    ]
  },
  {
    prompt: "What do you see in this workspace?",
    scene: "desk",
    labels: [
      "Laptop","Monitor","Keyboard","Mouse","Lamp","Notebook",
      "Pen","Plant","Phone","Coffee cup","Chair","Books"
    ]
  },
  {
    prompt: "What is present in this beach scene?",
    scene: "beach",
    labels: [
      "Ocean","Sand","Waves","Umbrella","Person","Boat",
      "Seagull","Rocks","Sunset","Palm tree","Shell","Towel"
    ]
  },
  {
    prompt: "What elements are in this city view?",
    scene: "city",
    labels: [
      "Skyscraper","Bridge","Road","Traffic","Park","River",
      "Crane","Billboard","Train","Pedestrians","Fountain","Statue"
    ]
  }
];

// SVG scenes copied exactly from your HTML


export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(
    TASKS.map(() => new Set())
  );
  const [startTime, setStartTime] = useState(Date.now());

  const task = TASKS[step];

  const toggle = (label) => {
    const newAnswers = [...answers];
    const set = new Set(newAnswers[step]);
    set.has(label) ? set.delete(label) : set.add(label);
    newAnswers[step] = set;
    setAnswers(newAnswers);
  };

  const go = (d) => {
    setStep((s) =>
      Math.max(0, Math.min(TASKS.length - 1, s + d))
    );
  };

  const finish = () => setStep(TASKS.length);

  const restart = () => {
    setAnswers(TASKS.map(() => new Set()));
    setStartTime(Date.now());
    setStep(0);
  };

  if (step >= TASKS.length) {
    return (
      <EndScreen
        answers={answers}
        startTime={startTime}
        restart={restart}
        review={() => setStep(0)}
      />
    );
  }

  const selected = answers[step];
  const pct = Math.round((step / TASKS.length) * 100);

  return (
    <div className="app">
      <Nav step={step} total={TASKS.length} />

      <main>
        <Progress pct={pct} />
        <Dots
          step={step}
          answers={answers}
          setStep={setStep}
        />

        <div className="card">
          <div className="card-header">
            <div className="card-sublabel">
              Image · Label task {step + 1}
            </div>
            <div className="card-prompt">{task.prompt}</div>
          </div>

          <div
            className="scene"
            dangerouslySetInnerHTML={{
              __html: SCENES[task.scene]
            }}
          />

          <div className="chips-area">
            <div className="chips-hint">
              {selected.size === 0
                ? "Select any labels that apply — or leave blank"
                : `${selected.size} label${
                    selected.size > 1 ? "s" : ""
                  } selected`}
            </div>

            <div className="chips-grid">
              {task.labels.map((lbl) => (
                <button
                  key={lbl}
                  className={`chip ${
                    selected.has(lbl) ? "on" : ""
                  }`}
                  onClick={() => toggle(lbl)}
                >
                  <span className="chip-dot" />
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <NavButtons
          step={step}
          total={TASKS.length}
          go={go}
          finish={finish}
        />
      </main>
    </div>
  );
}

function Nav({ step, total }) {
  return (
    <nav>
      <div className="logo">LabelOwl</div>
      <div className="nav-meta">
        Task {step + 1} of {total}
      </div>
    </nav>
  );
}

function Progress({ pct }) {
  return (
    <div className="prog-row">
      <div className="prog-track">
        <div
          className="prog-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="prog-lbl">{pct}%</span>
    </div>
  );
}

function Dots({ step, answers, setStep }) {
  return (
    <div className="dots-row">
      {answers.map((a, i) => {
        let cls = "dot";
        if (i === step) cls += " current";
        else if (i < step) cls += " past";
        else if (a.size > 0) cls += " has-labels";

        return (
          <div
            key={i}
            className={cls}
            onClick={() => setStep(i)}
          />
        );
      })}
    </div>
  );
}

function NavButtons({ step, total, go, finish }) {
  const isFirst = step === 0;
  const isLast = step === total - 1;

  return (
    <div
      className={`nav-btns ${isFirst ? "one" : "two"}`}
    >
      {!isFirst && (
        <button
          className="btn btn-back"
          onClick={() => go(-1)}
        >
          ← Back
        </button>
      )}

      {isLast ? (
        <button
          className="btn btn-finish"
          onClick={finish}
        >
          Finish ✓
        </button>
      ) : (
        <button
          className="btn btn-next"
          onClick={() => go(1)}
        >
          Next →
        </button>
      )}
    </div>
  );
}

function EndScreen({ answers, startTime, restart, review }) {
  const elapsed = Math.round(
    (Date.now() - startTime) / 1000
  );
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  const total = answers.reduce(
    (a, s) => a + s.size,
    0
  );
  const done = answers.filter((s) => s.size > 0).length;

  return (
    <div className="end-card">
      <div className="trophy">🏷️</div>
      <h2>Session complete!</h2>
      <p>
        You labeled {done} of {answers.length} images
        <br />
        and applied {total} labels total.
      </p>

      <div className="stats">
        <Stat n={done} label="Labeled" />
        <Stat n={total} label="Labels" />
        <Stat
          n={`${m}:${String(s).padStart(2, "0")}`}
          label="Time"
        />
      </div>

      <div className="nav-btns two">
        <button className="btn btn-back" onClick={review}>
          ← Review
        </button>
        <button className="btn btn-finish" onClick={restart}>
          Restart
        </button>
      </div>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div className="stat">
      <div className="stat-n">{n}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}