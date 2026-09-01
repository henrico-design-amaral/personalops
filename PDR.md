# PersonalTrainerOPS — Project Definition Report

Status: ACTIVE
Version: 1.0
Date: 2026-09-01
Authority: `PRODUCT.md` + `FOUNDATION_BRIEF.md` + `DECISIONS.md` + current implementation

## Identity
- Canonical semantic project name: `PersonalTrainerOPS`.
- Physical repository remains `henrico-design-amaral/personalops` until a deliberate technical migration.
- Historical `PersonalOps` naming may remain in old files as provenance, not current semantic authority.

## Type
SaaS / PWA / operational product for personal trainers/professors and their students.

## Why it exists
Reduce fragmented operational work for personal trainers by giving the professional a workspace to manage students, prescribe and track training, follow adherence/progress/feedback and operate the business, while giving the student an authenticated guided training experience.

## Canonical profiles
- Platform Admin.
- Professor / Personal Trainer.
- Student.

Their permissions and responsibilities remain separated as defined in `PRODUCT.md`.

## Core scope
- professional/student lifecycle management;
- exercise/training libraries;
- training creation/prescription;
- assisted execution, sets/reps/load/RPE/timer;
- weekly training agenda and related events;
- attendance/adherence/progress/history;
- post-training feedback and student evolution;
- professional-workspace financial operation;
- authenticated student portal;
- resilient/offline behavior where it materially improves training execution.

## Durable non-goals
- personal productivity/life-management system;
- generic habits/energy/focus organizer;
- marketplace/social network as the core product;
- automatic professional prescription without appropriate human review;
- unrelated wellness features that dilute the personal-training operation.

## Success signals
- frequent professional operations are faster/clearer;
- student execution is understandable and resilient;
- role/tenant boundaries remain correct;
- training produces useful history and feedback;
- product truth and current work are portable across executors.

## Level 0
- Style Guide: `STYLE_GUIDE.md`.
- Design System: `DESIGN_SYSTEM.md`.
- Agent visual resolver: `DESIGN.md`.
- Accessibility: `A11Y.md`.

## Risks / current attention
- semantic naming migration is documentary first; repository/path rename is a separate technical decision;
- old foundation/PDR files contain useful history but may not reflect current product breadth;
- production/deploy remains a manual governed boundary.

## Canonical map
`README.md -> PDR.md -> AGENTS.md -> PRODUCT.md -> STYLE_GUIDE.md -> DESIGN_SYSTEM.md -> DESIGN.md -> A11Y.md -> DECISIONS.md -> HANDOFF.md -> TASKS.md -> REFERENCES.md -> specs/`
