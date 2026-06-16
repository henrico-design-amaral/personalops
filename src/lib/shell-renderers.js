/**
 * Shell Renderers
 * Pure rendering functions for shell views (returns HTML strings)
 */

import {
  getProfessorStudents,
  getProfessorInvitations,
  getAllProfessorsWithStudents,
  getStudentWeekSchedule,
  getProfessorAvailableWorkouts,
  getProfessorAvailableCardios
} from './fixtures-loader.js';

export function renderRoleSwitcher() {
  return `
    <div class="role-switcher">
      <h1>PersonalOps Operating Shell</h1>
      <div class="switcher-controls">
        <label for="role-select">Switch Role (Demo):</label>
        <select id="role-select">
          <option value="admin-1">Admin - Administrator</option>
          <option value="prof-a">Professor - João Silva (Hipertrofia)</option>
          <option value="prof-b">Professor - Maria Santos (Emagrecimento)</option>
          <option value="std-01">Student - Aluno Um (Active)</option>
          <option value="std-02">Student - Aluno Dois (Paused)</option>
          <option value="std-04">Student - Aluno Quatro (Active, Prof B)</option>
        </select>
      </div>
      <p class="disclaimer">
        💡 This is a demonstration shell. Select different roles to see how access control filters data.
      </p>
    </div>
  `;
}

export function renderAccessDenied(reason) {
  return `
    <div class="view active">
      <div class="access-denied">
        <h2>Access Denied</h2>
        <p>${reason}</p>
      </div>
    </div>
  `;
}

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

export function renderWeeklyScheduleGrid(schedule, actor, student) {
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const weekdayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  let scheduleHtml = '';
  const isClickable = actor.professorProfile && actor.professorProfile.id;

  weekdays.forEach((day, idx) => {
    const assignment = schedule.find(s => s.weekday === day);
    if (assignment) {
      let itemName = '';
      let itemDetails = '';
      let statusBadgeColor = '#a0a0a0';

      if (assignment.type === 'workout' && assignment.assignedWorkout) {
        itemName = assignment.assignedWorkout.name;
        itemDetails = `${assignment.assignedWorkout.focus} • ${assignment.assignedWorkout.estimatedDuration} min`;
        statusBadgeColor = '#64c8ff';
      } else if (assignment.type === 'cardio' && assignment.assignedCardio) {
        itemName = `Cardio: ${assignment.assignedCardio.type}`;
        itemDetails = `${assignment.assignedCardio.intensity} • ${assignment.assignedCardio.duration} min`;
        statusBadgeColor = '#64c864';
      } else if (assignment.type === 'rest') {
        itemName = 'Rest Day';
        itemDetails = 'Recovery day';
        statusBadgeColor = '#ffc864';
      }

      const clickHandler = isClickable ? `onclick="window.openWeeklyPlanEditor('${student.id}', '${day}')"` : '';
      const hoverStyles = isClickable ? `onmouseover="this.style.background='rgba(0, 0, 0, 0.4)'" onmouseout="this.style.background='rgba(0, 0, 0, 0.2)'"` : '';
      const cursorStyle = isClickable ? `cursor: pointer; transition: all 0.2s;` : '';

      scheduleHtml += `
        <div style="background: rgba(0, 0, 0, 0.2); border-left: 4px solid ${statusBadgeColor}; padding: 12px; border-radius: 4px; margin-bottom: 8px; ${cursorStyle}" ${hoverStyles} ${clickHandler}>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="color: ${statusBadgeColor}; font-weight: bold;">${weekdayLabels[idx]}</span>
            <span style="color: #a0a0a0; font-size: 11px; text-transform: uppercase;">${assignment.type}</span>
          </div>
          <div style="color: #d0d0d0; font-size: 13px;">${itemName}</div>
          <div style="color: #a0a0a0; font-size: 11px; margin-top: 4px;">${itemDetails}</div>
          ${assignment.notes ? `<div style="color: #808080; font-size: 10px; margin-top: 4px; font-style: italic;">Note: ${assignment.notes}</div>` : ''}
          ${isClickable ? `<div style="color: #64c8ff; font-size: 10px; margin-top: 8px; font-weight: bold;">👁️ Click to edit</div>` : ''}
        </div>
      `;
    }
  });

  return scheduleHtml;
}

export function renderWeeklyPlanBuilderModal(student, weekday, schedule, actor, fixtures) {
  const weekdayLabels = { 'monday': 'Monday', 'tuesday': 'Tuesday', 'wednesday': 'Wednesday', 'thursday': 'Thursday', 'friday': 'Friday', 'saturday': 'Saturday', 'sunday': 'Sunday' };
  const currentAssignment = schedule.find(s => s.weekday === weekday);
  const availableWorkouts = getProfessorAvailableWorkouts(actor.professorProfile.id, fixtures);
  const availableCardios = getProfessorAvailableCardios(actor.professorProfile.id, fixtures);

  let selectedType = currentAssignment?.type || 'workout';
  let previewHtml = '';

  if (selectedType === 'workout') {
    const selectedWorkout = availableWorkouts.find(w => w.id === currentAssignment?.assignedWorkoutId);
    if (selectedWorkout) {
      previewHtml = `<div style="background: rgba(100, 150, 255, 0.2); border-left: 4px solid #64c8ff; padding: 12px; border-radius: 4px; margin-top: 10px;">
        <div style="color: #64c8ff; font-weight: bold;">${selectedWorkout.name}</div>
        <div style="color: #a0a0a0; font-size: 12px; margin-top: 4px;">${selectedWorkout.focus} • ${selectedWorkout.estimatedDuration} min • ${selectedWorkout.level}</div>
      </div>`;
    }
  } else if (selectedType === 'cardio') {
    const selectedCardio = availableCardios.find(c => c.id === currentAssignment?.assignedCardioId);
    if (selectedCardio) {
      previewHtml = `<div style="background: rgba(100, 200, 100, 0.2); border-left: 4px solid #64c864; padding: 12px; border-radius: 4px; margin-top: 10px;">
        <div style="color: #64c864; font-weight: bold;">Cardio: ${selectedCardio.type}</div>
        <div style="color: #a0a0a0; font-size: 12px; margin-top: 4px;">${selectedCardio.intensity} • ${selectedCardio.duration} min</div>
      </div>`;
    }
  } else if (selectedType === 'rest') {
    previewHtml = `<div style="background: rgba(255, 200, 100, 0.2); border-left: 4px solid #ffc864; padding: 12px; border-radius: 4px; margin-top: 10px;">
      <div style="color: #ffc864; font-weight: bold;">Rest Day</div>
      <div style="color: #a0a0a0; font-size: 12px; margin-top: 4px;">Recovery day</div>
    </div>`;
  }

  return `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 1000; display: flex; align-items: center; justify-content: center;">
      <div style="background: #1a1a1a; border: 1px solid rgba(100, 200, 255, 0.3); border-radius: 8px; padding: 30px; max-width: 400px; width: 90%;">
        <h3 style="color: #64c8ff; margin: 0 0 20px 0;">Edit ${weekdayLabels[weekday]}</h3>

        <div style="margin-bottom: 15px;">
          <label style="color: #a0a0a0; font-size: 12px; display: block; margin-bottom: 5px;">Day Type</label>
          <select style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.3); color: #64c8ff; border-radius: 4px; font-size: 13px;">
            <option value="workout" ${selectedType === 'workout' ? 'selected' : ''}>Workout</option>
            <option value="cardio" ${selectedType === 'cardio' ? 'selected' : ''}>Cardio</option>
            <option value="rest" ${selectedType === 'rest' ? 'selected' : ''}>Rest Day</option>
            <option value="check_in" ${selectedType === 'check_in' ? 'selected' : ''}>Check-in</option>
            <option value="assessment" ${selectedType === 'assessment' ? 'selected' : ''}>Assessment</option>
          </select>
        </div>

        ${(selectedType === 'workout' || selectedType === 'cardio') ? `
          <div style="margin-bottom: 15px;">
            <label style="color: #a0a0a0; font-size: 12px; display: block; margin-bottom: 5px;">${selectedType === 'workout' ? 'Workout Template' : 'Cardio Template'}</label>
            <select style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.3); color: #64c8ff; border-radius: 4px; font-size: 13px;">
              <option value="">-- Select ${selectedType === 'workout' ? 'Workout' : 'Cardio'} --</option>
              ${selectedType === 'workout' ? availableWorkouts.map(w => `<option value="${w.id}" ${currentAssignment?.assignedWorkoutId === w.id ? 'selected' : ''}>${w.name}</option>`).join('') : ''}
              ${selectedType === 'cardio' ? availableCardios.map(c => `<option value="${c.id}" ${currentAssignment?.assignedCardioId === c.id ? 'selected' : ''}>${c.type} (${c.intensity}, ${c.duration}min)</option>`).join('') : ''}
            </select>
          </div>
        ` : ''}

        <div id="preview-area">
          ${previewHtml}
        </div>

        <div style="margin-top: 20px; display: flex; gap: 10px;">
          <button class="button" style="flex: 1; padding: 10px; background: rgba(100, 150, 255, 0.2);" onclick="window.closeWeeklyPlanEditor()">Cancel</button>
          <button class="button" style="flex: 1; padding: 10px; background: rgba(100, 200, 100, 0.2); color: #64c864;" onclick="alert('✓ Simulated: Changes preview only (no persistence yet)'); window.closeWeeklyPlanEditor();">Apply (Simulated)</button>
        </div>

        <div style="color: #a0a0a0; font-size: 11px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(100, 200, 255, 0.1);">
          💡 This is a simulation. Changes are not persisted to the database.
        </div>
      </div>
    </div>
  `;
}

export function renderStudentWeeklyGrid(schedule, actor) {
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  const todayMap = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };

  let scheduleHtml = '';
  weekdays.forEach((day, idx) => {
    const assignment = schedule.find(s => s.weekday === day);
    const isToday = todayMap[today] === idx;
    const dayBg = isToday ? 'rgba(100, 150, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
    const dayBorder = isToday ? '#64c8ff' : 'rgba(100, 200, 255, 0.1)';

    if (assignment) {
      let itemName = '';
      let itemShort = '';

      if (assignment.type === 'workout' && assignment.assignedWorkout) {
        itemName = assignment.assignedWorkout.name;
        itemShort = `${assignment.assignedWorkout.estimatedDuration}m`;
      } else if (assignment.type === 'cardio' && assignment.assignedCardio) {
        itemName = `Cardio: ${assignment.assignedCardio.type}`;
        itemShort = `${assignment.assignedCardio.duration}m`;
      } else if (assignment.type === 'rest') {
        itemName = 'Rest';
        itemShort = '—';
      }

      scheduleHtml += `
        <div style="background: ${dayBg}; border: 1px solid ${dayBorder}; padding: 10px; border-radius: 4px; text-align: center; flex: 1;">
          <div style="color: ${isToday ? '#64c8ff' : '#a0a0a0'}; font-size: 11px; font-weight: bold; margin-bottom: 4px;">${weekdayLabels[idx]}</div>
          <div style="color: #d0d0d0; font-size: 12px; line-height: 1.3; min-height: 40px; display: flex; align-items: center; justify-content: center;">
            <span>${itemName}</span>
          </div>
          <div style="color: #a0a0a0; font-size: 10px; margin-top: 4px;">${itemShort}</div>
        </div>
      `;
    }
  });

  return scheduleHtml;
}
