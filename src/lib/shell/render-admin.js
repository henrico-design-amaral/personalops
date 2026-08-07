/**
 * Admin view renderer — Platform dashboard with metrics, professional management, billing
 */

import { getAllProfessorsWithStudents, getAllExercises, getExercisesByCategory } from '../fixtures-loader.js';

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

      <h3 style="color: #64c8ff; margin-top: 30px;">Exercise Library</h3>
      <div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 15px;">
          <div style="background: rgba(100, 200, 100, 0.1); border: 1px solid rgba(100, 200, 100, 0.2); border-radius: 4px; padding: 12px; text-align: center;">
            <div style="color: #64c864; font-size: 24px; font-weight: bold;">${getAllExercises(fixtures).length}</div>
            <div style="color: #a0a0a0; font-size: 11px;">Total Exercises</div>
          </div>
          <div style="background: rgba(100, 150, 255, 0.1); border: 1px solid rgba(100, 150, 255, 0.2); border-radius: 4px; padding: 12px; text-align: center;">
            <div style="color: #64c8ff; font-size: 24px; font-weight: bold;">${getExercisesByCategory('peito', fixtures).length}</div>
            <div style="color: #a0a0a0; font-size: 11px;">Chest</div>
          </div>
          <div style="background: rgba(200, 100, 100, 0.1); border: 1px solid rgba(200, 100, 100, 0.2); border-radius: 4px; padding: 12px; text-align: center;">
            <div style="color: #ff8080; font-size: 24px; font-weight: bold;">${getExercisesByCategory('costas', fixtures).length}</div>
            <div style="color: #a0a0a0; font-size: 11px;">Back</div>
          </div>
          <div style="background: rgba(100, 200, 100, 0.1); border: 1px solid rgba(100, 200, 100, 0.2); border-radius: 4px; padding: 12px; text-align: center;">
            <div style="color: #64c864; font-size: 24px; font-weight: bold;">${getExercisesByCategory('perna', fixtures).length}</div>
            <div style="color: #a0a0a0; font-size: 11px;">Legs</div>
          </div>
        </div>

        <button class="button" style="width: 100%; padding: 10px; background: rgba(100, 200, 100, 0.2); border-color: rgba(100, 200, 100, 0.4); color: #64c864; margin-bottom: 8px;">+ Create New Exercise</button>
        <button class="button" style="width: 100%; padding: 10px; background: rgba(100, 150, 255, 0.2); border-color: rgba(100, 150, 255, 0.4); color: #64c8ff;">View Library Details</button>
      </div>

      <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 15px;">
        <h3 style="color: #a0a0a0; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">Create Exercise (Mockup)</h3>
        <div style="display: grid; gap: 8px;">
          <input type="text" placeholder="Exercise name (e.g., Barbell Bench Press)" style="padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.2); color: #d0d0d0; border-radius: 4px; font-size: 12px;" />
          <select style="padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.2); color: #d0d0d0; border-radius: 4px; font-size: 12px;">
            <option>Select category...</option>
            <option>Chest</option>
            <option>Back</option>
            <option>Legs</option>
            <option>Shoulders</option>
            <option>Arms</option>
            <option>Core</option>
          </select>
          <input type="text" placeholder="Primary muscle group" style="padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.2); color: #d0d0d0; border-radius: 4px; font-size: 12px;" />
          <input type="text" placeholder="Equipment needed" style="padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.2); color: #d0d0d0; border-radius: 4px; font-size: 12px;" />
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button class="button" style="background: rgba(100, 200, 100, 0.2); color: #64c864;">Save Exercise (Simulated)</button>
            <button class="button" style="background: rgba(200, 100, 100, 0.2); color: #ff8080;">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;

  return html;
}
