import type { PlannedSection } from '../app/navigation'

type PlannedPageProps = {
  section: PlannedSection
}

export function PlannedPage({ section }: PlannedPageProps) {
  return (
    <div className="page-content">
      <section className="placeholder-card">
        <span className="eyebrow">{section.eyebrow}</span>
        <h2>{section.title}</h2>
        <p>{section.description}</p>
        <span className="status-pill">Not implemented yet</span>
      </section>
    </div>
  )
}
