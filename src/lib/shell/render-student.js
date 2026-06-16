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

      <!-- TODAY'S WORKOUT -->
      <div style="margin-top: 20px; background: rgba(100, 150, 255, 0.1); border-left: 4px solid #64c8ff; padding: 15px; border-radius: 4px;">
        <h3 style="color: #64c8ff; margin: 0 0 10px 0;">Today's Workout</h3>
        <div style="color: #d0d0d0; font-size: 13px;">
          <div><strong>Type:</strong> Upper Body Strength</div>
          <div style="margin-top: 8px; color: #a0a0a0; font-size: 12px;">Estimated: 50 minutes</div>
          <button class="button" style="margin-top: 10px; background: rgba(100, 200, 100, 0.2); color: #64c864;">Start Workout</button>
          <button class="button" style="background: rgba(100, 150, 255, 0.2); color: #64c8ff;">View Exercises</button>
        </div>
      </div>

      <!-- ACTIVITY & FEEDBACK -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
        <div class="portal-section">
          <h3>Recent Activity</h3>
          <div style="color: #a0a0a0; font-size: 11px; line-height: 1.8;">
            <div>✓ Jun 14 — Completed workout (52 min)</div>
            <div>✓ Jun 13 — Completed workout (48 min)</div>
            <div>○ Jun 12 — Rest day</div>
            <div>✓ Jun 11 — Completed cardio (35 min)</div>
          </div>
        </div>

        <div class="portal-section">
          <h3>Feedback & Notes</h3>
          <div style="color: #a0a0a0; font-size: 11px; line-height: 1.8;">
            <div style="color: #64c8ff;">Your Professor says:</div>
            <div style="margin-top: 5px;">Great effort this week! Keep the intensity.</div>
          </div>
        </div>
      </div>

      <!-- PROFILE & ACCOUNT -->
      <div style="margin-top: 20px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 15px;">
        <h3 style="color: #a0a0a0; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">Account</h3>
        <div style="display: grid; gap: 8px;">
          <button class="button" style="width: 100%; text-align: left;">🔒 Change Password</button>
          <button class="button" style="width: 100%; text-align: left;">🔑 Request Account Recovery</button>
          <button class="button" style="width: 100%; text-align: left;">📋 Download My Data</button>
        </div>
      </div>
    </div>
  `;
}
