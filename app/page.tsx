"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "countdown" | "playing" | "finished";
type Mole = { id: number; hole: number; golden: boolean };

const GAME_DURATION = 60_000;
const HOLE_COUNT = 9;

const gradeFor = (score: number) => {
  if (score >= 10400) return { grade: "A+", title: "地鼠剋星", line: "反應快得不像人類，農場今晚很安全。" };
  if (score >= 8300) return { grade: "A", title: "閃電快手", line: "節奏抓得很準，距離傳說只差一點。" };
  if (score >= 6200) return { grade: "B", title: "資深獵手", line: "很穩！加強後半段的反應就能再升級。" };
  if (score >= 4400) return { grade: "C", title: "合格守衛", line: "基本功不錯，連擊維持久一點會更強。" };
  if (score >= 2800) return { grade: "D", title: "農場新手", line: "已經上手了，再挑戰一次一定能進步。" };
  return { grade: "F", title: "地鼠的朋友", line: "別急著追，先盯住洞口再出手。" };
};

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [remainingMs, setRemainingMs] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [activeMoles, setActiveMoles] = useState<Mole[]>([]);
  const [flashHole, setFlashHole] = useState<number | null>(null);
  const [shareLabel, setShareLabel] = useState("分享成績");

  const endTimeRef = useRef(0);
  const nextIdRef = useRef(1);
  const lastHoleRef = useRef(-1);
  const activeMolesRef = useRef<Mole[]>([]);
  const timerIdsRef = useRef<Set<number>>(new Set());

  const later = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timerIdsRef.current.delete(id);
      fn();
    }, delay);
    timerIdsRef.current.add(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timerIdsRef.current.forEach((id) => window.clearTimeout(id));
    timerIdsRef.current.clear();
  }, []);

  const finishRound = useCallback(() => {
    clearTimers();
    activeMolesRef.current = [];
    setActiveMoles([]);
    setRemainingMs(0);
    setPhase("finished");
  }, [clearTimers]);

  const beginRound = useCallback(() => {
    setPhase("playing");
    endTimeRef.current = performance.now() + GAME_DURATION;

    const spawn = () => {
      const now = performance.now();
      const left = endTimeRef.current - now;
      if (left <= 0) {
        finishRound();
        return;
      }

      const progress = 1 - left / GAME_DURATION;
      const occupied = new Set(activeMolesRef.current.map((mole) => mole.hole));
      const choices = Array.from({ length: HOLE_COUNT }, (_, index) => index)
        .filter((index) => !occupied.has(index))
        .sort(() => Math.random() - 0.5);
      const roll = Math.random();
      const requestedWaveSize = progress < 0.18
        ? (roll < 0.18 ? 2 : 1)
        : progress < 0.45
          ? (roll < 0.5 ? 2 : 1)
          : progress < 0.72
            ? (roll < 0.18 ? 3 : roll < 0.68 ? 2 : 1)
            : (roll < 0.18 ? 4 : roll < 0.52 ? 3 : roll < 0.82 ? 2 : 1);
      const waveSize = Math.min(requestedWaveSize, 4 - activeMolesRef.current.length, choices.length);

      if (waveSize > 0) {
        const wave = choices.slice(0, waveSize).map((hole) => ({
          id: nextIdRef.current++,
          hole,
          golden: Math.random() < 0.07 + progress * 0.05,
        }));
        lastHoleRef.current = wave.at(-1)?.hole ?? lastHoleRef.current;
        const next = [...activeMolesRef.current, ...wave];
        activeMolesRef.current = next;
        setActiveMoles(next);

        const visibleFor = Math.round(1180 - progress * 500 + Math.random() * 100);
        wave.forEach((mole, index) => later(() => {
          if (!activeMolesRef.current.some((item) => item.id === mole.id)) return;
          const remaining = activeMolesRef.current.filter((item) => item.id !== mole.id);
          activeMolesRef.current = remaining;
          setActiveMoles(remaining);
          setMisses((value) => value + 1);
          setCombo(0);
        }, visibleFor + index * 28));
      }

      const pace = 950 - progress * 400;
      later(spawn, Math.max(500, pace + Math.random() * 120 - 45));
    };

    const updateClock = () => {
      const left = Math.max(0, endTimeRef.current - performance.now());
      setRemainingMs(left);
      if (left <= 0) {
        finishRound();
        return;
      }
      later(updateClock, 50);
    };

    later(spawn, 280);
    updateClock();
  }, [finishRound, later]);

  const startRound = useCallback(() => {
    clearTimers();
    activeMolesRef.current = [];
    nextIdRef.current = 1;
    lastHoleRef.current = -1;
    setActiveMoles([]);
    setScore(0);
    setHits(0);
    setMisses(0);
    setCombo(0);
    setBestCombo(0);
    setRemainingMs(GAME_DURATION);
    setShareLabel("分享成績");
    setCountdown(3);
    setPhase("countdown");

    let value = 3;
    const tick = () => {
      value -= 1;
      if (value <= 0) {
        beginRound();
        return;
      }
      setCountdown(value);
      later(tick, 800);
    };
    later(tick, 800);
  }, [beginRound, clearTimers, later]);

  const hitMole = (hole: number) => {
    if (phase !== "playing") return;
    const mole = activeMolesRef.current.find((item) => item.hole === hole);
    if (!mole) {
      setCombo(0);
      return;
    }

    const remaining = activeMolesRef.current.filter((item) => item.id !== mole.id);
    activeMolesRef.current = remaining;
    setActiveMoles(remaining);
    setHits((value) => value + 1);
    setCombo((value) => {
      const nextCombo = value + 1;
      setBestCombo((best) => Math.max(best, nextCombo));
      const bonus = mole.golden ? 250 : 100 + Math.min(Math.floor(nextCombo / 5) * 15, 75);
      setScore((current) => current + bonus);
      return nextCombo;
    });
    setFlashHole(hole);
    later(() => setFlashHole(null), 170);
    if (navigator.vibrate) navigator.vibrate(mole.golden ? [25, 30, 25] : 20);
  };

  const shareResult = async () => {
    const result = gradeFor(score);
    const text = `我在「地鼠快打」60 秒打中 ${hits} 隻，拿到 ${score} 分，評級 ${result.grade}！`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "地鼠快打成績", text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
        setShareLabel("已複製成績");
      }
    } catch {
      setShareLabel("分享取消");
    }
  };

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("mole-rush-best") || 0);
    setBestScore(saved);
    return clearTimers;
  }, [clearTimers]);

  useEffect(() => {
    if (phase !== "finished") return;
    setBestScore((current) => {
      const next = Math.max(current, score);
      window.localStorage.setItem("mole-rush-best", String(next));
      return next;
    });
  }, [phase, score]);

  const result = gradeFor(score);
  const accuracy = hits + misses === 0 ? 0 : Math.round((hits / (hits + misses)) * 100);
  const timerText = (remainingMs / 1000).toFixed(1);

  return (
    <main className="game-shell">
      <section className="game-card" aria-label="一分鐘打地鼠遊戲">
        <header className="game-header">
          <div className="eyebrow"><span className="live-dot" /> 60 秒限時挑戰</div>
          <h1>地鼠<span>快打</span></h1>
          <p>{phase === "playing" ? "越來越快了，守住你的連擊！" : "盯緊草地，越後面越快。"}</p>
        </header>

        <div className="hud" aria-label="遊戲狀態" aria-live="polite">
          <div className={remainingMs <= 10_000 && phase === "playing" ? "urgent" : ""}>
            <span>剩餘時間</span><strong>{timerText}<small>秒</small></strong>
          </div>
          <div><span>目前得分</span><strong>{score}<small>分</small></strong></div>
          <div><span>連擊</span><strong>×{combo}</strong></div>
        </div>

        <div className={`field ${phase === "playing" ? "is-playing" : ""}`} aria-label="九個地鼠洞">
          {Array.from({ length: HOLE_COUNT }).map((_, index) => {
            const mole = activeMoles.find((item) => item.hole === index);
            return (
              <button
                className={`hole ${mole ? "active" : ""} ${mole?.golden ? "golden" : ""} ${flashHole === index ? "whacked" : ""}`}
                key={index}
                type="button"
                onClick={() => hitMole(index)}
                aria-label={mole ? `${mole.golden ? "金色" : "一般"}地鼠，快打！` : `第 ${index + 1} 個空洞`}
                disabled={phase !== "playing"}
              >
                <span className="mole" aria-hidden="true"><i className="ear left" /><i className="ear right" /><i className="face"><b className="eyes" /><b className="nose" /><b className="teeth" /></i></span>
                <span className="pow" aria-hidden="true">+{mole?.golden ? 250 : 100}</span>
              </button>
            );
          })}

          {phase === "idle" && (
            <div className="field-overlay intro-panel">
              <span className="mini-mole" aria-hidden="true">●</span>
              <strong>準備好你的拇指</strong>
              <p>一般地鼠 100+ 分 · 金色地鼠 250 分<br />後半段最多 4 隻同時出現</p>
            </div>
          )}
          {phase === "countdown" && <div className="field-overlay countdown" aria-live="assertive">{countdown}</div>}
          {phase === "finished" && <div className="field-overlay finish-label">時間到！</div>}
        </div>

        {phase !== "playing" && phase !== "countdown" ? (
          <button className="start-button" type="button" onClick={startRound}>
            {phase === "finished" ? "再玩一次" : "開始挑戰"} <span>→</span>
          </button>
        ) : (
          <div className="playing-strip"><span>打中 {hits} 隻</span><span>最高連擊 ×{bestCombo}</span></div>
        )}
        <p className="hint">點擊冒出的地鼠 · 點空會中斷連擊</p>
        {bestScore > 0 && phase === "idle" && <p className="best-score">本機最佳紀錄 {bestScore} 分</p>}
      </section>

      {phase === "finished" && (
        <div className="result-backdrop" role="dialog" aria-modal="true" aria-labelledby="result-title">
          <section className="result-card">
            <div className={`grade grade-${result.grade.replace("+", "plus").toLowerCase()}`}>{result.grade}</div>
            <p className="result-kicker">本次評級</p>
            <h2 id="result-title">{result.title}</h2>
            <p className="result-line">{result.line}</p>
            <div className="result-score"><strong>{score}</strong><span>總得分</span></div>
            <div className="result-stats">
              <div><strong>{hits}</strong><span>打中</span></div>
              <div><strong>{accuracy}%</strong><span>命中率</span></div>
              <div><strong>×{bestCombo}</strong><span>最高連擊</span></div>
            </div>
            <p className="best-result">最佳紀錄：{Math.max(bestScore, score)} 分</p>
            <div className="result-actions">
              <button type="button" className="share-button" onClick={shareResult}>{shareLabel}</button>
              <button type="button" className="replay-button" onClick={startRound}>再玩一次</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
