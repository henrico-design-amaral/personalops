/**
 * Student view renderer
 */

import { getStudentWeekSchedule } from '../fixtures-loader.js';

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

export function renderStudentView(actor, fixtures) {
  const student = actor.studentProfile;
  const link = fixtures.professorStudentLinks.find(l => l.studentId === student.id);
  const professor = fixtures.professorProfiles.find(p => p.id === link?.professorId);
  const schedule = getStudentWeekSchedule(student.id, fixtures);
  const scheduleGrid = renderStudentWeeklyGrid(schedule, actor);

  return `
    <div class="view active">
      <div class="view-header">
        <h2>Your Weekly Plan</h2>
        <p class="info">Student: ${student.name} | Professor: ${professor?.name || 'Unassigned'}</p>
      </div>

      <div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #64c8ff; margin-top: 0;">This Week's Schedule</h3>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${scheduleGrid}
        </div>
      </div>

      <div style="color: #a0a0a0; font-size: 12px; padding: 15px; background: rgba(0, 0, 0, 0.3); border-radius: 4px;">
        <p>💡 This is your weekly training schedule. Follow the plan set by your professor.</p>
      </div>
    </div>
  `;
}
