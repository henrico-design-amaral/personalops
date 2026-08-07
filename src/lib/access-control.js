/**
 * Access Control Functions
 * Pure functions for RBAC and access validation
 *
 * These are stateless functions that take data fixtures as input
 * and return access decision (true/false)
 */

/**
 * Get actor context from userId and fixtures
 * @param {string} userId - User ID
 * @param {object} fixtures - Data fixtures
 * @returns {object|null} Actor context (user, role, profiles) or null if not found
 */
export function getActorContext(userId, fixtures) {
  const user = fixtures.users.find((u) => u.id === userId);
  if (!user) return null;

  const roleAssignments = fixtures.roleAssignments.filter((ra) => ra.userId === userId);

  const context = {
    userId,
    user,
    roles: roleAssignments.map((ra) => ra.role),
    adminProfile: null,
    staffProfile: null,
    professorProfile: null,
    studentProfile: null,
  };

  // Load profiles based on roles
  roleAssignments.forEach((ra) => {
    if (ra.role === 'admin') {
      context.adminProfile = fixtures.adminProfiles.find((p) => p.id === ra.profileId);
    } else if (ra.role === 'staff') {
      context.staffProfile = fixtures.staffProfiles.find((p) => p.id === ra.profileId);
    } else if (ra.role === 'professor') {
      context.professorProfile = fixtures.professorProfiles.find((p) => p.id === ra.profileId);
    } else if (ra.role === 'student') {
      context.studentProfile = fixtures.studentProfiles.find((p) => p.id === ra.profileId);
    }
  });

  return context;
}

/**
 * Check if actor can view a professor (as admin)
 * @param {object} actor - Actor context
 * @param {string} professorId - Professor ID to view
 * @param {object} fixtures - Data fixtures
 * @returns {boolean}
 */
export function canViewProfessor(actor, professorId, fixtures) {
  // Only admin can view professors
  return actor && actor.roles.includes('admin');
}

/**
 * Check if actor can list students of a professor
 * @param {object} actor - Actor context
 * @param {string} professorId - Professor ID
 * @param {object} fixtures - Data fixtures
 * @returns {boolean}
 */
export function canListStudents(actor, professorId, fixtures) {
  if (!actor) return false;

  // Admin can list students of any professor
  if (actor.roles.includes('admin')) {
    return true;
  }

  // Professor can list only their own students
  if (actor.roles.includes('professor') && actor.professorProfile?.id === professorId) {
    return true;
  }

  return false;
}

/**
 * Check if actor can view a student's profile
 * @param {object} actor - Actor context
 * @param {string} studentId - Student ID to view
 * @param {object} fixtures - Data fixtures
 * @returns {boolean}
 */
export function canViewStudent(actor, studentId, fixtures) {
  if (!actor) return false;

  // Student can view only their own profile
  if (actor.roles.includes('student') && actor.studentProfile?.id === studentId) {
    return true;
  }

  // Professor can view their own students
  if (actor.roles.includes('professor')) {
    const link = fixtures.professorStudentLinks.find(
      (l) => l.professorId === actor.professorProfile?.id && l.studentId === studentId
    );
    if (link) {
      return true;
    }
  }

  // Admin can view any student (read-only)
  if (actor.roles.includes('admin')) {
    return true;
  }

  return false;
}

/**
 * Check if actor can manage student operational data (prescrição, pausa, arquivo)
 * @param {object} actor - Actor context
 * @param {string} studentId - Student ID
 * @param {object} fixtures - Data fixtures
 * @returns {boolean}
 */
export function canManageStudentOperational(actor, studentId, fixtures) {
  if (!actor) return false;

  // Only professor can manage their own students
  if (actor.roles.includes('professor')) {
    const link = fixtures.professorStudentLinks.find(
      (l) => l.professorId === actor.professorProfile?.id && l.studentId === studentId
    );
    if (link && (link.status === 'ativo' || link.status === 'pausado')) {
      return true;
    }
  }

  // Admin cannot manage operational data
  return false;
}

/**
 * Check if actor can view student technical status (admin only)
 * @param {object} actor - Actor context
 * @param {string} studentId - Student ID
 * @param {object} fixtures - Data fixtures
 * @returns {boolean}
 */
export function canViewStudentTechnicalStatus(actor, studentId, fixtures) {
  if (!actor) return false;

  // Only admin can view technical status
  return actor.roles.includes('admin');
}

/**
 * Check if actor can trigger password recovery (anyone via public form, but only admin/staff can manage)
 * @param {object} actor - Actor context
 * @param {string} userId - User ID to recover password for
 * @param {object} fixtures - Data fixtures
 * @returns {boolean}
 */
export function canTriggerPasswordRecovery(actor, userId, fixtures) {
  if (!actor) return false;

  // Admin and staff can trigger recovery for anyone
  if (actor.roles.includes('admin') || actor.roles.includes('staff')) {
    return true;
  }

  // Student can trigger recovery for themselves (via public form)
  if (actor.studentProfile && actor.userId === userId) {
    return true;
  }

  return false;
}

/**
 * Check if actor can edit workout prescription
 * @param {object} actor - Actor context
 * @param {string} studentId - Student ID
 * @param {object} fixtures - Data fixtures
 * @returns {boolean}
 */
export function canEditWorkoutPrescription(actor, studentId, fixtures) {
  if (!actor) return false;

  // Only professor can edit prescription for their own students
  if (actor.roles.includes('professor')) {
    const link = fixtures.professorStudentLinks.find(
      (l) => l.professorId === actor.professorProfile?.id && l.studentId === studentId
    );
    if (link && (link.status === 'ativo' || link.status === 'pausado')) {
      return true;
    }
  }

  // Admin cannot edit prescriptions
  return false;
}

/**
 * Check if actor can view student's own portal
 * @param {object} actor - Actor context
 * @param {string} studentId - Student ID
 * @param {object} fixtures - Data fixtures
 * @returns {boolean}
 */
export function canViewOwnPortal(actor, studentId, fixtures) {
  if (!actor) return false;

  // Student can view only their own portal
  if (actor.roles.includes('student') && actor.studentProfile?.id === studentId) {
    // Check if student is not archived
    const student = fixtures.studentProfiles.find((s) => s.id === studentId);
    if (student && student.status !== 'arquivado') {
      return true;
    }
  }

  return false;
}

/**
 * Check if professor can manage another professor's students (should always be false)
 * @param {object} actor - Actor context
 * @param {string} otherProfessorId - Other professor's ID
 * @returns {boolean}
 */
export function canAccessOtherProfessorStudents(actor, otherProfessorId) {
  if (!actor) return false;

  // Professor can only access their own students
  if (actor.roles.includes('professor')) {
    return actor.professorProfile?.id === otherProfessorId;
  }

  return false;
}
