/**
 * Professor view renderers (dashboard, student profile)
 */

import {
  getProfessorStudents,
  getProfessorInvitations,
  getStudentWeekSchedule,
  getProfessorInvoices,
  getProfessorCashflow,
  getAllExercises,
  getProfessorAvailableWorkouts,
  getProfessorCreatedWorkouts
} from '../fixtures-loader.js';
import { renderWeeklyScheduleGrid, renderWeeklyPlanBuilderModal, renderWorkoutBuilderModal } from './schedule-utils.js';

export function renderProfessorDashboard(actor, fixtures, state) {
  const students = getProfessorStudents(actor.professorProfile.id, fixtures);
  const invitations = getProfessorInvitations(actor.professorProfile.id, fixtures);
  const activeStudents = students.filter(s => s.status === 'ativo').length;
  const pausedStudents = students.filter(s => s.status === 'pausado').length;
  const archivedStudents = students.filter(s => s.status === 'arquivado').length;
  const pendingInvites = invitations.filter(i => i.status === 'pendente').length;

  let html = `
    <div class="view active">
      <div class="view-header">
        <h2>Professor Dashboard</h2>
        <p class="info">User: ${state.currentUserId} | Professor: ${actor.professorProfile.name}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(100, 200, 100, 0.2); border-radius: 8px; padding: 15px; text-align: center;">
          <div style="color: #64c864; font-size: 28px; font-weight: bold;">${activeStudents}</div>
          <div style="color: #a0a0a0; font-size: 12px; margin-top: 5px;">Active Students</div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 200, 100, 0.2); border-radius: 8px; padding: 15px; text-align: center;">
          <div style="color: #ffc864; font-size: 28px; font-weight: bold;">${pausedStudents}</div>
          <div style="color: #a0a0a0; font-size: 12px; margin-top: 5px;">Paused</div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(150, 150, 150, 0.2); border-radius: 8px; padding: 15px; text-align: center;">
          <div style="color: #a0a0a0; font-size: 28px; font-weight: bold;">${archivedStudents}</div>
          <div style="color: #a0a0a0; font-size: 12px; margin-top: 5px;">Archived</div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(100, 150, 255, 0.2); border-radius: 8px; padding: 15px; text-align: center;">
          <div style="color: #64c8ff; font-size: 28px; font-weight: bold;">${pendingInvites}</div>
          <div style="color: #a0a0a0; font-size: 12px; margin-top: 5px;">Pending Invites</div>
        </div>
      </div>

      <h3 style="color: #64c8ff; margin-top: 0; display: flex; justify-content: space-between; align-items: center;">
        My Students (${students.length})
        <button class="button" style="margin: 0;">+ Add Student</button>
      </h3>
      <div class="professor-students">
  `;

  if (students.length === 0) {
    html += '<p style="color: #a0a0a0;">No students yet. Create your first invitation to get started.</p>';
  } else {
    students.forEach(link => {
      const student = link.student;
      const lastAccess = new Date(Date.now() - Math.random() * 86400000).toLocaleDateString();
      html += `
        <div class="student-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div class="student-name">${student.name}</div>
            <span class="student-status status-${student.status}">${student.status}</span>
          </div>
          <div class="student-details">
            <div>Mode: ${link.mode} • Plan: ${link.plan}</div>
            <div>Expires: ${link.expiresAt}</div>
            <div style="margin-top: 5px; color: #808080; font-size: 11px;">Last access: ${lastAccess}</div>
          </div>
          <div style="margin-top: 10px;">
            <button class="button" onclick="window.selectStudent('${student.id}')">View Profile</button>
            <button class="button">Prescribe Week</button>
            <button class="button">View Feedback</button>
          </div>
        </div>
      `;
    });
  }

  html += `
      </div>

      <h3 style="color: #64c8ff; margin-top: 30px; display: flex; justify-content: space-between; align-items: center;">
        Pending Invitations (${pendingInvites})
        <button class="button" style="margin: 0;">+ New Invite</button>
      </h3>
      <div class="admin-professors">
  `;

  if (invitations.length === 0) {
    html += '<p style="color: #a0a0a0;">No invitations</p>';
  } else {
    invitations.forEach(inv => {
      const statusClass = inv.status === 'pendente' ? '' : 'expired';
      html += `
        <div class="professor-card">
          <div class="professor-header">
            <span>${inv.invitedName}</span>
            <span class="student-status ${statusClass}">${inv.status}</span>
          </div>
          <div style="color: #a0a0a0; font-size: 12px; margin-bottom: 8px;">${inv.invitedEmail}</div>
          <div style="color: #808080; font-size: 11px; margin-bottom: 10px;">
            Invited: ${new Date(inv.createdAt).toLocaleDateString()} • Expires: ${new Date(inv.tokenExpiresAt).toLocaleDateString()}
          </div>
          <button class="button">Resend Invite</button>
          <button class="button">Copy Link</button>
          <button class="button" style="background: rgba(200, 100, 100, 0.2); border-color: rgba(200, 100, 100, 0.4); color: #ff6464;">Cancel</button>
        </div>
      `;
    });
  }

  html += `
      </div>

      ${renderCreateWorkoutSection(actor, fixtures)}

      ${renderCashflowSection(actor, fixtures)}
    </div>
  `;

  return html;
}

export function renderProfessorStudentProfile(actor, fixtures, state) {
  const student = fixtures.studentProfiles.find(s => s.id === state.selectedStudentId);
  if (!student) {
    state.selectStudent(null);
    return renderProfessorDashboard(actor, fixtures, state);
  }

  const link = fixtures.professorStudentLinks.find(l => l.studentId === student.id && l.professorId === actor.professorProfile.id);
  if (!link) {
    state.selectStudent(null);
    return renderProfessorDashboard(actor, fixtures, state);
  }

  const lastAccess = new Date(Date.now() - Math.random() * 86400000).toLocaleDateString();
  const schedule = getStudentWeekSchedule(student.id, fixtures);
  const scheduleGrid = renderWeeklyScheduleGrid(schedule, actor, student);
  const modalHtml = state.editingWeekDay ? renderWeeklyPlanBuilderModal(student, state.editingWeekDay, schedule, actor, fixtures) : '';

  return `
    <div class="view active">
      <div class="view-header">
        <h2>${student.name} - Operational Profile</h2>
        <p class="info">Status: <span class="student-status status-${student.status}">${student.status}</span></p>
        <button class="button" style="margin-top: 10px;" onclick="window.selectStudent(null)">← Back to Dashboard</button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="portal-section">
          <h3>Student Information</h3>
          <div class="student-details">
            <div><strong>Name:</strong> ${student.name}</div>
            <div><strong>Email:</strong> ${student.email}</div>
            <div><strong>DOB:</strong> ${student.dateOfBirth || 'Not provided'}</div>
            <div><strong>Status:</strong> <span class="student-status status-${student.status}">${student.status}</span></div>
          </div>
        </div>

        <div class="portal-section">
          <h3>Link Details</h3>
          <div class="student-details">
            <div><strong>Mode:</strong> ${link.mode}</div>
            <div><strong>Plan:</strong> ${link.plan}</div>
            <div><strong>Started:</strong> ${link.startDate}</div>
            <div><strong>Expires:</strong> ${link.expiresAt}</div>
            <div style="margin-top: 10px; font-size: 12px; color: #808080;">Last access: ${lastAccess}</div>
          </div>
        </div>
      </div>

      <div class="portal-section" style="margin-top: 20px;">
        <h3>Weekly Schedule</h3>
        ${scheduleGrid || '<div class="placeholder">No schedule assigned yet</div>'}
      </div>

      <div style="color: #a0a0a0; font-size: 12px; margin-top: 20px; padding: 15px; background: rgba(100, 150, 255, 0.1); border-radius: 4px; margin-bottom: 20px;">
        💡 Click any day above to edit the weekly schedule and assign workouts/cardio.
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <div class="portal-section">
          <h3>Assessment & Progress</h3>
          <div class="placeholder">Assessment forms and progress tracking will appear here</div>
        </div>

        <div class="portal-section">
          <h3>Photos & Comments</h3>
          <div class="placeholder">Student-submitted photos and comments will appear here</div>
        </div>

        <div class="portal-section">
          <h3>Payments</h3>
          <div class="placeholder">Payment history and invoices will appear here</div>
        </div>

        <div class="portal-section">
          <h3>Feedback</h3>
          <div class="placeholder">Post-workout feedback will appear here</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <div class="portal-section">
          <h3>Assessment & Feedback</h3>
          <div style="color: #a0a0a0; font-size: 12px; line-height: 1.6;">
            <div>Status: <span style="color: #64c864;">✓ On track</span></div>
            <div>Last feedback: 2 days ago</div>
            <div>Next assessment: 5 days</div>
          </div>
        </div>

        <div class="portal-section">
          <h3>Workout Library</h3>
          <div style="color: #a0a0a0; font-size: 12px; line-height: 1.6;">
            <div>✓ System templates: 6</div>
            <div>✓ Custom templates: 2</div>
            <div>✓ Base exercises: 45</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
        <button class="button" style="padding: 10px; background: rgba(255, 200, 100, 0.2); color: #ffc864;">Pause Link</button>
        <button class="button" style="padding: 10px; background: rgba(100, 200, 100, 0.2); color: #64c864;">Activate</button>
        <button class="button" style="padding: 10px; background: rgba(200, 100, 100, 0.2); color: #ff6464;">Archive</button>
      </div>

      ${modalHtml}
    </div>
  `;
}

export function renderCreateWorkoutSection(actor, fixtures) {
  const systemWorkouts = getProfessorAvailableWorkouts(actor.professorProfile.id, fixtures);
  const ownWorkouts = getProfessorCreatedWorkouts(actor.professorProfile.id, fixtures);
  const exerciseCount = getAllExercises(fixtures).length;

  let ownWorkoutsHtml = '';
  if (ownWorkouts.length > 0) {
    ownWorkoutsHtml = `
      <div style="margin-top: 15px;">
        <h4 style="color: #64c8ff; margin: 0 0 10px 0; font-size: 13px;">Your Created Workouts (${ownWorkouts.length})</h4>
        <div style="display: grid; gap: 8px;">
          ${ownWorkouts.map(w => `
            <div style="background: rgba(0, 0, 0, 0.3); border-left: 4px solid #64c864; border-radius: 4px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div style="color: #d0d0d0; font-size: 12px;">${w.name}</div>
              <div style="color: #a0a0a0; font-size: 11px;">${w.exercises.length} exercises</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="portal-section" style="margin-top: 20px;">
      <h3>Create Workout</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div style="background: rgba(100, 200, 100, 0.1); border: 1px solid rgba(100, 200, 100, 0.2); border-radius: 4px; padding: 12px; text-align: center;">
          <div style="color: #64c864; font-size: 20px; font-weight: bold;">${systemWorkouts.length}</div>
          <div style="color: #a0a0a0; font-size: 12px;">System Templates</div>
        </div>
        <div style="background: rgba(100, 150, 255, 0.1); border: 1px solid rgba(100, 150, 255, 0.2); border-radius: 4px; padding: 12px; text-align: center;">
          <div style="color: #64c8ff; font-size: 20px; font-weight: bold;">${exerciseCount}</div>
          <div style="color: #a0a0a0; font-size: 12px;">Exercises Base</div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
        <button class="button" style="width: 100%; padding: 10px; background: rgba(100, 200, 100, 0.2); color: #64c864; font-size: 12px;" onclick="window.openWorkoutBuilder()">+ Create Blank</button>
        <button class="button" style="width: 100%; padding: 10px; background: rgba(100, 150, 255, 0.2); color: #64c8ff; font-size: 12px;">Clone System</button>
      </div>
      ${ownWorkoutsHtml}
    </div>
  `;
}

export function renderCashflowSection(actor, fixtures) {
  const cashflow = getProfessorCashflow(actor.professorProfile.id, fixtures);
  if (!cashflow) return '';

  const receivedPercentage = Math.round((cashflow.receivedRevenue / cashflow.expectedRevenue) * 100);

  return `
    <div class="portal-section" style="margin-top: 20px;">
      <h3 style="color: #64c8ff;">Cashflow Control</h3>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="background: rgba(100, 200, 100, 0.1); border: 1px solid rgba(100, 200, 100, 0.2); border-radius: 4px; padding: 10px;">
          <div style="color: #a0a0a0; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Received</div>
          <div style="color: #64c864; font-size: 16px; font-weight: bold;">R$ ${cashflow.receivedRevenue.toFixed(2)}</div>
          <div style="color: #a0a0a0; font-size: 9px; margin-top: 3px;">${receivedPercentage}% of expected</div>
        </div>
        <div style="background: rgba(255, 150, 100, 0.1); border: 1px solid rgba(255, 150, 100, 0.2); border-radius: 4px; padding: 10px;">
          <div style="color: #a0a0a0; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Pending</div>
          <div style="color: #ff9664; font-size: 16px; font-weight: bold;">R$ ${cashflow.pendingRevenue.toFixed(2)}</div>
          <div style="color: #a0a0a0; font-size: 9px; margin-top: 3px;">${cashflow.openInvoices} open invoices</div>
        </div>
      </div>

      <div style="background: rgba(0, 0, 0, 0.3); border-radius: 4px; padding: 12px; margin-bottom: 15px;">
        <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 8px;">Month Progress</div>
        <div style="background: rgba(0, 0, 0, 0.5); border-radius: 2px; height: 8px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #64c864, #64c8ff); width: ${receivedPercentage}%; height: 100%;"></div>
        </div>
        <div style="color: #a0a0a0; font-size: 10px; margin-top: 8px;">
          R$ ${cashflow.receivedRevenue.toFixed(2)} / R$ ${cashflow.expectedRevenue.toFixed(2)}
        </div>
      </div>

      <div style="color: #a0a0a0; font-size: 12px; line-height: 1.8; margin-bottom: 15px;">
        <div><strong>Students with expiring access:</strong></div>
        ${cashflow.studentsWithUpcomingExpiry.map(s =>
          `<div style="padding: 5px 0; color: #d0d0d0;">• ${s.studentName} (${s.daysUntilExpiry} days)</div>`
        ).join('')}
      </div>

      <button class="button" style="width: 100%; padding: 10px; background: rgba(100, 150, 255, 0.2); color: #64c8ff;">View Full Cashflow Report</button>
    </div>
  `;
}

export function renderProfessorView(actor, fixtures, state) {
  if (state.selectedStudentId) {
    return renderProfessorStudentProfile(actor, fixtures, state);
  }
  return renderProfessorDashboard(actor, fixtures, state);
}
