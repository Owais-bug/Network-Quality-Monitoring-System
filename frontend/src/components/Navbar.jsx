
function Navbar({ theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <span>Workspace / Overview</span>

      <div className="theme-control">
        <span>Light</span>

        <button
          type="button"
          className="theme-switch"
          role="switch"
          aria-label="Dark mode"
          aria-checked={theme === "dark"}
          onClick={onToggleTheme}
        >
          <span className="theme-switch-knob"></span>
        </button>

        <span>Dark</span>
      </div>
    </header>
  );
}

export default Navbar;
