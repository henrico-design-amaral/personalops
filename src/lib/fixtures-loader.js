/**
 * Fixtures Loader
 * Load and manage test data from JSON files (offline-first)
 */

let cachedFixtures = null;

/**
 * Load all fixtures from public/assets/data
 * @returns {Promise<object>} All fixtures
 */
export async function loadFixtures() {
  if (cachedFixtures) return cachedFixtures;

  const baseUrl = typeof window !== 'undefined' ? '/personalops/' : '';

  const fixtures = {
    users: await fetch(`${baseUrl}assets/data/users.json`).then(r => r.json()),
    roleAssignments: await fetch(`${baseUrl}assets/data/role-assignments.json`).then(r => r.json()),
    adminProfiles: await fetch(`${baseUrl}assets/data/admin-profiles.json`).then(r => r.json()),
    staffProfiles: await fetch(`${baseUrl}assets/data/staff-profiles.json`).then(r => r.json()),
    professorProfiles: await fetch(`${baseUrl}assets/data/professor-profiles.json`).then(r => r.json()),
    studentProfiles: await fetch(`${baseUrl}assets/data/student-profiles.json`).then(r => r.json()),
    professorStudentLinks: await fetch(`${baseUrl}assets/data/professor-student-links.json`).then(r => r.json()),
    invitations: await fetch(`${baseUrl}assets/data/invitations.json`).then(r => r.json()),
    passwordRecoveries: await fetch(`${baseUrl}assets/data/password-recoveries.json`).then(r => r.json()),
    supportActionLogs: await fetch(`${baseUrl}assets/data/support-action-logs.json`).then(r => r.json()),
  };

  cachedFixtures = fixtures;
  return fixtures;
}

/**
 * Get professor's students
 */
export function getProfessorStudents(professorId, fixtures) {
  const links = fixtures.professorStudentLinks.filter(l => l.professorId === professorId);
  return links.map(link => {
    const student = fixtures.studentProfiles.find(s => s.id === link.studentId);
    return { ...link, student };
  });
}

/**
 * Get invitations for professor
 */
export function getProfessorInvitations(professorId, fixtures) {
  return fixtures.invitations.filter(i => i.professorId === professorId);
}

/**
 * Get support logs
 */
export function getSupportLogs(fixtures) {
  return fixtures.supportActionLogs;
}

/**
 * Get all professors with their student counts
 */
export function getAllProfessorsWithStudents(fixtures) {
  return fixtures.professorProfiles.map(prof => {
    const students = getProfessorStudents(prof.id, fixtures);
    return {
      ...prof,
      studentCount: students.length,
      students,
    };
  });
}
