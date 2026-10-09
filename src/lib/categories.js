export const CATEGORIES = [
  { id: 'all', label: 'All', badge: 'ALL' },
  { id: 'pdf', label: 'PDFs', badge: 'PDF' },
  { id: 'document', label: 'Documents', badge: 'DOC' },
  { id: 'presentation', label: 'Presentations', badge: 'PPT' },
]

export const FILE_CATEGORIES = CATEGORIES.filter((category) => category.id !== 'all')

const LABELS = {
  pdf: 'PDF',
  document: 'Document',
  presentation: 'Presentation',
}

export function categoryLabel(id) {
  return LABELS[id] || 'File'
}
