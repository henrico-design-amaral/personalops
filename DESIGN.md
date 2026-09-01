# PersonalTrainerOPS — Design Resolver

Status: ACTIVE
Version: 1.0
Date: 2026-09-01
Authority: `STYLE_GUIDE.md` + `DESIGN_SYSTEM.md` + current accepted implementation + product/role decisions

## Before UI work
Resolve:
- semantic project name and target profile (Admin, Professor or Student);
- user job/critical journey;
- current product/data/permission constraints;
- current accepted visual/component behavior;
- exercise/media authority when relevant;
- responsive/offline/A11Y requirements;
- active spec and acceptance evidence;
- fidelity source when implementing an approved visual.

## Protected
- Admin/Professor/Student responsibility boundaries;
- real personal-training product scope;
- training history/progress/feedback semantics;
- current accepted behavior outside task scope;
- no productivity/life-management interpretation;
- no invented training/product evidence.

## V2/V3 flow
`intent -> role/job/state contract -> visual decoupage -> composition/responsive/offline contract -> browser/device prototype -> slice implementation -> functional/visual/A11Y QA`

The implementer cannot invent product behavior, permissions or training semantics to satisfy a visual mockup.

## HVS
Henrico Visual System is a quality floor. Current PersonalTrainerOPS product/visual authority remains sovereign.

## Failure
If a material visual/product decision is unresolved, route to the applicable foundation/product decision instead of filling the gap with provider defaults.
