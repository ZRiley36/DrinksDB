import { useState, useEffect } from 'react'
import './App.css'
import GameNightMenu from './GameNightMenu'
import { api } from './api'

function App() {
  const [showMenu, setShowMenu] = useState(false)
  const [drinks, setDrinks] = useState([])
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeFilters, setActiveFilters] = useState({ method: null, glass: null })

  // Fetch all drinks on mount
  useEffect(() => {
    fetchDrinks()
  }, [])

  const fetchDrinks = async () => {
    try {
      setLoading(true)
      const data = await api.get('/api/drinks')
      setDrinks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrinkDetails = async (drinkName) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching drink details for:', drinkName)
      const encodedName = encodeURIComponent(drinkName)
      const data = await api.get(`/api/drinks/${encodedName}`)
      setSelectedDrink(data)
    } catch (err) {
      console.error('Error fetching drink details:', err)
      setError(err.message)
      setSelectedDrink(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchDrinks()
      setActiveFilters({ method: null, glass: null })
      return
    }

    try {
      setLoading(true)
      setActiveFilters({ method: null, glass: null })
      const data = await api.get(`/api/drinks/search/${encodeURIComponent(searchQuery)}`)
      setDrinks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async (newFilters) => {
    try {
      setLoading(true)
      setError(null)
      setSearchQuery('')
      setSelectedDrink(null) // Clear selected drink when filtering
      
      const params = new URLSearchParams()
      if (newFilters.method) params.append('method', newFilters.method)
      if (newFilters.glass) params.append('glass', newFilters.glass)
      
      const data = await api.get(`/api/drinks/filter?${params.toString()}`)
      setDrinks(data)
      setActiveFilters(newFilters)
    } catch (err) {
      console.error('Filter error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterByMethod = async (method) => {
    const newFilters = { ...activeFilters }
    
    // Toggle: if already filtered by this method, remove it
    if (newFilters.method === method) {
      newFilters.method = null
    } else {
      newFilters.method = method
    }
    
    await applyFilters(newFilters)
  }

  const filterByGlass = async (glass) => {
    const newFilters = { ...activeFilters }
    
    // Toggle: if already filtered by this glass, remove it
    if (newFilters.glass === glass) {
      newFilters.glass = null
    } else {
      newFilters.glass = glass
    }
    
    await applyFilters(newFilters)
  }

  const clearFilter = (type) => {
    const newFilters = { ...activeFilters }
    if (type === 'method') {
      newFilters.method = null
    } else if (type === 'glass') {
      newFilters.glass = null
    }
    
    // If no filters remain, fetch all drinks
    if (!newFilters.method && !newFilters.glass) {
      setSearchQuery('')
      setActiveFilters({ method: null, glass: null })
      fetchDrinks()
    } else {
      applyFilters(newFilters)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setActiveFilters({ method: null, glass: null })
    fetchDrinks()
  }

  if (showMenu) {
    return (
      <div className="app">
        <div className="nav-bar">
          <button onClick={() => setShowMenu(false)} className="nav-button">
            ← Back to Database
          </button>
        </div>
        <GameNightMenu />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>DrinksDB</h1>
        <p className="subtitle">Cocktail Recipe Database</p>
        <button onClick={() => setShowMenu(true)} className="menu-button">
          Game Night Menu
        </button>
      </header>

      <div className="container">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for a drink..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
            <button 
              type="button" 
              onClick={() => {
                clearFilters()
                setSelectedDrink(null)
              }}
              className="clear-button"
            >
              Clear
            </button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {(activeFilters.method || activeFilters.glass) && (
          <div className="active-filter-banner">
            <div className="active-filters-list">
              {activeFilters.method && (
                <span className="filter-tag">
                  Method: <strong>{activeFilters.method}</strong>
                  <button onClick={() => clearFilter('method')} className="clear-filter-button">×</button>
                </span>
              )}
              {activeFilters.glass && (
                <span className="filter-tag">
                  Glass: <strong>{activeFilters.glass}</strong>
                  <button onClick={() => clearFilter('glass')} className="clear-filter-button">×</button>
                </span>
              )}
            </div>
            <button onClick={clearFilters} className="clear-all-button">Clear All</button>
          </div>
        )}

        <div className="content">
          <div className="drinks-list">
            <h2>Drinks ({drinks.length})</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <ul className="drink-list">
                {drinks.map((drink) => (
                  <li
                    key={drink.drink_id}
                    className={`drink-item ${selectedDrink?.name === drink.name ? 'active' : ''}`}
                    onClick={() => fetchDrinkDetails(drink.name)}
                  >
                    <div className="drink-name">{drink.name}</div>
                    <div className="drink-meta">
                      {drink.glass_type && (
                        <span 
                          className={`badge ${activeFilters.glass === drink.glass_type ? 'active-filter' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            filterByGlass(drink.glass_type)
                          }}
                          title="Click to filter by this glass type"
                        >
                          {drink.glass_type}
                        </span>
                      )}
                      {drink.build_method && (
                        <span 
                          className={`badge ${activeFilters.method === drink.build_method ? 'active-filter' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            filterByMethod(drink.build_method)
                          }}
                          title="Click to filter by this method"
                        >
                          {drink.build_method}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="drink-details">
            {selectedDrink ? (
              <div className="details-card">
                <h2>{selectedDrink.name}</h2>
                
                {selectedDrink.description && (
                  <p className="description">{selectedDrink.description}</p>
                )}

                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Glass:</strong>{' '}
                    {selectedDrink.glass_type ? (
                      <span 
                        className="clickable-filter"
                        onClick={() => filterByGlass(selectedDrink.glass_type)}
                        title="Click to filter by this glass type"
                      >
                        {selectedDrink.glass_type}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div className="detail-item">
                    <strong>Method:</strong>{' '}
                    {selectedDrink.build_method ? (
                      <span 
                        className="clickable-filter"
                        onClick={() => filterByMethod(selectedDrink.build_method)}
                        title="Click to filter by this method"
                      >
                        {selectedDrink.build_method}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  {selectedDrink.garnish && (
                    <div className="detail-item">
                      <strong>Garnish:</strong> {selectedDrink.garnish}
                    </div>
                  )}
                </div>

                <div className="ingredients-section">
                  <h3>Ingredients</h3>
                  <ul className="ingredients-list">
                    {selectedDrink.ingredients && selectedDrink.ingredients.length > 0 ? (
                      selectedDrink.ingredients.map((ing, idx) => (
                        <li key={idx} className="ingredient-item">
                          <span className="ingredient-amount">
                            {ing.amount} {ing.unit}
                          </span>
                          <span className="ingredient-name">{ing.name}</span>
                        </li>
                      ))
                    ) : (
                      <li>No ingredients found</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="placeholder">
                <p>Select a drink to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

