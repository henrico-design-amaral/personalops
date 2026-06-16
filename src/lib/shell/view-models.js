/**
 * View model helpers — data transformation utilities
 */

export function getProfessorDashboardModel(actor, fixtures) {
  const { getProfessorStudents, getProfessorInvitations } = await import('../fixtures-loader.js');
  const students = getProfessorStudents(actor.professorProfile.id, fixtures);
  const invitations = getProfessorInvitations(actor.professorProfile.id, fixtures);

  return {
    activeStudents: students.filter(s => s.status === 'ativo').length,
    pausedStudents: students.filter(s => s.status === 'pausado').length,
    archivedStudents: students.filter(s => s.status === 'arquivado').length,
    pendingInvites: invitations.filter(i => i.status === 'pendente').length,
    students,
    invitations
  };
}

export function getStudentOperationalProfileModel(student, actor, fixtures) {
  const link = fixtures.professorStudentLinks.find(
    l => l.studentId === student.id && l.professorId === actor.professorProfile.id
  );

  const lastAccess = new Date(Date.now() - Math.random() * 86400000).toLocaleDateString();

  return {
    student,
    link,
    lastAccess
  };
}

export function formatStatusBadge(status) {
  const statusMap = {
    'ativo': { color: '#64c864', label: 'Active' },
    'pausado': { color: '#ffc864', label: 'Paused' },
    'arquivado': { color: '#a0a0a0', label: 'Archived' }
  };
  return statusMap[status] || { color: '#a0a0a0', label: status };
}

export function formatInvitationStatus(status) {
  const statusMap = {
    'pendente': { color: '#64c8ff', label: 'Pending' },
    'ativo': { color: '#64c864', label: 'Active' },
    'expirado': { color: '#ff6464', label: 'Expired' }
  };
  return statusMap[status] || { color: '#a0a0a0', label: status };
}
