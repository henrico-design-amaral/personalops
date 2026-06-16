/**
 * Weekly schedule renderers (grid, modal builder)
 */

import {
  getProfessorAvailableWorkouts,
  getProfessorAvailableCardios
} from '../fixtures-loader.js';

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

export function renderWorkoutBuilderModal(state, fixtures, actor) {
  const exercises = fixtures.exercises || [];
  const workoutBuilder = state.workoutBuilder;
  const exerciseOptions = exercises.map(ex => ({
    id: ex.id,
    name: ex.name,
    category: ex.category,
    equipment: ex.equipment,
    difficulty: ex.difficulty
  }));

  const exercisesInWorkout = workoutBuilder.exercises.map((ex, idx) => `
    <div style="background: rgba(0, 0, 0, 0.3); border-left: 4px solid #64c8ff; padding: 10px; margin-bottom: 8px; border-radius: 3px; display: flex; justify-content: space-between; align-items: center;">
      <div style="flex: 1;">
        <div style="color: #d0d0d0; font-size: 12px; font-weight: bold;">${ex.exerciseName}</div>
        <div style="color: #a0a0a0; font-size: 11px; margin-top: 3px;">${ex.sets} × ${ex.reps} • Rest: ${ex.restSeconds}s</div>
      </div>
      <button class="button" style="padding: 4px 8px; background: rgba(200, 100, 100, 0.2); color: #ff8080; font-size: 11px;" onclick="window.removeExerciseFromWorkout(${idx})">Remove</button>
    </div>
  `).join('');

  return `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: rgba(0, 0, 0, 0.95); border: 2px solid rgba(100, 200, 255, 0.3); border-radius: 12px; padding: 25px; max-width: 700px; max-height: 90vh; overflow-y: auto; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="color: #64c8ff; margin: 0; font-size: 18px;">Create New Workout</h2>
          <button style="background: none; border: none; color: #a0a0a0; font-size: 24px; cursor: pointer;" onclick="window.closeWorkoutBuilder()">✕</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
          <div>
            <label style="color: #a0a0a0; font-size: 11px; display: block; margin-bottom: 4px;">WORKOUT NAME</label>
            <input type="text" placeholder="e.g., Chest & Triceps" id="workout-name" value="${workoutBuilder.name}" style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.3); color: #d0d0d0; border-radius: 4px; font-size: 12px;" onchange="window.updateWorkoutBuilder({name: this.value})" />
          </div>
          <div>
            <label style="color: #a0a0a0; font-size: 11px; display: block; margin-bottom: 4px;">FOCUS</label>
            <input type="text" placeholder="e.g., Hypertrophy" id="workout-focus" value="${workoutBuilder.focus}" style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.3); color: #d0d0d0; border-radius: 4px; font-size: 12px;" onchange="window.updateWorkoutBuilder({focus: this.value})" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
          <div>
            <label style="color: #a0a0a0; font-size: 11px; display: block; margin-bottom: 4px;">GOAL</label>
            <input type="text" placeholder="e.g., Strength & Size" id="workout-goal" value="${workoutBuilder.goal}" style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.3); color: #d0d0d0; border-radius: 4px; font-size: 12px;" onchange="window.updateWorkoutBuilder({goal: this.value})" />
          </div>
          <div>
            <label style="color: #a0a0a0; font-size: 11px; display: block; margin-bottom: 4px;">DURATION (min)</label>
            <input type="number" placeholder="50" id="workout-duration" value="${workoutBuilder.estimatedDuration}" style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.3); color: #d0d0d0; border-radius: 4px; font-size: 12px;" onchange="window.updateWorkoutBuilder({estimatedDuration: parseInt(this.value)})" />
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="color: #a0a0a0; font-size: 11px; display: block; margin-bottom: 8px;">ADD EXERCISES</label>
          <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px;">
            <select id="exercise-select" style="padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(100, 200, 255, 0.3); color: #d0d0d0; border-radius: 4px; font-size: 12px;">
              <option value="">-- Select Exercise --</option>
              ${exerciseOptions.map(ex => `<option value="${ex.id}|${ex.name}|${ex.category}|${ex.equipment}|${ex.difficulty}">${ex.name} (${ex.category})</option>`).join('')}
            </select>
            <button class="button" style="padding: 8px 16px; background: rgba(100, 200, 100, 0.2); color: #64c864; font-size: 12px;" onclick="window.addSelectedExercise()">+ Add</button>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="color: #a0a0a0; font-size: 11px; display: block; margin-bottom: 8px;">EXERCISES IN WORKOUT (${workoutBuilder.exercises.length})</label>
          ${exercisesInWorkout || '<div style="color: #a0a0a0; font-size: 12px; padding: 10px; text-align: center;">No exercises added yet</div>'}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <button class="button" style="padding: 10px; background: rgba(200, 100, 100, 0.2); color: #ff8080; font-size: 12px;" onclick="window.closeWorkoutBuilder()">Cancel</button>
          <button class="button" style="padding: 10px; background: rgba(100, 150, 255, 0.2); color: #64c8ff; font-size: 12px;">Clone Template</button>
          <button class="button" style="padding: 10px; background: rgba(100, 200, 100, 0.2); color: #64c864; font-size: 12px;" onclick="alert('✓ Simulated: Workout saved (no persistence yet)'); window.closeWorkoutBuilder();">Save (Simulated)</button>
        </div>

        <div style="color: #a0a0a0; font-size: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(100, 200, 255, 0.1);">
          💡 This is a simulation. Changes are not persisted to the database.
        </div>
      </div>
    </div>
  `;
}
