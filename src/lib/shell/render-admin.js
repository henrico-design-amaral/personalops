/**
 * Admin view renderer
 */

import { getAllProfessorsWithStudents } from '../fixtures-loader.js';

export function renderAdminView(actor, fixtures) {
  const professorsWithStudents = getAllProfessorsWithStudents(fixtures);
  const invitations = fixtures.invitations;
  const logs = fixtures.supportActionLogs;

  let html = `
    <div class="view active">
      <div class="view-header">
        <h2>Admin Dashboard</h2>
        <p class="info">User: ${actor.user.id} | Role: Admin</p>
      </div>

      <h3 style="color: #64c8ff; margin-top: 0;">Professors & Students</h3>
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
