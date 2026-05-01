# Vibe-Coding Workflow Templates
## P07-T03 — Productised workflow for rapid spec → demo cycles

---

## 1. Spec Template

```yaml
spec:
  id: "SPEC-{YYYYMMDD}-{SEQ}"
  title: ""
  author: ""
  date: ""

  problem:
    statement: ""
    who_feels_it: ""         # Persona
    frequency: ""             # Daily / Weekly / Ad-hoc
    current_workaround: ""    # How they solve it today
    pain_magnitude: ""        # 1-10, with justification

  success_criteria:
    must_have:
      - ""
    nice_to_have:
      - ""
    anti_goals:               # Explicitly out of scope
      - ""

  kill_criterion:
    condition: ""             # When to stop
    checkpoint_time: ""       # e.g. "4 minutes"
    fallback: ""              # What to do instead

  time_box:
    total: ""                 # e.g. "10 minutes"
    checkpoint_1: ""          # e.g. "3 minutes — core parsing works?"
    checkpoint_2: ""          # e.g. "6 minutes — visualization renders?"
    final: ""                 # e.g. "10 minutes — narrative generated?"

  data_source:
    dataset: ""               # Which synthetic dataset
    tables: []                # Specific tables
    sample_query: ""          # Expected query pattern

  technical_notes: ""
```

---

## 2. Demo Template

```yaml
demo:
  id: "DEMO-{YYYYMMDD}-{SEQ}"
  spec_ref: ""                # Link to spec
  presenter: ""
  audience: ""                # "Shinhan SS1 team"
  duration: ""                # "10 minutes"
  date: ""

  what_to_show:
    - order: 1
      action: ""
      expected_result: ""
      talking_point: ""

  what_NOT_to_show:           # Avoid demo traps
    - ""

  observability_hooks:
    - metric: "latency"
      where: "NL→SQL pipeline"
      threshold: "< 3s"
    - metric: "confidence"
      where: "response header"
      threshold: "> 0.75"

  risk_mitigation:
    fallback_video: ""        # Pre-recorded path
    wifi_backup: ""           # Mobile hotspot
    dataset_cached: true      # Don't depend on live API

  post_demo:
    feedback_collection: ""   # How to gather audience input
    next_step: ""             # Decision gate reference
```

---

## 3. Decision-Gate Template

```yaml
decision_gate:
  id: "GATE-{YYYYMMDD}-{SEQ}"
  spec_ref: ""
  demo_ref: ""
  date: ""
  decision_maker: ""          # Who has authority
  attendees: []

  evaluation:
    graduation_criteria_met: true | false
    kill_criteria_triggered: true | false
    audience_feedback_summary: ""
    technical_debt_incurred: ""
    estimated_production_effort: ""  # Days to productionize

  decision: "graduate | kill | pivot"

  if_graduate:
    next_phase: ""
    owner: ""
    deadline: ""
    production_requirements:
      - ""

  if_kill:
    reason: ""
    lessons_learned:
      - ""
    assets_to_salvage:        # Don't waste the work
      - ""

  if_pivot:
    new_direction: ""
    what_changes: ""
    what_stays: ""
    revised_spec_ref: ""
```

---

## 4. Weekly Cadence Template

```yaml
weekly_cadence:
  id: "WEEK-{YYYY-WNN}"
  theme: ""                   # This week's focus

  monday:
    activity: "Spec"
    deliverable: "Completed spec for this week's build"
    attendees: ["eng", "pm"]
    timebox: "2 hours"
    output: "SPEC-{ID} published"

  wednesday:
    activity: "Checkpoint"
    deliverable: "Working prototype at checkpoint_2"
    attendees: ["eng"]
    timebox: "30 minutes"
    decisions:
      - "Continue / Adjust / Kill early"
    output: "Checkpoint notes in spec"

  friday:
    activity: "Demo + Decision Gate"
    deliverable: "Live demo to stakeholders"
    attendees: ["eng", "pm", "founder", "Shinhan (if applicable)"]
    timebox: "30 minutes (10 demo + 20 discussion)"
    output: "GATE-{ID} decision recorded"

  retrospective:
    what_worked: []
    what_didnt: []
    process_improvements: []
```

---

## Usage

1. **Start of week**: Fill out the Spec Template for this week's build.
2. **Mid-week**: Check progress against checkpoints. Kill early if needed.
3. **End of week**: Run the Demo, fill out the Decision Gate.
4. **Repeat**: Use the Weekly Cadence to maintain velocity.

> **Key insight**: Showing things we *killed* builds more credibility than showing things we polished.
> The kill criterion is not a failure — it's a feature of the process.
