/**
 * Shell State Management
 * Centralized state for the operating shell
 */

export class ShellState {
  constructor() {
    this.currentUserId = 'admin-1';
    this.selectedStudentId = null;
    this.editingWeekDay = null;
    this.editingStudent = null;
    this.creatingWorkout = false;
    this.workoutBuilder = {
      name: '',
      focus: '',
      goal: '',
      estimatedDuration: 0,
      exercises: []
    };
    this.selectedWorkoutDetail = null;
  }

  selectStudent(studentId) {
    this.selectedStudentId = studentId;
    this.editingWeekDay = null;
    this.editingStudent = null;
  }

  openWeeklyPlanEditor(studentId, weekday) {
    this.editingWeekDay = weekday;
    this.editingStudent = studentId;
  }

  closeWeeklyPlanEditor() {
    this.editingWeekDay = null;
    this.editingStudent = null;
  }

  openWorkoutBuilder() {
    this.creatingWorkout = true;
    this.workoutBuilder = { name: '', focus: '', goal: '', estimatedDuration: 0, exercises: [] };
  }

  closeWorkoutBuilder() {
    this.creatingWorkout = false;
    this.workoutBuilder = { name: '', focus: '', goal: '', estimatedDuration: 0, exercises: [] };
  }

  addExerciseToWorkout(exercise) {
    this.workoutBuilder.exercises.push({ ...exercise, sets: 3, reps: '10-12', restSeconds: 60 });
  }

  removeExerciseFromWorkout(index) {
    this.workoutBuilder.exercises.splice(index, 1);
  }

  updateWorkoutBuilder(updates) {
    this.workoutBuilder = { ...this.workoutBuilder, ...updates };
  }

  openWorkoutDetail(workoutId) {
    this.selectedWorkoutDetail = workoutId;
  }

  closeWorkoutDetail() {
    this.selectedWorkoutDetail = null;
  }

  setCurrentUser(userId) {
    this.currentUserId = userId;
    this.selectedStudentId = null;
    this.editingWeekDay = null;
    this.editingStudent = null;
    this.creatingWorkout = false;
    this.selectedWorkoutDetail = null;
  }

  reset() {
    this.currentUserId = 'admin-1';
    this.selectedStudentId = null;
    this.editingWeekDay = null;
    this.editingStudent = null;
    this.creatingWorkout = false;
    this.workoutBuilder = { name: '', focus: '', goal: '', estimatedDuration: 0, exercises: [] };
    this.selectedWorkoutDetail = null;
  }
}

export function createShellState() {
  return new ShellState();
}
