export type SectionId =
  | 'dashboard'
  | 'replay'
  | 'weaknesses'
  | 'training'
  | 'progress'
  | 'settings'

export type NavigationItem = {
  id: SectionId
  label: string
  icon: string
}

export type PlannedSection = {
  eyebrow: string
  title: string
  description: string
}

export const sections: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'replay', label: 'Replay Analyzer', icon: '◈' },
  { id: 'weaknesses', label: 'Weaknesses', icon: '◇' },
  { id: 'training', label: 'Training', icon: '↗' },
  { id: 'progress', label: 'Progress', icon: '▥' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export const plannedSections: Record<
  Exclude<SectionId, 'dashboard' | 'replay'>,
  PlannedSection
> = {
  weaknesses: {
    eyebrow: 'Planned module',
    title: 'Weaknesses',
    description:
      'Weakness detection will use explainable rules once replay metrics are available.',
  },
  training: {
    eyebrow: 'Planned module',
    title: 'Training',
    description:
      'Training recommendations will be based on measured weaknesses and your goals.',
  },
  progress: {
    eyebrow: 'Planned module',
    title: 'Progress',
    description:
      'Progress tracking will start after analyzed sessions can be stored locally.',
  },
  settings: {
    eyebrow: 'Foundation',
    title: 'Settings',
    description:
      'Settings will be added alongside persistence and desktop preferences.',
  },
}
