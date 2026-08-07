/**
 * Shared renderers (role switcher, access denied, common UI)
 */

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
