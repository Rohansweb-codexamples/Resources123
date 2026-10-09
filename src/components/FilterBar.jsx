import { CATEGORIES } from '../lib/categories.js'

export default function FilterBar({ query, onQueryChange, category, onCategoryChange, counts }) {
  return (
    <div className="toolbar">
      <div className="search">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search resources…"
          aria-label="Search resources"
        />
      </div>

      <div className="chips" role="tablist" aria-label="Filter by type">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={category === item.id}
            className={`chip${category === item.id ? ' chip-active' : ''}`}
            onClick={() => onCategoryChange(item.id)}
          >
            {item.label}
            <span className="chip-count">{counts[item.id] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
