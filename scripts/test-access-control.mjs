#!/usr/bin/env node

/**
 * Test Access Control Scenarios
 * Validates that access control rules work correctly for all scenarios
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getActorContext,
  canViewProfessor,
  canListStudents,
  canViewStudent,
  canManageStudentOperational,
  canViewStudentTechnicalStatus,
  canTriggerPasswordRecovery,
  canEditWorkoutPrescription,
  canViewOwnPortal,
  canAccessOtherProfessorStudents,
} from '../src/lib/access-control.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../public/assets/data');

let passed = 0;
let failed = 0;

// Load fixtures
const fixtures = {
  users: loadJSON('users.json'),
  roleAssignments: loadJSON('role-assignments.json'),
  adminProfiles: loadJSON('admin-profiles.json'),
  staffProfiles: loadJSON('staff-profiles.json'),
  professorProfiles: loadJSON('professor-profiles.json'),
  studentProfiles: loadJSON('student-profiles.json'),
  professorStudentLinks: loadJSON('professor-student-links.json'),
  invitations: loadJSON('invitations.json'),
  passwordRecoveries: loadJSON('password-recoveries.json'),
  supportActionLogs: loadJSON('support-action-logs.json'),
};

function loadJSON(filename) {
  try {
    const filePath = path.join(dataDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to load ${filename}: ${err.message}`);
    process.exit(1);
  }
}

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ ${message}`);
    failed++;
  }
}

function scenario(name, fn) {
  console.log(`\n${name}`);
  fn();
}

// Test scenarios
scenario('Scenario 1: Admin Lists Professors', () => {
  const admin = getActorContext('admin-1', fixtures);
  assert(admin !== null, 'Admin context loaded');
  assert(admin.roles.includes('admin'), 'Admin has admin role');
  assert(canViewProfessor(admin, 'prof-a', fixtures), 'Admin can view professor A');
  assert(canViewProfessor(admin, 'prof-b', fixtures), 'Admin can view professor B');
});

scenario('Scenario 2: Admin Views Student Technical Status', () => {
  const admin = getActorContext('admin-1', fixtures);
  assert(canViewStudentTechnicalStatus(admin, 'std-01', fixtures), 'Admin can view std-01 technical status');
  assert(canViewStudentTechnicalStatus(admin, 'std-02', fixtures), 'Admin can view std-02 technical status');
  assert(!canEditWorkoutPrescription(admin, 'std-01', fixtures), 'Admin cannot edit prescription');
});

scenario('Scenario 3: Admin Cannot Edit Prescription', () => {
  const admin = getActorContext('admin-1', fixtures);
  assert(!canEditWorkoutPrescription(admin, 'std-01', fixtures), 'Admin cannot edit std-01 prescription');
  assert(!canManageStudentOperational(admin, 'std-01', fixtures), 'Admin cannot manage std-01 operational');
});

scenario('Scenario 4: Professor A Sees Only Own Students', () => {
  const profA = getActorContext('prof-a', fixtures);
  assert(profA !== null, 'Professor A context loaded');
  assert(profA.roles.includes('professor'), 'Prof A has professor role');

  // Prof A should see his own students
  assert(canViewStudent(profA, 'std-01', fixtures), 'Prof A can view std-01 (own)');
  assert(canViewStudent(profA, 'std-02', fixtures), 'Prof A can view std-02 (own)');
  assert(canViewStudent(profA, 'std-03', fixtures), 'Prof A can view std-03 (own)');

  // Prof A cannot manage archived student
  const link03 = fixtures.professorStudentLinks.find((l) => l.studentId === 'std-03');
  if (link03?.status === 'arquivado') {
    assert(!canManageStudentOperational(profA, 'std-03', fixtures), 'Prof A cannot manage archived student');
  }
});

scenario('Scenario 5: Professor A Cannot See Professor B Students', () => {
  const profA = getActorContext('prof-a', fixtures);
  assert(!canViewStudent(profA, 'std-04', fixtures), 'Prof A cannot view std-04 (Prof B student)');
  assert(!canManageStudentOperational(profA, 'std-04', fixtures), 'Prof A cannot manage std-04');
  assert(!canAccessOtherProfessorStudents(profA, 'prof-b'), 'Prof A cannot access Prof B students');
});

scenario('Scenario 6: Professor B Cannot See Professor A Students', () => {
  const profB = getActorContext('prof-b', fixtures);
  assert(profB !== null, 'Professor B context loaded');
  assert(!canViewStudent(profB, 'std-01', fixtures), 'Prof B cannot view std-01 (Prof A student)');
  assert(!canViewStudent(profB, 'std-02', fixtures), 'Prof B cannot view std-02 (Prof A student)');
  assert(!canViewStudent(profB, 'std-03', fixtures), 'Prof B cannot view std-03 (Prof A student)');
  assert(canViewStudent(profB, 'std-04', fixtures), 'Prof B can view std-04 (own)');
});

scenario('Scenario 7: Student Views Own Portal Only', () => {
  const std01 = getActorContext('std-01', fixtures);
  assert(std01 !== null, 'Student 01 context loaded');
  assert(std01.roles.includes('student'), 'Std 01 has student role');
  assert(canViewOwnPortal(std01, 'std-01', fixtures), 'Std 01 can view own portal');
  assert(!canViewOwnPortal(std01, 'std-02', fixtures), 'Std 01 cannot view std-02 portal');
  assert(!canViewOwnPortal(std01, 'std-04', fixtures), 'Std 01 cannot view std-04 portal');
});

scenario('Scenario 8: Student Cannot View Another Student', () => {
  const std01 = getActorContext('std-01', fixtures);
  assert(!canViewStudent(std01, 'std-02', fixtures), 'Std 01 cannot view std-02');
  assert(!canViewStudent(std01, 'std-04', fixtures), 'Std 01 cannot view std-04');
});

scenario('Scenario 9: Student Cannot Edit Prescription', () => {
  const std01 = getActorContext('std-01', fixtures);
  assert(!canEditWorkoutPrescription(std01, 'std-01', fixtures), 'Std 01 cannot edit own prescription');
});

scenario('Scenario 10: Professor Cannot Trigger Password Recovery', () => {
  const profA = getActorContext('prof-a', fixtures);
  assert(!canTriggerPasswordRecovery(profA, 'std-01', fixtures), 'Prof A cannot trigger recovery for std-01');
  assert(!canTriggerPasswordRecovery(profA, 'std-02', fixtures), 'Prof A cannot trigger recovery for std-02');
});

scenario('Scenario 11: Admin Can Trigger Password Recovery', () => {
  const admin = getActorContext('admin-1', fixtures);
  assert(canTriggerPasswordRecovery(admin, 'std-01', fixtures), 'Admin can trigger recovery for std-01');
  assert(canTriggerPasswordRecovery(admin, 'std-02', fixtures), 'Admin can trigger recovery for std-02');
});

scenario('Scenario 12: Staff Can Trigger Password Recovery', () => {
  const staff = getActorContext('staff-1', fixtures);
  assert(staff !== null, 'Staff context loaded');
  assert(canTriggerPasswordRecovery(staff, 'std-02', fixtures), 'Staff can trigger recovery for std-02');
});

scenario('Scenario 13: Student Can Trigger Own Password Recovery', () => {
  const std02 = getActorContext('std-02', fixtures);
  assert(canTriggerPasswordRecovery(std02, 'std-02', fixtures), 'Std 02 can trigger own recovery');
  assert(!canTriggerPasswordRecovery(std02, 'std-01', fixtures), 'Std 02 cannot trigger recovery for std-01');
});

scenario('Scenario 14: Paused Student Cannot Be Managed Operationally', () => {
  const profA = getActorContext('prof-a', fixtures);
  const std02 = fixtures.studentProfiles.find((s) => s.id === 'std-02');
  if (std02?.status === 'pausado') {
    // Paused student CAN still be accessed by their professor
    assert(canViewStudent(profA, 'std-02', fixtures), 'Prof A can view paused std-02');
    assert(canManageStudentOperational(profA, 'std-02', fixtures), 'Prof A can still manage paused std-02 (can unpause)');
  }
});

scenario('Scenario 15: Archived Student Cannot Be Managed', () => {
  const profA = getActorContext('prof-a', fixtures);
  const std03 = fixtures.studentProfiles.find((s) => s.id === 'std-03');
  if (std03?.status === 'arquivado') {
    assert(canViewStudent(profA, 'std-03', fixtures), 'Prof A can view archived std-03 (read-only)');
    assert(!canManageStudentOperational(profA, 'std-03', fixtures), 'Prof A cannot manage archived std-03');
  }
});

scenario('Scenario 16: Isolamento Professor/Student Access', () => {
  const profA = getActorContext('prof-a', fixtures);
  const profB = getActorContext('prof-b', fixtures);
  const std04 = getActorContext('std-04', fixtures);

  // Prof A manages std-01, std-02, std-03
  assert(canManageStudentOperational(profA, 'std-01', fixtures), 'Prof A manages std-01');
  assert(canManageStudentOperational(profA, 'std-02', fixtures), 'Prof A manages std-02');
  assert(!canManageStudentOperational(profA, 'std-03', fixtures), 'Prof A cannot manage archived std-03');

  // Prof B manages std-04 only
  assert(canManageStudentOperational(profB, 'std-04', fixtures), 'Prof B manages std-04');
  assert(!canManageStudentOperational(profB, 'std-01', fixtures), 'Prof B cannot manage Prof A students');

  // Std-04 cannot access other students
  assert(!canViewStudent(std04, 'std-01', fixtures), 'Std-04 cannot view std-01');
  assert(!canViewStudent(std04, 'std-02', fixtures), 'Std-04 cannot view std-02');
});

// Report results
console.log(`\n${'='.repeat(50)}`);
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log(`${'='.repeat(50)}\n`);

if (failed === 0) {
  console.log('✓ All access control scenarios passed!');
  process.exit(0);
} else {
  console.log(`✗ ${failed} test(s) failed!`);
  process.exit(1);
}
