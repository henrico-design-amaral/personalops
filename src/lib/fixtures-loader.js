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
    workoutTemplates: await fetch(`${baseUrl}assets/data/workout-templates.json`).then(r => r.json()),
    cardioTemplates: await fetch(`${baseUrl}assets/data/cardio-templates.json`).then(r => r.json()),
    dayAssignments: await fetch(`${baseUrl}assets/data/day-assignments.json`).then(r => r.json()),
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

/**
 * Get student's weekly schedule (agenda semanal)
 */
export function getStudentWeekSchedule(studentId, fixtures) {
  return fixtures.dayAssignments
    .filter(d => d.studentId === studentId)
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map(day => {
      const result = { ...day };
      if (day.assignedWorkoutId) {
        result.assignedWorkout = fixtures.workoutTemplates.find(w => w.id === day.assignedWorkoutId);
      }
      if (day.assignedCardioId) {
        result.assignedCardio = fixtures.cardioTemplates.find(c => c.id === day.assignedCardioId);
      }
      return result;
    });
}

/**
 * Get workout template by ID
 */
export function getWorkoutTemplate(workoutId, fixtures) {
  return fixtures.workoutTemplates.find(w => w.id === workoutId);
}

/**
 * Get cardio template by ID
 */
export function getCardioTemplate(cardioId, fixtures) {
  return fixtures.cardioTemplates.find(c => c.id === cardioId);
}

/**
 * Get day assignment by student and weekday
 */
export function getDayAssignment(studentId, weekday, fixtures) {
  return fixtures.dayAssignments.find(d => d.studentId === studentId && d.weekday === weekday);
}

/**
 * Get all workout templates available to professor (system + own)
 */
export function getProfessorAvailableWorkouts(professorId, fixtures) {
  return fixtures.workoutTemplates.filter(w =>
    w.ownerType === 'system' || w.professorId === professorId
  );
}

/**
 * Get all cardio templates available to professor (system + own)
 */
export function getProfessorAvailableCardios(professorId, fixtures) {
  return fixtures.cardioTemplates.filter(c =>
    c.ownerType === 'system' || c.professorId === professorId
  );
}
