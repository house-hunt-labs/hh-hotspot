'use client';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchBar({ query, onQueryChange, onSearch }: SearchBarProps) {
  return (
    <div className="map-search-inner">
      <label className="sr-only" htmlFor="place-search">
        Search place or locality
      </label>
      <div className="map-search-field-wrap">
        <input
          id="place-search"
          className="map-search-field"
          placeholder="Try address search (optional)…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSearch();
            }
          }}
        />
        <button type="button" onClick={onSearch} className="map-search-icon-btn" aria-label="Search">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
