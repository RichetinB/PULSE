import type { SectionId, NavigationItem } from '../../app/navigation'

type SidebarProps = {
  navigationItems: NavigationItem[]
  activeSection: SectionId
  onNavigate: (section: SectionId) => void
}

export function Sidebar({
  navigationItems,
  activeSection,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div>
          <strong>PULSE</strong>
          <span>osu! performance coach</span>
        </div>
      </div>

      <nav className="navigation" aria-label="Primary navigation">
        <span className="navigation-label">Workspace</span>
        {navigationItems.map((section) => (
          <button
            className={`navigation-item ${
              activeSection === section.id ? 'active' : ''
            }`}
            key={section.id}
            type="button"
            onClick={() => onNavigate(section.id)}
            aria-current={activeSection === section.id ? 'page' : undefined}
          >
            <span className="navigation-icon" aria-hidden="true">
              {section.icon}
            </span>
            {section.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" aria-hidden="true" />
        <span>Local-first foundation</span>
      </div>
    </aside>
  )
}
