#!/usr/bin/env node

/**
 * Validate Fixtures Integrity
 * Ensures fixtures comply with data contracts and business rules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../public/assets/data');

let errors = [];
let warnings = [];

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
  workoutTemplates: loadJSON('workout-templates.json'),
  cardioTemplates: loadJSON('cardio-templates.json'),
  dayAssignments: loadJSON('day-assignments.json'),
};

function loadJSON(filename) {
  try {
    const filePath = path.join(dataDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    errors.push(`Failed to load ${filename}: ${err.message}`);
    return [];
  }
}

function validateStudentProfiles() {
  fixtures.studentProfiles.forEach((student) => {
    // Every StudentProfile must have corresponding User
    const user = fixtures.users.find((u) => u.id === student.userId);
    if (!user) {
      errors.push(`StudentProfile ${student.id}: User ${student.userId} not found`);
    }

    // Every StudentProfile must have RoleAssignment student
    const roleAssignment = fixtures.roleAssignments.find(
      (ra) => ra.userId === student.userId && ra.role === 'student'
    );
    if (!roleAssignment) {
      errors.push(`StudentProfile ${student.id}: RoleAssignment student for User ${student.userId} not found`);
    }

    // Student must not have admin role
    const adminRole = fixtures.roleAssignments.find(
      (ra) => ra.userId === student.userId && (ra.role === 'admin' || ra.role === 'professor')
    );
    if (adminRole) {
      errors.push(`StudentProfile ${student.id}: User has administrative role (${adminRole.role})`);
    }

    // Status must be valid enum
    const validStatuses = ['convidado', 'habilitado', 'pausado', 'arquivado', 'bloqueado'];
    if (!validStatuses.includes(student.status)) {
      errors.push(`StudentProfile ${student.id}: Invalid status "${student.status}"`);
    }
  });
}

function validateProfessorProfiles() {
  fixtures.professorProfiles.forEach((professor) => {
    // Every ProfessorProfile must have corresponding User
    const user = fixtures.users.find((u) => u.id === professor.userId);
    if (!user) {
      errors.push(`ProfessorProfile ${professor.id}: User ${professor.userId} not found`);
    }

    // Every ProfessorProfile must have RoleAssignment professor
    const roleAssignment = fixtures.roleAssignments.find(
      (ra) => ra.userId === professor.userId && ra.role === 'professor'
    );
    if (!roleAssignment) {
      errors.push(`ProfessorProfile ${professor.id}: RoleAssignment professor for User ${professor.userId} not found`);
    }
  });
}

function validateAdminProfiles() {
  fixtures.adminProfiles.forEach((admin) => {
    // Every AdminProfile must have corresponding User
    const user = fixtures.users.find((u) => u.id === admin.userId);
    if (!user) {
      errors.push(`AdminProfile ${admin.id}: User ${admin.userId} not found`);
    }

    // Every AdminProfile must have RoleAssignment admin
    const roleAssignment = fixtures.roleAssignments.find(
      (ra) => ra.userId === admin.userId && ra.role === 'admin'
    );
    if (!roleAssignment) {
      errors.push(`AdminProfile ${admin.id}: RoleAssignment admin for User ${admin.userId} not found`);
    }
  });
}

function validateStaffProfiles() {
  fixtures.staffProfiles.forEach((staff) => {
    // Every StaffProfile must have corresponding User
    const user = fixtures.users.find((u) => u.id === staff.userId);
    if (!user) {
      errors.push(`StaffProfile ${staff.id}: User ${staff.userId} not found`);
    }

    // Every StaffProfile must have RoleAssignment staff
    const roleAssignment = fixtures.roleAssignments.find(
      (ra) => ra.userId === staff.userId && ra.role === 'staff'
    );
    if (!roleAssignment) {
      errors.push(`StaffProfile ${staff.id}: RoleAssignment staff for User ${staff.userId} not found`);
    }
  });
}

function validateProfessorStudentLinks() {
  fixtures.professorStudentLinks.forEach((link) => {
    // Link must reference existing Professor
    const professor = fixtures.professorProfiles.find((p) => p.id === link.professorId);
    if (!professor) {
      errors.push(`ProfessorStudentLink ${link.id}: Professor ${link.professorId} not found`);
    }

    // Link must reference existing Student
    const student = fixtures.studentProfiles.find((s) => s.id === link.studentId);
    if (!student) {
      errors.push(`ProfessorStudentLink ${link.id}: Student ${link.studentId} not found`);
    }

    // Status must be valid enum
    const validStatuses = ['ativo', 'pausado', 'arquivado'];
    if (!validStatuses.includes(link.status)) {
      errors.push(`ProfessorStudentLink ${link.id}: Invalid status "${link.status}"`);
    }
  });

  // Every Student must have at least one link (ativo or pausado)
  fixtures.studentProfiles.forEach((student) => {
    const links = fixtures.professorStudentLinks.filter((l) => l.studentId === student.id);
    const activeLink = links.find((l) => l.status === 'ativo' || l.status === 'pausado');
    if (!activeLink && student.status !== 'convidado') {
      warnings.push(
        `StudentProfile ${student.id}: No active or paused link found (but status is ${student.status})`
      );
    }
  });
}

function validateInvitations() {
  fixtures.invitations.forEach((invitation) => {
    // Invitation must reference existing Professor
    const professor = fixtures.professorProfiles.find((p) => p.id === invitation.professorId);
    if (!professor) {
      errors.push(`Invitation ${invitation.id}: Professor ${invitation.professorId} not found`);
    }

    // Status must be valid enum
    const validStatuses = ['pendente', 'ativado', 'expirado', 'cancelado'];
    if (!validStatuses.includes(invitation.status)) {
      errors.push(`Invitation ${invitation.id}: Invalid status "${invitation.status}"`);
    }

    // Token must be unique
    const duplicates = fixtures.invitations.filter((i) => i.token === invitation.token);
    if (duplicates.length > 1) {
      errors.push(`Invitation ${invitation.id}: Token is not unique`);
    }
  });
}

function validatePasswordRecoveries() {
  fixtures.passwordRecoveries.forEach((recovery) => {
    // Recovery must reference existing User
    const user = fixtures.users.find((u) => u.id === recovery.userId);
    if (!user) {
      errors.push(`PasswordRecovery ${recovery.id}: User ${recovery.userId} not found`);
    }

    // Status must be valid enum
    const validStatuses = ['solicitado', 'usado', 'expirado', 'cancelado'];
    if (!validStatuses.includes(recovery.status)) {
      errors.push(`PasswordRecovery ${recovery.id}: Invalid status "${recovery.status}"`);
    }

    // Token must be unique
    const duplicates = fixtures.passwordRecoveries.filter((p) => p.token === recovery.token);
    if (duplicates.length > 1) {
      errors.push(`PasswordRecovery ${recovery.id}: Token is not unique`);
    }
  });
}

function validateSupportActionLogs() {
  fixtures.supportActionLogs.forEach((log) => {
    // Log must reference existing User (performedBy)
    const user = fixtures.users.find((u) => u.id === log.performedBy);
    if (!user) {
      errors.push(`SupportActionLog ${log.id}: User ${log.performedBy} not found`);
    }

    // performedByRole must match User's role
    const roleAssignment = fixtures.roleAssignments.find(
      (ra) => ra.userId === log.performedBy
    );
    if (roleAssignment && roleAssignment.role !== log.performedByRole) {
      warnings.push(
        `SupportActionLog ${log.id}: performedByRole "${log.performedByRole}" doesn't match RoleAssignment role "${roleAssignment.role}"`
      );
    }

    // actionType must be valid
    const validActions = ['reenviar_convite', 'desbloquear', 'resetar_senha', 'resolver_tecnico'];
    if (!validActions.includes(log.actionType)) {
      errors.push(`SupportActionLog ${log.id}: Invalid actionType "${log.actionType}"`);
    }

    // If actionType is reenviar_convite, resultingInvitationId must exist
    if (log.actionType === 'reenviar_convite' && log.details?.resultingInvitationId) {
      const invitation = fixtures.invitations.find(
        (i) => i.id === log.details.resultingInvitationId
      );
      if (!invitation) {
        errors.push(
          `SupportActionLog ${log.id}: Invitation ${log.details.resultingInvitationId} not found`
        );
      }
    }
  });
}

function validateNoHardDeletes() {
  // Check that no User has isActive=false
  fixtures.users.forEach((user) => {
    if (user.isActive === false) {
      errors.push(`User ${user.id}: Hard delete detected (isActive=false)`);
    }
  });

  // All users in fixtures should be isActive=true
  fixtures.users.forEach((user) => {
    if (user.isActive !== true) {
      errors.push(`User ${user.id}: isActive is not true (value: ${user.isActive})`);
    }
  });
}

function validateRoleAssignments() {
  fixtures.roleAssignments.forEach((ra) => {
    // RoleAssignment must reference existing User
    const user = fixtures.users.find((u) => u.id === ra.userId);
    if (!user) {
      errors.push(`RoleAssignment ${ra.id}: User ${ra.userId} not found`);
    }

    // profileId must reference correct profile type based on role
    if (ra.role === 'admin') {
      const profile = fixtures.adminProfiles.find((p) => p.id === ra.profileId);
      if (!profile) {
        errors.push(`RoleAssignment ${ra.id}: AdminProfile ${ra.profileId} not found`);
      }
    } else if (ra.role === 'staff') {
      const profile = fixtures.staffProfiles.find((p) => p.id === ra.profileId);
      if (!profile) {
        errors.push(`RoleAssignment ${ra.id}: StaffProfile ${ra.profileId} not found`);
      }
    } else if (ra.role === 'professor') {
      const profile = fixtures.professorProfiles.find((p) => p.id === ra.profileId);
      if (!profile) {
        errors.push(`RoleAssignment ${ra.id}: ProfessorProfile ${ra.profileId} not found`);
      }
    } else if (ra.role === 'student') {
      const profile = fixtures.studentProfiles.find((p) => p.id === ra.profileId);
      if (!profile) {
        errors.push(`RoleAssignment ${ra.id}: StudentProfile ${ra.profileId} not found`);
      }
    }
  });
}

function validateWorkoutTemplates() {
  fixtures.workoutTemplates.forEach((template) => {
    // Validate ownerType
    const validOwnerTypes = ['system', 'professor'];
    if (!validOwnerTypes.includes(template.ownerType)) {
      errors.push(`WorkoutTemplate ${template.id}: Invalid ownerType "${template.ownerType}"`);
    }

    // If ownerType is professor, professorId must exist
    if (template.ownerType === 'professor') {
      const professor = fixtures.professorProfiles.find((p) => p.id === template.professorId);
      if (!professor) {
        errors.push(`WorkoutTemplate ${template.id}: Professor ${template.professorId} not found`);
      }
    }

    // Validate level
    const validLevels = ['iniciante', 'intermediário', 'avançado'];
    if (!validLevels.includes(template.level)) {
      errors.push(`WorkoutTemplate ${template.id}: Invalid level "${template.level}"`);
    }
  });
}

function validateCardioTemplates() {
  fixtures.cardioTemplates.forEach((template) => {
    // Validate ownerType
    const validOwnerTypes = ['system', 'professor'];
    if (!validOwnerTypes.includes(template.ownerType)) {
      errors.push(`CardioTemplate ${template.id}: Invalid ownerType "${template.ownerType}"`);
    }

    // If ownerType is professor, professorId must exist
    if (template.ownerType === 'professor') {
      const professor = fixtures.professorProfiles.find((p) => p.id === template.professorId);
      if (!professor) {
        errors.push(`CardioTemplate ${template.id}: Professor ${template.professorId} not found`);
      }
    }

    // Validate type
    const validTypes = ['bike', 'treadmill', 'walk_indoor', 'walk_outdoor', 'elliptical', 'stairs', 'hiit'];
    if (!validTypes.includes(template.type)) {
      errors.push(`CardioTemplate ${template.id}: Invalid type "${template.type}"`);
    }

    // Validate intensity
    const validIntensities = ['baixo', 'moderado', 'alto', 'muito-alto'];
    if (!validIntensities.includes(template.intensity)) {
      errors.push(`CardioTemplate ${template.id}: Invalid intensity "${template.intensity}"`);
    }
  });
}

function validateDayAssignments() {
  fixtures.dayAssignments.forEach((assignment) => {
    // Assignment must reference existing Student
    const student = fixtures.studentProfiles.find((s) => s.id === assignment.studentId);
    if (!student) {
      errors.push(`DayAssignment ${assignment.id}: Student ${assignment.studentId} not found`);
    }

    // Assignment must reference existing Professor
    const professor = fixtures.professorProfiles.find((p) => p.id === assignment.professorId);
    if (!professor) {
      errors.push(`DayAssignment ${assignment.id}: Professor ${assignment.professorId} not found`);
    }

    // Validate weekday
    const validWeekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validWeekdays.includes(assignment.weekday)) {
      errors.push(`DayAssignment ${assignment.id}: Invalid weekday "${assignment.weekday}"`);
    }

    // Validate type
    const validTypes = ['workout', 'cardio', 'rest', 'check_in', 'assessment'];
    if (!validTypes.includes(assignment.type)) {
      errors.push(`DayAssignment ${assignment.id}: Invalid type "${assignment.type}"`);
    }

    // If type is workout, assignedWorkoutId must exist
    if (assignment.type === 'workout' && assignment.assignedWorkoutId) {
      const workout = fixtures.workoutTemplates.find((w) => w.id === assignment.assignedWorkoutId);
      if (!workout) {
        errors.push(`DayAssignment ${assignment.id}: WorkoutTemplate ${assignment.assignedWorkoutId} not found`);
      }
    }

    // If type is cardio, assignedCardioId must exist
    if (assignment.type === 'cardio' && assignment.assignedCardioId) {
      const cardio = fixtures.cardioTemplates.find((c) => c.id === assignment.assignedCardioId);
      if (!cardio) {
        errors.push(`DayAssignment ${assignment.id}: CardioTemplate ${assignment.assignedCardioId} not found`);
      }
    }

    // If type is workout, assignedWorkoutId should not be null
    if (assignment.type === 'workout' && !assignment.assignedWorkoutId) {
      errors.push(`DayAssignment ${assignment.id}: type is 'workout' but assignedWorkoutId is null`);
    }

    // If type is cardio, assignedCardioId should not be null
    if (assignment.type === 'cardio' && !assignment.assignedCardioId) {
      errors.push(`DayAssignment ${assignment.id}: type is 'cardio' but assignedCardioId is null`);
    }

    // Student must belong to Professor (via ProfessorStudentLink)
    const link = fixtures.professorStudentLinks.find(
      (l) => l.studentId === assignment.studentId && l.professorId === assignment.professorId
    );
    if (!link) {
      errors.push(
        `DayAssignment ${assignment.id}: Student ${assignment.studentId} does not belong to Professor ${assignment.professorId}`
      );
    }
  });
}

// Run all validations
console.log('Validating PersonalOps fixtures...\n');

validateRoleAssignments();
validateAdminProfiles();
validateStaffProfiles();
validateProfessorProfiles();
validateStudentProfiles();
validateProfessorStudentLinks();
validateInvitations();
validatePasswordRecoveries();
validateSupportActionLogs();
validateWorkoutTemplates();
validateCardioTemplates();
validateDayAssignments();
validateNoHardDeletes();

// Report results
if (errors.length === 0 && warnings.length === 0) {
  console.log('✓ All validations passed!');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log(`\n✗ ERRORS (${errors.length}):`);
    errors.forEach((err) => console.log(`  - ${err}`));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠ WARNINGS (${warnings.length}):`);
    warnings.forEach((warn) => console.log(`  - ${warn}`));
  }

  process.exit(errors.length > 0 ? 1 : 0);
}
