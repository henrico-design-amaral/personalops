# PersonalTrainerOPS — Design System Resolver

Status: ACTIVE
Version: 1.0
Date: 2026-09-01
Authority: `STYLE_GUIDE.md` + current implementation + Henrico Visual System quality contracts

## Responsibilities
- semantic tokens and role/status colors;
- typography and information hierarchy;
- spacing/rhythm/grid;
- responsive layouts for admin/professor/student surfaces;
- form, list, card, training, timer and feedback primitives where current product uses them;
- loading/empty/error/success states;
- interaction/motion primitives;
- exercise/media behavior;
- accessibility mapping;
- implementation/version mapping.

## Source rule
Concrete values come from current accepted implementation and approved decisions. Promote them into explicit reusable tokens only when repeated and validated; do not invent a parallel visual system during documentation migration.

## Role-aware system
Shared components may exist across profiles, but permissions/data responsibility remain product authority. A visual abstraction must not blur Admin, Professor and Student roles.

## Training execution
Execution components must prioritize glanceability, touch operation, timer/state clarity and resilient behavior where offline support applies.

## Responsive rule
Mobile training/student experiences are first-class designed states, not compressed desktop admin screens.

## A11Y
Inherit `A11Y.md` and HenricoOPS WCAG 2.2 AA baseline.

## HVS relationship
HVS supplies quality/system discipline and validation, not a substitute PersonalTrainerOPS identity.

## Change control
Material system changes require a scoped spec/decision and regression through affected role journeys.
