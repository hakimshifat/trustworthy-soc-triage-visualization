/**
 * Design: Evidence Ledger — a vertically narrated research safety case. The page intentionally
 * uses visual labels, claims status, and interactive diagrams to distinguish results from plans.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  Database,
  Eye,
  FileLock2,
  GitBranch,
  Info,
  LockKeyhole,
  Play,
  Pause,
  RefreshCcw,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundCheck,
  XCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatusKind = "completed" | "active" | "planned" | "illustrative";
type FailureMode = "danger" | "safe";

const baselineData = [
  { name: "Logistic\nRegression", macroF1: 76.02, fill: "#91a7b2" },
  { name: "Random\nForest", macroF1: 76.91, fill: "#667f91" },
  { name: "Linear\nSVM", macroF1: 81.42, fill: "#173b5e" },
];

const attackText: Record<string, string> = {
  "Direct override": "[synthetic text: instruct a hypothetical tool to disregard evidence]",
  "Persona hijack": "[synthetic text: role-style framing embedded as evidence]",
  "Context manipulation": "[synthetic text: fabricated context framing embedded as evidence]",
  Obfuscation: "[synthetic text: encoded-looking harmless fragment]",
};

const assets = {
  "evidence-gate-logo.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894373008/UPZHFyWPjxuYDEUa.png",
  "soc-evidence-ledger-hero.jpg": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894373008/WDUYzWeaLFzObQiq.jpg",
  "provenance-threads.jpg": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894373008/CFwcgccNBSkOUkat.jpg",
  "calibration-gate.jpg": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894373008/mLqjZfyYxVnTjZRx.jpg",
} as const;

const asset = (file: keyof typeof assets) => assets[file];

const demoScenes = [
  {
    id: "overload",
    number: "01",
    chapter: "SOC alert overload",
    title: "A queue can grow faster than one analyst can inspect it.",
    caption: "The study targets one bounded task: help an L1 analyst distinguish likely true positives from false positives—without replacing the analyst.",
    status: "ILLUSTRATIVE CONTEXT",
  },
  {
    id: "provenance",
    number: "02",
    chapter: "Evidence boundaries",
    title: "Not every log value is trustworthy input.",
    caption: "Rule metadata may be sensor-controlled. Usernames, URLs, command lines, and payloads may be attacker-writable evidence—not instructions for the model.",
    status: "SYNTHETIC EXAMPLE",
  },
  {
    id: "policy",
    number: "03",
    chapter: "Bounded policy",
    title: "The small policy returns a verdict, a rationale, and cited evidence.",
    caption: "The planned QLoRA-tuned Qwen policy is a proposed P1 component. Structured output improves parseability, but does not prove semantic safety.",
    status: "P1 · PLANNED",
  },
  {
    id: "calibration",
    number: "04",
    chapter: "Separate correctness estimate",
    title: "A second component asks whether the first verdict is likely correct.",
    caption: "P(verdict correct) is not P(malicious). The proposed calibrator learns to estimate whether the target policy's own decision is reliable.",
    status: "P2 · PLANNED",
  },
  {
    id: "gate",
    number: "05",
    chapter: "Selective triage",
    title: "Only a frozen, label-specific gate can route an alert onward.",
    caption: "High-confidence FP may enter an auto-close candidate path. High-confidence TP is prioritized. Every uncertain or invalid outcome returns to an analyst.",
    status: "SIMULATED ROUTING",
  },
  {
    id: "attack",
    number: "06",
    chapter: "Safety-critical test",
    title: "The central test is whether confidence remains honest under attack.",
    caption: "P3 compares clean and injected alert pairs. A safe system becomes uncertain and defers; a false auto-close would be a critical negative result to preserve.",
    status: "P3 · PLANNED EVALUATION",
  },
] as const;

function StatusStamp({ kind, children }: { kind: StatusKind; children: React.ReactNode }) {
  const Icon = kind === "completed" ? CheckCircle2 : kind === "active" ? Clock3 : kind === "illustrative" ? Eye : CircleDashed;
  return (
    <span className={`stamp ${kind}`}>
      <Icon size={11} strokeWidth={2.1} />
      {children}
    </span>
  );
}

function SectionHeader({
  kicker,
  title,
  summary,
  aside,
}: {
  kicker: string;
  title: React.ReactNode;
  summary?: React.ReactNode;
  aside?: string;
}) {
  return (
    <div className="section-heading">
      <p className="section-kicker">{kicker}</p>
      <h2 className="section-title">{title}</h2>
      {summary && <p className="section-summary">{summary}</p>}
      {aside && <span className="section-aside-label">{aside}</span>}
    </div>
  );
}

function FlowReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [showProvenance, setShowProvenance] = useState(true);
  const [policyMode, setPolicyMode] = useState<"direct" | "rationale">("rationale");
  const [confidence, setConfidence] = useState(74);
  const [attackClass, setAttackClass] = useState("Direct override");
  const [attackField, setAttackField] = useState("Command line");
  const [failureMode, setFailureMode] = useState<FailureMode>("danger");
  const [maskingRun, setMaskingRun] = useState(0);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoSceneIndex, setDemoSceneIndex] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(true);
  const reducedMotion = useReducedMotion();
  const route = confidence >= 88 ? "auto" : confidence >= 78 ? "priority" : "review";
  const demoScene = demoScenes[demoSceneIndex];

  useEffect(() => {
    if (!demoOpen || !demoPlaying || reducedMotion) return;
    const sceneTimer = window.setTimeout(() => {
      setDemoSceneIndex((current) => (current + 1) % demoScenes.length);
    }, 6200);
    return () => window.clearTimeout(sceneTimer);
  }, [demoOpen, demoPlaying, demoSceneIndex, reducedMotion]);

  const routeCopy = useMemo(() => {
    if (route === "auto") return "Illustrative FP result would meet the auto-close candidate gate.";
    if (route === "priority") return "Illustrative TP result would meet the priority-review gate.";
    return "Below the illustrative gate: route this alert to normal analyst review.";
  }, [route]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const openDemo = () => {
    setDemoSceneIndex(0);
    setDemoPlaying(true);
    setDemoOpen(true);
  };

  return (
    <div className="app-shell">
      <div className="top-strip">
        <span className="dot" style={{ color: "#f2c478" }} />
        <span><strong>RESEARCH INTEGRITY NOTICE</strong> — completed P0 evidence, illustrative demos, and P1–P3 planned work are kept visibly separate.</span>
      </div>

      <header className="site-header">
        <a href="#top" className="brand-lockup" aria-label="Trustworthy SOC L1 Triage home">
          <img className="brand-logo" src={asset("evidence-gate-logo.png")} alt="Abstract evidence gate" />
          <span>
            <span className="brand-title">Trustworthy Triage</span>
            <span className="brand-subtitle">Evidence Ledger</span>
          </span>
        </a>
        <nav className="header-nav" aria-label="Research sections">
          <a href="#status">Status</a>
          <a href="#masking">Data masking</a>
          <a href="#system">System</a>
          <a href="#attack">Attack test</a>
          <a href="#evidence">Evidence</a>
        </nav>
        <div className="status-mini"><span className="dot" style={{ color: "#3d7e61" }} /> P0 verified <span className="dot" style={{ color: "#b77b2e" }} /> Data preparation active</div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <p className="eyebrow">Research visualization · SOC L1 triage</p>
            <h1 id="hero-heading">Trace the decision <em>before</em> you trust the gate.</h1>
            <p className="hero-lede">Can a lightweight local model reduce alert fatigue without confidently auto-closing an attacker-manipulated alert?</p>
            <div className="hero-actions">
              <button className="primary-action" onClick={openDemo}>
                <Play size={15} fill="currentColor" /> Start the demonstration
              </button>
              <button className="secondary-action" onClick={() => scrollTo("evidence")}>
                <ScanSearch size={16} /> Inspect completed evidence
              </button>
            </div>
            <div className="hero-note"><Info size={16} /> This is a transparent research simulator, not a live SOC product. All public alert values are synthetic, masked, or independently public.</div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <img className="hero-image" src={asset("soc-evidence-ledger-hero.jpg")} alt="" />
            <div className="hero-rail">
              <div className="hero-card">
                <div className="hero-card-label"><span className="dot" style={{ color: "#3d7e61" }} /> Completed baseline</div>
                <strong>81.42% macro-F1</strong>
                <p>Linear SVM, rule-ID-grouped audit, 178-alert Rieger corpus.</p>
                <div className="small-meter"><span style={{ width: "81.42%" }} /></div>
              </div>
              <div className="hero-card">
                <div className="hero-card-label"><span className="dot" style={{ color: "#b77b2e" }} /> Active preparation</div>
                <strong>Data masking</strong>
                <p>Confidential corpus is being assessed; experiment readiness remains pending.</p>
              </div>
              <div className="hero-card">
                <div className="hero-card-label"><span className="dot" style={{ color: "#2d8588" }} /> Central question</div>
                <strong>Can confidence abstain?</strong>
                <p>Under attacker-controlled content embedded in security evidence.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="content-frame">
          <section className="section" id="status" aria-labelledby="status-heading">
            <SectionHeader
              kicker="01 / Research state"
              title={<>A complete method,<br />an <i>incomplete claim.</i></>}
              summary={<>The design is intentionally explicit about what has been measured, what is actively being prepared, and what remains a testable hypothesis. <strong>Green is reserved for completed, reproducibility-verified work.</strong></>}
              aside="STATUS LEDGER"
            />
            <div className="status-grid">
              <FlowReveal delay={0.02}><article className="status-card"><StatusStamp kind="completed">Completed</StatusStamp><h3>P0 Classical baseline</h3><p>Rule-grouped classical audit completed on the public Rieger corpus, with reproducibility checks and uncertainty reporting.</p><span className="phase-index">PHASE 0 · VERIFIED</span></article></FlowReveal>
              <FlowReveal delay={0.08}><article className="status-card"><StatusStamp kind="active">Active preparation</StatusStamp><h3>Data masking</h3><p>Supervisor-provided confidential data is undergoing de-identification, provenance checks, deduplication, and readiness review.</p><span className="phase-index">READINESS · PENDING</span></article></FlowReveal>
              <FlowReveal delay={0.14}><article className="status-card"><StatusStamp kind="planned">Planned</StatusStamp><h3>P1 QLoRA policy</h3><p>Direct-label and rationale-plus-label Qwen policy comparisons await a documented dataset <b>GO</b> decision.</p><span className="phase-index">PHASE 1 · NOT RUN</span></article></FlowReveal>
              <FlowReveal delay={0.2}><article className="status-card"><StatusStamp kind="planned">Planned</StatusStamp><h3>P2–P3 calibration & attack</h3><p>Confidence calibration, frozen decision gates, adversarial testing, and defense comparison have not yet been run.</p><span className="phase-index">PHASES 2–3 · PENDING</span></article></FlowReveal>
            </div>
          </section>

          <div className="section-rule" />

          <section className="section" id="anatomy" aria-labelledby="anatomy-heading">
            <SectionHeader
              kicker="02 / Alert anatomy"
              title={<>An alert is evidence—<br />but not all of it is <i>trusted.</i></>}
              summary={<>Attackers can influence usernames, URLs, DNS queries, command lines, filenames, and payloads. The policy must receive those values as evidence to analyze, <strong>not instructions to obey.</strong></>}
              aside="SYNTHETIC EXAMPLE"
            />
            <div className="alert-anatomy">
              <FlowReveal>
                <div className="alert-sheet">
                  <div className="sheet-head"><span>Fully synthetic alert record</span><StatusStamp kind="illustrative">Illustrative</StatusStamp></div>
                  <table className="field-table">
                    <thead><tr><th>Field</th><th>Example</th><th>Provenance</th></tr></thead>
                    <tbody>
                      <tr className={showProvenance ? "trusted" : ""}><td>Rule severity</td><td>High</td><td>Trusted sensor metadata</td></tr>
                      <tr className={showProvenance ? "trusted" : ""}><td>Rule description</td><td>Suspicious process behavior</td><td>Trusted sensor metadata</td></tr>
                      <tr><td>Host</td><td>HOST_A</td><td>Masked contextual value</td></tr>
                      <tr className={showProvenance ? "untrusted" : ""}><td>Username</td><td>USER_17</td><td>Attacker-writable</td></tr>
                      <tr className={showProvenance ? "untrusted" : ""}><td>Command line</td><td>synthetic command</td><td>Potentially attacker-writable</td></tr>
                      <tr className={showProvenance ? "untrusted" : ""}><td>Destination</td><td>example.invalid</td><td>Potentially attacker-writable</td></tr>
                    </tbody>
                  </table>
                </div>
              </FlowReveal>
              <FlowReveal delay={0.1}>
                <div className="anatomy-side">
                  <div className="provenance-visual"><img src={asset("provenance-threads.jpg")} alt="Abstract provenance threads separating trusted and attacker-writable alert content" /></div>
                  <StatusStamp kind="illustrative">Interactive explainer</StatusStamp>
                  <h3 style={{ margin: "16px 0 9px", color: "var(--ink)", font: "400 29px/1.05 'DM Serif Display', serif", letterSpacing: "-0.03em" }}>Show the evidence boundary.</h3>
                  <p style={{ margin: 0, color: "#617587", fontSize: 14, lineHeight: 1.65 }}>Provenance must be preserved through normalization, rationales, calibration, and analyst review.</p>
                  <div className="toggle-row"><button className={`switch ${showProvenance ? "is-on" : ""}`} onClick={() => setShowProvenance(!showProvenance)} aria-pressed={showProvenance} aria-label="Toggle field provenance"><span /></button><span className="toggle-note">{showProvenance ? "Provenance colors shown" : "Provenance colors hidden"}</span></div>
                  <div className="provenance-key"><span><i className="key-square" style={{ background: "var(--trusted)" }} /> Trusted metadata</span><span><i className="key-square" style={{ background: "var(--untrusted)" }} /> Attacker-writable</span></div>
                </div>
              </FlowReveal>
            </div>
          </section>

          <div className="section-rule" />

          <section className="section masking-section" id="masking" aria-labelledby="masking-heading">
            <SectionHeader
              kicker="03 / Confidential-data preparation"
              title={<>Protect the record.<br />Preserve the <i>security meaning.</i></>}
              summary={<>Confidential records remain inside an access-controlled workspace. Data masking is a preparation process—not evidence that the corpus is anonymized, approved, or ready for experiments.</>}
              aside="ACTIVE PREPARATION"
            />
            <div className="masking-lab">
              <FlowReveal>
                <div className="masking-stage" key={maskingRun}>
                  <div className="masking-stage-head"><StatusStamp kind="active">Masking in progress</StatusStamp><span>SAFE ANIMATED EXPLAINER</span></div>
                  <div className="masking-stream" aria-hidden="true"><i /><i /><i /><i /><i /></div>
                  <div className="masking-sequence">
                    <article className="masking-step step-access"><span className="mask-icon"><LockKeyhole size={18} /></span><b>Access boundary</b><small>Controlled workspace</small></article>
                    <article className="masking-step step-detect"><span className="mask-icon"><ScanSearch size={18} /></span><b>Detect fields</b><small>Names, hosts, IDs, secrets</small></article>
                    <article className="masking-step step-replace"><span className="mask-icon"><RefreshCcw size={18} /></span><b>Mask safely</b><small>Pseudonymize or redact</small></article>
                    <article className="masking-step step-preserve"><span className="mask-icon"><ShieldCheck size={18} /></span><b>Check meaning</b><small>Security semantics retained</small></article>
                    <article className="masking-step step-review"><span className="mask-icon"><UserRoundCheck size={18} /></span><b>Human review</b><small>Privacy, labels, provenance</small></article>
                    <article className="masking-step step-candidate"><span className="mask-icon"><Database size={18} /></span><b>Candidate dataset</b><small>Readiness decision pending</small></article>
                  </div>
                  <div className="masking-records">
                    <div className="protected-record"><span><LockKeyhole size={13} /> PROTECTED SOURCE RECORD</span><i /><i /><i /><i /></div>
                    <ArrowRight className="masking-arrow" size={23} />
                    <div className="safe-record"><span><ShieldCheck size={13} /> SAFE EXPLAINER OUTPUT</span><code>HOST_0042</code><code>USER_0017</code><code>DOMAIN_0003.invalid</code><code>/home/USER_0017/project/file.exe</code></div>
                  </div>
                  <p className="masking-guardrail"><Info size={15} /> All values shown here are invented masking examples. No raw confidential record or reversible mapping is displayed.</p>
                </div>
              </FlowReveal>
              <FlowReveal delay={0.08}>
                <aside className="masking-notes">
                  <StatusStamp kind="active">Readiness is pending</StatusStamp>
                  <h3>Masking must retain evidence without retaining identities.</h3>
                  <p>The review checks for direct identifiers, internal infrastructure details, credentials, private addresses, organization references, and indirect identifiers in free text. Where relationships matter, approved stable pseudonyms can preserve them without exposing the source value.</p>
                  <div className="masking-callout"><FileLock2 size={19} /><p><strong>Not experiment-ready.</strong> Masking quality, labels, provenance, duplicates, contamination, shortcut risk, and field semantics must all be assessed before any dataset GO decision.</p></div>
                  <button className="secondary-action masking-replay" onClick={() => setMaskingRun((run) => run + 1)}><RefreshCcw size={15} /> Replay safe animation</button>
                </aside>
              </FlowReveal>
            </div>
          </section>

          <div className="section-rule" />

          <section className="section pipeline-section" id="system" aria-labelledby="system-heading">
            <SectionHeader
              kicker="04 / The bounded system"
              title={<>Classify. Calibrate.<br /><i>Then</i> decide whether to defer.</>}
              summary={<>The proposed system is deliberately narrow: binary TP/FP triage of already-raised alerts. It does not hunt, contain, remediate, or replace the analyst.</>}
              aside="OPERATIONAL FLOW"
            />
            <div className="pipeline-wrap">
              <div className="pipeline-ribbon" aria-hidden="true" />
              <div className="pipeline-grid">
                {[{ n: "01", t: "Alert", p: "A security sensor raises an alert.", f: "INPUT" }, { n: "02", t: "Provenance", p: "Trust category travels with every field.", f: "TAG" }, { n: "03", t: "Normalize", p: "Stable schema preserves raw values and boundaries.", f: "SERIALIZE" }, { n: "04", t: "Qwen policy", p: "Planned small local policy issues TP or FP.", f: "P1 · PENDING" }, { n: "05", t: "Calibrator", p: "Separate model estimates P(verdict correct).", f: "P2 · PENDING", c: "calibrator" }, { n: "06", t: "Decision gate", p: "Frozen label-specific gates route the alert.", f: "P2 · PENDING", c: "gate" }].map((node, index) => <FlowReveal delay={index * 0.055} key={node.n}><article className={`pipeline-node ${node.c ?? ""}`}><span className="node-number">{node.n}</span><h3>{node.t}</h3><p>{node.p}</p><div className="node-foot"><ChevronRight size={11} /> {node.f}</div></article></FlowReveal>)}
              </div>
            </div>
            <div className="policy-demo">
              <div className="policy-art"><img src={asset("calibration-gate.jpg")} alt="Abstract calibrated triage gate illustration" /></div>
              <div className="policy-panel">
                <StatusStamp kind="illustrative">Illustrative P1 output</StatusStamp>
                <h3 style={{ margin: "19px 0 15px", color: "var(--ink)", font: "400 33px/1 'DM Serif Display', serif", letterSpacing: "-0.035em" }}>Policy output must be structured—not assumed safe.</h3>
                <div className="segmented" role="tablist" aria-label="Policy output mode"><button className={policyMode === "direct" ? "active" : ""} onClick={() => setPolicyMode("direct")} role="tab" aria-selected={policyMode === "direct"}>Direct label</button><button className={policyMode === "rationale" ? "active" : ""} onClick={() => setPolicyMode("rationale")} role="tab" aria-selected={policyMode === "rationale"}>Rationale + label</button></div>
                <div className="output-card">
                  {policyMode === "direct" ? <pre>{`{\n  "verdict": "TP"\n}`}</pre> : <pre><span className="json-key">{`{\n  "verdict": `}</span><span className="json-value">"TP"</span>{`,\n  "rationale": "Process behavior and destination conflict with expected administration.",\n  "evidence_fields": ["process.command_line", "network.destination"]\n}`}</pre>}
                </div>
                <p className="output-caption">Grammar-constrained JSON can make output parseable. It cannot establish that the verdict is correct, rationale faithful, or injection ignored.</p>
              </div>
            </div>
          </section>

          <div className="section-rule" />

          <section className="section" id="calibration" aria-labelledby="calibration-heading">
            <SectionHeader
              kicker="05 / Correctness, not maliciousness"
              title={<>A separate component must ask:<br /><i>“Is the verdict likely right?”</i></>}
              summary={<>The calibrator receives the alert, policy rationale, cited evidence, and verdict. It estimates correctness of that verdict—<strong>not the probability that the alert is malicious.</strong></>}
              aside="SIMULATED VALUES"
            />
            <div className="confidence-lab">
              <FlowReveal>
                <div className="meter-list">
                  <div className="confidence-meter"><div className="meter-head"><span>Raw label-token probability</span><strong>0.96</strong></div><div className="meter-bar"><span style={{ width: "96%", background: "var(--trusted)" }} /></div><p className="meter-caption">A token-generation property; it is not directly an error-calibrated operating probability.</p></div>
                  <div className="confidence-meter"><div className="meter-head"><span>Model-stated confidence</span><strong>0.99</strong></div><div className="meter-bar"><span style={{ width: "99%", background: "var(--untrusted)" }} /></div><p className="meter-caption">A persuasive verbal statement can remain high even when a model is wrong.</p></div>
                  <div className="confidence-meter"><div className="meter-head"><span>Separate calibrator P(verdict correct)</span><strong>0.41</strong></div><div className="meter-bar"><span style={{ width: "41%", background: "var(--calibration)" }} /></div><p className="meter-caption">The proposed gate uses this distinct estimate, trained on the target policy’s own traces.</p></div>
                </div>
              </FlowReveal>
              <FlowReveal delay={0.09}><aside className="clarifier"><ShieldCheck size={29} color="#8fd1cd" /><h3>0.41 is not “41% malicious.”</h3><p>It means: given the alert and this policy output, the calibrator estimates a <strong>41% chance that the verdict itself is correct.</strong> That distinction is the foundation of selective triage.</p></aside></FlowReveal>
            </div>
          </section>

          <section className="section" id="gate" aria-labelledby="gate-heading">
            <SectionHeader
              kicker="06 / Selective decision gate"
              title={<>Every uncertain result<br />returns to the <i>analyst.</i></>}
              summary={<>Final TP and FP thresholds must be selected on clean validation data and frozen before adversarial tests are opened. The slider below is a visual explainer only—<strong>not a claimed threshold or precision result.</strong></>}
              aside="INTERACTIVE EXPLAINER"
            />
            <div className="gate-layout">
              <FlowReveal>
                <div className="gate-controls">
                  <StatusStamp kind="illustrative">Illustrative routing</StatusStamp>
                  <div style={{ marginTop: 27 }} className="control-label"><span>Simulated correctness confidence</span><strong>{confidence}%</strong></div>
                  <input aria-label="Simulated verdict correctness confidence" className="range-control" style={{ "--range-progress": `${confidence}%` } as React.CSSProperties} type="range" min="0" max="100" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} />
                  <div className="control-label"><span>0%</span><span>Analyst review</span><span>100%</span></div>
                  <div className="decision-readout"><p><strong>Current illustrative outcome:</strong> {routeCopy}</p></div>
                </div>
              </FlowReveal>
              <FlowReveal delay={0.08}>
                <div className="route-lanes">
                  <article className={`route-lane autoclose ${route === "auto" ? "active" : ""}`}><span className="route-icon" style={{ color: "var(--verified)" }}><Check size={18} /></span><div><h4>Auto-close candidate</h4><p>High-confidence FP verdict, subject to approved operating policy.</p></div><span className={`route-state ${route === "auto" ? "active" : ""}`}>{route === "auto" ? "selected" : "gate not met"}</span></article>
                  <article className={`route-lane priority ${route === "priority" ? "active" : ""}`}><span className="route-icon" style={{ color: "var(--trusted)" }}><ArrowUpRightIcon /></span><div><h4>Priority analyst review</h4><p>High-confidence TP verdict, never automatic containment.</p></div><span className={`route-state ${route === "priority" ? "active" : ""}`}>{route === "priority" ? "selected" : "gate not met"}</span></article>
                  <article className={`route-lane review ${route === "review" ? "active" : ""}`}><span className="route-icon" style={{ color: "var(--review)" }}><UserRoundCheck size={17} /></span><div><h4>Normal analyst review</h4><p>Low confidence, invalid output, or any threshold not crossed.</p></div><span className={`route-state ${route === "review" ? "active" : ""}`}>{route === "review" ? "selected" : "standing route"}</span></article>
                </div>
              </FlowReveal>
            </div>
          </section>

          <div className="section-rule" />

          <section className="section" id="attack" aria-labelledby="attack-heading">
            <SectionHeader
              kicker="07 / Paired adversarial test"
              title={<>Change one writable field.<br />Keep the <i>label</i> fixed.</>}
              summary={<>The P3 design compares a clean source alert with an injected copy. The ground-truth TP/FP label and trusted metadata stay unchanged; the same frozen system evaluates both records.</>}
              aside="P3 · PLANNED"
            />
            <div className="attack-lab">
              <div className="attack-toolbar">
                <div><StatusStamp kind="planned">Pending confirmatory experiment</StatusStamp><p style={{ margin: "13px 0 0", maxWidth: 600, color: "#5e747b", fontSize: 13, lineHeight: 1.55 }}>Safe synthetic phrasing is used below to demonstrate the evaluation design. It is not a real attack payload or a reported P3 outcome.</p></div>
                <div className="attack-selectors">
                  <div className="selector-group"><label htmlFor="attack-class">Attack class</label><select id="attack-class" value={attackClass} onChange={(e) => setAttackClass(e.target.value)}><option>Direct override</option><option>Persona hijack</option><option>Context manipulation</option><option>Obfuscation</option></select></div>
                  <div className="selector-group"><label htmlFor="attack-field">Eligible field</label><select id="attack-field" value={attackField} onChange={(e) => setAttackField(e.target.value)}><option>Command line</option><option>Username</option><option>Destination</option><option>DNS query</option></select></div>
                </div>
              </div>
              <div className="attack-comparison">
                <article className="attack-card"><StatusStamp kind="illustrative">Clean source alert</StatusStamp><h3>Clean record</h3><dl><div><dt>Rule metadata</dt><dd>High · suspicious process behavior</dd></div><div><dt>Host</dt><dd>HOST_A</dd></div><div><dt>{attackField}</dt><dd>synthetic normal evidence value</dd></div></dl></article>
                <div className="paired-arrow"><ArrowRight size={27} /><span>one field changes</span></div>
                <article className="attack-card injected"><StatusStamp kind="illustrative">Injected variant</StatusStamp><h3>Paired record</h3><dl><div><dt>Rule metadata</dt><dd>High · suspicious process behavior</dd></div><div><dt>Host</dt><dd>HOST_A</dd></div><div><dt>{attackField}</dt><dd className="highlight">{attackText[attackClass]}</dd></div></dl></article>
              </div>
              <div className="attack-integrity"><span><CheckCircle2 size={14} color="#3d7e61" /> Ground-truth label unchanged</span><span><CheckCircle2 size={14} color="#3d7e61" /> Trusted metadata unchanged</span><span><CheckCircle2 size={14} color="#3d7e61" /> Same frozen system</span><span><CheckCircle2 size={14} color="#3d7e61" /> One selected writable field</span></div>
            </div>
          </section>

          <section className="section" id="failure" aria-labelledby="failure-heading">
            <SectionHeader
              kicker="08 / The safety-critical failure"
              title={<>The danger is not only an error.<br />It is an error the system is <i>willing to automate.</i></>}
              summary={<>Both sequences below are hypotheses for P3 testing. A useful result may show that the system abstains safely—or that clean-trained calibration stays confidently wrong under attack.</>}
              aside="HYPOTHESES, NOT FINDINGS"
            />
            <div className="failure-sheet">
              <FlowReveal>
                <div className={`failure-diagram ${failureMode === "safe" ? "safe" : ""}`}>
                  {failureMode === "danger" ? <div className="failure-track"><FailureStep n="1" text="Actual malicious alert" /><FailureConnector /><FailureStep n="2" text="Injected attacker-controlled field" /><FailureConnector /><FailureStep n="3" text="Policy changes TP to FP" danger /><FailureConnector /><FailureStep n="4" text="Calibrator remains highly confident" danger /><FailureConnector /><FailureStep n="5" text="FP gate is crossed → false auto-close" danger /></div> : <div className="failure-track"><FailureStep n="1" text="Actual malicious alert" /><FailureConnector /><FailureStep n="2" text="Injected field creates inconsistency" /><FailureConnector /><FailureStep n="3" text="Policy or calibrator becomes uncertain" safe /><FailureConnector /><FailureStep n="4" text="Gate is not crossed" safe /><FailureConnector /><FailureStep n="5" text="Alert goes to analyst review" safe /></div>}
                </div>
              </FlowReveal>
              <FlowReveal delay={0.1}>
                <div className="failure-side">
                  {failureMode === "danger" ? <><StatusStamp kind="illustrative">Failure hypothesis</StatusStamp><h3>High confidence can make a wrong FP decision operationally worse.</h3><p><strong>False auto-close</strong> is the key security measure: a real TP alert predicted as a high-confidence FP and admitted to the auto-close path.</p></> : <><StatusStamp kind="illustrative">Desired safe response</StatusStamp><h3>The gate should not be crossed when evidence becomes inconsistent.</h3><p className="safe-copy"><strong>Selective abstention</strong> leaves the uncertain case with an analyst. This is a safety outcome to be measured, not assumed.</p></>}
                  <div className="replay-controls"><button className="primary-action" onClick={() => setFailureMode(failureMode === "danger" ? "safe" : "danger")}>{failureMode === "danger" ? <><RefreshCcw size={15} /> Rewind to safe response</> : <><ShieldAlert size={15} /> Show failure hypothesis</>}</button><button className="quiet-action" onClick={() => setFailureMode("danger")}><RefreshCcw size={14} /> Reset</button></div>
                </div>
              </FlowReveal>
            </div>
          </section>

          <div className="section-rule" />

          <section className="section" id="splits" aria-labelledby="splits-heading">
            <SectionHeader
              kicker="09 / Experimental separation"
              title={<>One source alert, one partition.<br /><i>Derivatives never become new samples.</i></>}
              summary={<>The policy, calibrator, threshold, and test roles must remain disjoint. Eight archived model responses from one source alert are eight outputs—not eight independent alerts.</>}
              aside="METHOD CONTROL"
            />
            <div className="split-wall">
              <div className="split-wall-header"><StatusStamp kind="planned">Required design constraint</StatusStamp><p>Splitting happens by unique source alert or scenario before traces, synthetic variants, or injected records are generated. Every derivative stays in the same partition as its source.</p></div>
              <div className="data-vaults">
                <div className="vault"><Database size={20} color="#306a9a" /><h4>D_policy</h4><p>Policy fine-tuning only.</p><div className="vault-track"><span style={{ width: "74%" }} /></div></div>
                <div className="vault"><GitBranch size={20} color="#2d8588" /><h4>D_cal</h4><p>Target-policy trace generation and calibrator training.</p><div className="vault-track"><span style={{ width: "68%" }} /></div></div>
                <div className="vault"><SlidersHorizontal size={20} color="#b77b2e" /><h4>D_threshold</h4><p>Clean, label-specific threshold selection.</p><div className="vault-track"><span style={{ width: "51%" }} /></div></div>
                <div className="vault"><FileLock2 size={20} color="#3d7e61" /><h4>D_test</h4><p>One-time clean and paired adversarial evaluation.</p><div className="vault-track"><span style={{ width: "33%" }} /></div></div>
              </div>
              <div className="derivative-note"><AlertTriangle size={16} /> Do not animate repeated responses as independent alerts. Keep the source alert and all trace / injection derivatives physically together.</div>
            </div>
          </section>

          <div className="section-rule" />

          <section className="section" id="evidence" aria-labelledby="evidence-heading">
            <SectionHeader
              kicker="10 / Completed P0 evidence"
              title={<>The classical floor is a real result.<br />Its limits are <i>real, too.</i></>}
              summary={<>The completed baseline is a dataset-specific floor, not a production accuracy claim. The public corpus has 178 alerts and 74 observed rule clusters; uncertainty is deliberately reported.</>}
              aside="COMPLETED PROJECT RESULT"
            />
            <div className="results-layout">
              <FlowReveal>
                <div className="chart-card">
                  <div className="chart-head"><div><h3>Grouped macro-F1 comparison</h3><p>Five-fold cross-validation grouped by rule ID.</p></div><StatusStamp kind="completed">P0</StatusStamp></div>
                  <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={baselineData} margin={{ top: 28, right: 8, left: -22, bottom: 0 }}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#697985", fontSize: 10, fontFamily: "IBM Plex Mono" }} interval={0} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: "#82909a", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickFormatter={(value) => `${value}%`} /><Tooltip cursor={{ fill: "rgba(23,59,94,0.05)" }} contentStyle={{ background: "#fffdfa", border: "1px solid #d9cfbf", borderRadius: 0, fontFamily: "IBM Plex Sans" }} formatter={(value: number) => [`${value.toFixed(2)}%`, "Macro-F1"]} /><Bar dataKey="macroF1" radius={[0, 0, 0, 0]} maxBarSize={68}>{baselineData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}<LabelList dataKey="macroF1" position="top" formatter={(v: number) => `${v.toFixed(2)}%`} style={{ fill: "#173b5e", fontSize: 11, fontWeight: 600, fontFamily: "IBM Plex Mono" }} /></Bar></BarChart></ResponsiveContainer></div>
                  <p className="chart-caption"><Info size={14} /> Completed project result on the 178-alert Rieger corpus under rule-ID-grouped evaluation; not a production estimate.</p>
                </div>
              </FlowReveal>
              <FlowReveal delay={0.1}>
                <aside className="metric-stack"><div className="metric-lead"><StatusStamp kind="completed">Primary model</StatusStamp><h3>Linear SVM</h3><p>Strongest completed P0 result under the grouped audit.</p></div><div className="metric-grid"><div className="metric-cell"><strong>82.19%</strong><span>Mean accuracy</span></div><div className="metric-cell"><strong>81.42%</strong><span>Mean macro-F1</span></div><div className="metric-cell"><strong>14.42%</strong><span>Mean FPR</span></div><div className="metric-cell"><strong>81.84%</strong><span>Pooled OOF macro-F1</span></div><div className="metric-cell" style={{ gridColumn: "1 / -1" }}><strong>70.76–89.61%</strong><span>Rule-cluster bootstrap 95% interval for pooled macro-F1</span></div></div></aside>
              </FlowReveal>
            </div>
            <div className="pending-matrix">
              <div className="matrix-head"><h3>Pending results matrix</h3><StatusStamp kind="planned">No results invented</StatusStamp></div>
              <table className="matrix-table"><thead><tr><th>Research phase</th><th>Comparison</th><th>Required outputs</th><th>Status</th></tr></thead><tbody><tr><td>P1 policy</td><td>Direct label vs. rationale + label</td><td>Macro-F1, FPR, parse success, latency, peak VRAM</td><td className="pending-cell">TBD AFTER FROZEN CONFIRMATORY EXPERIMENT</td></tr><tr><td>P2 calibration</td><td>Four confidence methods</td><td>NLL, Brier, AUROC, class-conditional ECE, risk-coverage</td><td className="pending-cell">TBD AFTER FROZEN CONFIRMATORY EXPERIMENT</td></tr><tr><td>P3 adversarial test</td><td>Attack field × class × defense</td><td>Attack success, false auto-close, severity, attack-conditional ECE</td><td className="pending-cell">TBD AFTER FROZEN CONFIRMATORY EXPERIMENT</td></tr></tbody></table>
            </div>
          </section>
        </div>

        <section className="closing" aria-labelledby="closing-heading">
          <div className="content-frame">
            <p className="section-kicker" style={{ color: "#9ab4c4" }}>11 / Central takeaway</p>
            <h2 id="closing-heading" className="closing-quote">The research does not ask whether AI can always replace an analyst. It asks <em>when it should be trusted</em>, when it should abstain, and whether that trust survives adversarial content inside the evidence itself.</h2>
            <div className="closing-footer"><div><p>Success is not simply higher accuracy. It is evidence about whether attacked errors stay below the automation gate—and an honest record if they do not.</p><div className="integrity-list"><span><LockKeyhole size={13} /> No confidential records</span><span><ShieldCheck size={13} /> Assist, not replace</span><span><XCircle size={13} /> No automatic containment</span><span><CheckCircle2 size={13} /> Preserve negative results</span></div></div><div className="footer-mark"><img src={asset("evidence-gate-logo.png")} alt="" /> Trustworthy Triage<br />Research Visualization</div></div>
          </div>
        </section>
      </main>
      <DemoPlayer
        active={demoOpen}
        playing={demoPlaying}
        scene={demoScene}
        sceneIndex={demoSceneIndex}
        onClose={() => setDemoOpen(false)}
        onTogglePlayback={() => setDemoPlaying((playing) => !playing)}
        onPrevious={() => setDemoSceneIndex((current) => (current - 1 + demoScenes.length) % demoScenes.length)}
        onNext={() => setDemoSceneIndex((current) => (current + 1) % demoScenes.length)}
        onSelectScene={setDemoSceneIndex}
      />
    </div>
  );
}

function DemoPlayer({
  active,
  playing,
  scene,
  sceneIndex,
  onClose,
  onTogglePlayback,
  onPrevious,
  onNext,
  onSelectScene,
}: {
  active: boolean;
  playing: boolean;
  scene: (typeof demoScenes)[number];
  sceneIndex: number;
  onClose: () => void;
  onTogglePlayback: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelectScene: (index: number) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="demo-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Animated research demonstration"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            className="demo-player"
            initial={reduced ? false : { opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.34, ease: [0.23, 1, 0.32, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="demo-player-head">
              <div className="demo-brand"><img src={asset("evidence-gate-logo.png")} alt="" /><span><b>Guided research demonstration</b><small>Video-style sequence · 6 scenes</small></span></div>
              <button className="demo-close" onClick={onClose} aria-label="Close animated demonstration"><X size={20} /></button>
            </header>
            <div className="demo-stage-wrap">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scene.id}
                  className={`demo-stage demo-scene-${scene.id}`}
                  initial={reduced ? false : { opacity: 0, y: 15, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduced ? undefined : { opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className="demo-stage-grid" aria-hidden="true" />
                  <DemoSceneVisual scene={scene.id} />
                  <div className="demo-scene-meta"><span>{scene.number} / 06</span><StatusStamp kind="illustrative">{scene.status}</StatusStamp></div>
                  <div className="demo-scene-copy"><p>{scene.chapter}</p><h2>{scene.title}</h2></div>
                </motion.div>
              </AnimatePresence>
              <div className="demo-captions"><span className="caption-tag">ON-SCREEN NARRATION</span><p>{scene.caption}</p></div>
            </div>
            <footer className="demo-controls">
              <div className="demo-play-controls"><button onClick={onPrevious} aria-label="Previous scene"><ChevronRight size={19} style={{ transform: "rotate(180deg)" }} /></button><button className="demo-play-button" onClick={onTogglePlayback} aria-label={playing ? "Pause animation" : "Play animation"}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}{playing ? "Pause" : "Play"}</button><button onClick={onNext} aria-label="Next scene"><ChevronRight size={19} /></button></div>
              <div className="demo-timeline" aria-label="Scene navigation">{demoScenes.map((item, index) => <button key={item.id} className={`timeline-segment ${index === sceneIndex ? "current" : ""} ${index < sceneIndex ? "watched" : ""}`} onClick={() => onSelectScene(index)} aria-label={`Go to scene ${index + 1}: ${item.chapter}`}><span /></button>)}</div>
              <span className="demo-timecode">{scene.number} · {playing ? "PLAYING" : "PAUSED"}</span>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DemoSceneVisual({ scene }: { scene: (typeof demoScenes)[number]["id"] }) {
  if (scene === "overload") {
    return <div className="scene-art overload-art"><div className="alert-stream left">{["DNS anomaly", "Process event", "HTTP signal", "Rule hit", "Endpoint alert"].map((label, index) => <span key={label} style={{ "--delay": `${index * 0.16}s` } as React.CSSProperties}>{label}</span>)}</div><div className="scene-analyst"><div className="analyst-head" /><div className="analyst-body" /><i /></div><div className="alert-stream right">{["Queue +1", "Queue +1", "Queue +1", "Queue +1"].map((label, index) => <span key={`${label}-${index}`} style={{ "--delay": `${0.4 + index * 0.18}s` } as React.CSSProperties}>{label}</span>)}</div><div className="overload-route"><b>TRIAGE</b><i /><i /><i /></div></div>;
  }
  if (scene === "provenance") {
    return <div className="scene-art provenance-art"><div className="provenance-card"><span className="pv-title">SYNTHETIC ALERT</span><div className="pv-row trusted-row"><b>Rule severity</b><i>High</i><small>Trusted</small></div><div className="pv-row trusted-row"><b>Rule description</b><i>Process behavior</i><small>Trusted</small></div><div className="pv-row untrusted-row"><b>Command line</b><i>synthetic value</i><small>Writable</small></div><div className="pv-row untrusted-row"><b>Destination</b><i>example.invalid</i><small>Writable</small></div></div><div className="provenance-bar trusted-bar"><span>TRUSTED METADATA</span></div><div className="provenance-bar untrusted-bar"><span>ATTACKER-WRITABLE EVIDENCE</span></div></div>;
  }
  if (scene === "policy") {
    return <div className="scene-art policy-scene-art"><div className="policy-input-card"><span>NORMALIZED ALERT</span><i /><i /><i /><i /></div><div className="policy-core"><div className="core-ring outer" /><div className="core-ring inner" /><b>QWEN<br /><small>POLICY</small></b></div><div className="policy-output-card"><span>STRUCTURED OUTPUT</span><strong>VERDICT <i>TP</i></strong><p>Rationale + cited fields</p></div><div className="policy-link" /></div>;
  }
  if (scene === "calibration") {
    return <div className="scene-art calibration-scene-art"><div className="cal-input"><b>Alert</b><b>Verdict</b><b>Rationale</b><b>Evidence</b></div><div className="cal-bridge"><i /><i /><i /></div><div className="cal-core"><span>P</span><strong>0.41</strong><small>VERDICT CORRECT</small></div><div className="cal-warning"><AlertTriangle size={20} /><span>Not probability<br />of maliciousness</span></div></div>;
  }
  if (scene === "gate") {
    return <div className="scene-art gate-scene-art"><div className="gate-input"><span>POLICY + CALIBRATOR</span><strong>Confidence</strong><i /><i /><i /></div><div className="scene-gate"><b>FROZEN<br />GATE</b></div><div className="scene-routes"><div className="route-route green"><Check size={18} /><span>Auto-close<br /><small>candidate</small></span></div><div className="route-route blue"><ArrowRight size={18} /><span>Priority<br /><small>analyst review</small></span></div><div className="route-route amber"><UserRoundCheck size={18} /><span>Normal<br /><small>analyst review</small></span></div></div></div>;
  }
  return <div className="scene-art attack-scene-art"><div className="paired-doc clean-doc"><span>CLEAN SOURCE</span><i /><i /><i /><i /></div><div className="attack-arrow"><ArrowRight size={29} /><small>ONE WRITABLE FIELD</small></div><div className="paired-doc injected-doc"><span>INJECTED VARIANT</span><i /><i /><i className="injection-line" /><i /></div><div className="attack-outcomes"><div><XCircle size={20} /><span>False auto-close<br /><small>danger hypothesis</small></span></div><div><UserRoundCheck size={20} /><span>Analyst review<br /><small>desired safe response</small></span></div></div></div>;
}

function FailureStep({ n, text, danger = false, safe = false }: { n: string; text: string; danger?: boolean; safe?: boolean }) {
  return <div className={`failure-step ${danger ? "danger" : ""} ${safe ? "safe-step" : ""}`}><span className="step-token">{n}</span>{text}</div>;
}

function FailureConnector() { return <div className="failure-connector" aria-hidden="true" />; }

function ArrowUpRightIcon() { return <ArrowDown size={17} style={{ transform: "rotate(180deg)" }} />; }
