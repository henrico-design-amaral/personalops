/**
 * Admin view renderer — Platform dashboard with metrics, professional management, billing
 */

import { getAllProfessorsWithStudents } from '../fixtures-loader.js';

export function renderAdminView(actor, fixtures) {
  const professorsWithStudents = getAllProfessorsWithStudents(fixtures);
  const invitations = fixtures.invitations;
  const logs = fixtures.supportActionLogs;

  // Calculate metrics
  const totalProfessors = fixtures.professorProfiles?.length || 0;
  const totalStudents = fixtures.studentProfiles?.length || 0;
  const activeStudents = fixtures.studentProfiles?.filter(s => s.status === 'ativo').length || 0;
  const activeLinks = fixtures.professorStudentLinks?.length || 0;
  const pendingInvites = invitations.filter(i => i.status === 'pendente').length;
  const expiredInvites = invitations.filter(i => i.status === 'expirado').length;
  const totalSessions = Math.floor(Math.random() * 500) + 200; // Mockado: treinos na semana
  const criticalFeedbacks = Math.floor(Math.random() * 5) + 1; // Mockado: feedbacks críticos

  let html = `
    <div class="view active">
      <div class="view-header">
        <h2>Platform Dashboard</h2>
        <p class="info">Admin: ${actor.user.id} | PersonalOps Operations</p>
      </div>

      <!-- METRICS GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 30px;">
        <div style="background: rgba(100, 200, 100, 0.1); border-left: 4px solid #64c864; padding: 15px; border-radius: 4px;">
          <div style="color: #a0a0a0; font-size: 11px; text-transform: uppercase;">Active Professionals</div>
          <div style="color: #64c864; font-size: 24px; font-weight: bold; margin-top: 5px;">${totalProfessors}</div>
          <div style="color: #808080; font-size: 10px; margin-top: 3px;">Teaching students</div>
        </div>

        <div style="background: rgba(100, 200, 100, 0.1); border-left: 4px solid #64c864; padding: 15px; border-radius: 4px;">
          <div style="color: #a0a0a0; font-size: 11px; text-transform: uppercase;">Total Students</div>
          <div style="color: #64c864; font-size: 24px; font-weight: bold; margin-top: 5px;">${totalStudents}</div>
          <div style="color: #808080; font-size: 10px; margin-top: 3px;">${activeStudents} active</div>
        </div>

        <div style="background: rgba(100, 150, 255, 0.1); border-left: 4px solid #64c8ff; padding: 15px; border-radius: 4px;">
          <div style="color: #a0a0a0; font-size: 11px; text-transform: uppercase;">This Week</div>
          <div style="color: #64c8ff; font-size: 24px; font-weight: bold; margin-top: 5px;">${totalSessions}</div>
          <div style="color: #808080; font-size: 10px; margin-top: 3px;">Workouts executed</div>
        </div>

        <div style="background: rgba(255, 150, 100, 0.1); border-left: 4px solid #ff9664; padding: 15px; border-radius: 4px;">
          <div style="color: #a0a0a0; font-size: 11px; text-transform: uppercase;">System Health</div>
          <div style="color: #64c864; font-size: 24px; font-weight: bold; margin-top: 5px;">✓</div>
          <div style="color: #808080; font-size: 10px; margin-top: 3px;">All systems normal</div>
        </div>
      </div>

      <!-- PLATFORM OVERVIEW -->
      <h3 style="color: #64c8ff; margin-top: 0;">Platform Overview</h3>
      <div class="admin-professors">
  `;

  professorsWithStudents.forEach(prof => {
    html += `
      <div class="professor-card">
        <div class="professor-header">
          <span>${prof.name}</span>
          <span style="color: #a0a0a0; font-size: 12px;">${prof.studentCount} students</span>
        </div>
        <div style="color: #a0a0a0; font-size: 12px; margin-bottom: 8px;">
          ${prof.specialty} • ${prof.location}
        </div>
        <div class="student-list">
    `;

    prof.students.forEach(link => {
      const statusClass = `status-${link.student.status}`;
      html += `
        <div class="student-item">
          <span>${link.student.name}</span>
          <span class="student-status ${statusClass}">${link.student.status}</span>
        </div>
        <div style="color: #808080; font-size: 10px; margin-left: 0; margin-top: 4px; margin-bottom: 8px;">
          ${link.plan} • Expires: ${link.expiresAt}
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  html += `
      </div>

      <h3 style="color: #64c8ff; margin-top: 30px;">Pending & Expired Invitations</h3>
      <div class="admin-professors">
  `;

  const filteredInvitations = invitations.filter(i => i.status === 'pendente' || i.status === 'expirado');
  if (filteredInvitations.length === 0) {
    html += '<p style="color: #a0a0a0;">No pending or expired invitations</p>';
  } else {
    filteredInvitations.forEach(inv => {
      const prof = fixtures.professorProfiles.find(p => p.id === inv.professorId);
      html += `
        <div class="professor-card">
          <div class="professor-header">
            <span>${inv.invitedName} → ${prof?.name || 'Unknown'}</span>
            <span class="student-status ${inv.status === 'pendente' ? '' : 'expired'}">${inv.status}</span>
          </div>
          <div style="color: #a0a0a0; font-size: 12px;">Email: ${inv.invitedEmail}</div>
        </div>
      `;
    });
  }

  html += `
      </div>

      <h3 style="color: #64c8ff; margin-top: 30px;">Recent Support Actions</h3>
      <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 15px;">
  `;

  if (logs.length === 0) {
    html += '<p style="color: #a0a0a0;">No support actions</p>';
  } else {
    logs.forEach(log => {
      const user = fixtures.users.find(u => u.id === log.performedBy);
      html += `
        <div class="student-item">
          <span>${log.actionType} by ${user?.email || 'unknown'}</span>
          <span style="color: #a0a0a0; font-size: 11px;">${new Date(log.timestamp).toLocaleDateString()}</span>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>
  `;

  return html;
}
