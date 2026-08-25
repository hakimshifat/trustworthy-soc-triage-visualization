# Design Direction: Trustworthy SOC L1 Triage

## Three Candidate Approaches

### Approach 1 — Evidence Ledger
**Very Brief Intro:** An editorial scientific dashboard inspired by research lab notebooks and intelligence briefings. It makes provenance, uncertainty, and methodological boundaries visibly primary rather than treating them as footnotes.

**Probability:** 0.07

### Approach 2 — Signal in the Noise
**Very Brief Intro:** A dark, cinematic control-room interface where alerts move through a luminous pipeline. It is immersive and dramatic, but risks making an unfinished research program look more operational than it is.

**Probability:** 0.03

### Approach 3 — Safety Case Atlas
**Very Brief Intro:** A calm, high-contrast systems map built around archival cards, measured annotation, and interactive flow diagrams. It presents the work as a transparent safety case rather than a product demo.

**Probability:** 0.08

## Chosen Direction — Evidence Ledger

### Design Movement
This experience adopts the **editorial scientific dashboard** movement, combining the visual discipline of an academic research poster with the interaction clarity of a mission-control interface. The work is shown as evidence under examination, never as a production SOC claim.

### Core Principles
1. **Provenance is visible.** Every number, route, and outcome is coded as completed, active preparation, planned, or illustrative.
2. **Uncertainty has a home.** Clear analyst-review paths, confidence bands, and pending-result states prevent false certainty.
3. **Process is the story.** The layout follows alert evidence through a bounded sequence rather than placing content in generic marketing sections.
4. **Security without spectacle.** Attacker-controlled text is vivid enough to explain the risk, but the visual system remains measured and academic.

### Color Philosophy
The main surface is warm parchment rather than a black “cyber” backdrop: it makes the application feel like a research dossier while allowing high-salience evidence colors to work precisely. Deep indigo represents trusted system structure, vivid orange flags attacker-writable evidence, teal denotes calibration and abstention, green marks verified completion, amber signals active preparation or analyst review, red isolates unsafe automation, and neutral slate denotes plans and unavailable results. The signature brand color is **Ledger Indigo (#173B5E)**, selected for its association with evidence, stability, and readable scientific contrast.

### Layout Paradigm
The home screen is a vertically narrated **research evidence rail**: a slim left rail establishes research state, while the broad canvas advances through the problem, pipeline, attack test, and completed evidence. Sections alternate between spanning system diagrams, asymmetric two-column analysis sheets, and tightly scoped data cards. The structure avoids a conventional centered landing page and makes scrolling feel like progressing through a case file.

### Signature Elements
1. **Margin labels:** Small vertical and horizontal labels such as “COMPLETED PROJECT RESULT”, “SIMULATED ILLUSTRATION”, and “PENDING EXPERIMENT” anchor every claim.
2. **Provenance threads:** Blue and orange connection lines physically distinguish trusted metadata from attacker-writable values throughout diagrams.
3. **Evidence stamps:** A compact status chip with a dot and lock/clock/check icon accompanies metrics, phases, and output examples.

### Interaction Philosophy
Interaction should reveal relationships, not perform a simulation that could be mistaken for live security automation. Users can step through the pipeline, toggle provenance labels, switch between illustrative clean and injected alerts, adjust a demonstrative confidence gate, and play/replay the dangerous-failure versus safe-abstention flow. Changes update visibly and always carry an integrity label.

### Animation
Motion is purposeful and information-led. Incoming alert cards arrive in short staggered pulses; data moves along provenance-colored lines; routing nodes brighten as an illustrative alert reaches them; and the false-auto-close sequence plays as a reversible timeline. Standard UI interactions remain below 240 ms with sharp ease-out timing. The critical failure chain uses a single restrained red pulse, while the analyst-review outcome resolves into calm amber. All nonessential movement is reduced for users with `prefers-reduced-motion`.

### Typography System
**DM Serif Display** provides the research-poster headlines, providing seriousness and a memorable editorial voice. **IBM Plex Sans** supports dense technical labels, metrics, and body copy with excellent legibility. Headlines use compact, sentence-case phrasing; system labels use modest uppercase tracking; data figures are set in tabular numerals.

### Brand Essence
**A transparent visual safety case for researchers studying when AI-assisted SOC triage should automate, abstain, or defer to an analyst.**

Personality: **rigorous, candid, protective.**

### Brand Voice
Headlines are precise, direct, and cautious; CTAs invite inspection rather than conversion; microcopy identifies the evidentiary status of every display.

Examples: “Trace the decision before you trust the gate.”

“A convincing answer is not yet a safe automated action.”

### Wordmark & Logo
The mark is an abstract **split evidence gate**: two offset vertical archive bars converge into a protected central decision point, with a small amber interruption on the untrusted side. It is a graphic symbol without text, used beside a custom wordmark whose “O” contains the gate aperture.

### Signature Brand Color
**Ledger Indigo — #173B5E**
