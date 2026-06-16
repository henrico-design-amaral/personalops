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

  setCurrentUser(userId) {
    this.currentUserId = userId;
    this.selectedStudentId = null;
    this.editingWeekDay = null;
    this.editingStudent = null;
  }

  reset() {
    this.currentUserId = 'admin-1';
    this.selectedStudentId = null;
    this.editingWeekDay = null;
    this.editingStudent = null;
  }
}

export function createShellState() {
  return new ShellState();
}
