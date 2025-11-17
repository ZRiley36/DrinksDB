import { useState, useEffect } from 'react'
import './App.css'
import GameNightMenu from './GameNightMenu'
import { api } from './api'
import { getGlassIcon } from './glassIcons'

function App() {
  const [showMenu, setShowMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('search') // 'search' or 'ingredients'
  const [drinks, setDrinks] = useState([])
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeFilters, setActiveFilters] = useState({ method: null, glass: null })
  const [availableIngredients, setAvailableIngredients] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [ingredientSuggestions, setIngredientSuggestions] = useState([])

  // Fetch all drinks and ingredients on mount
  useEffect(() => {
    console.log('🚀 App mounted, fetching drinks...')
    fetchDrinks()
    fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    try {
      const data = await api.get('/api/ingredients')
      setAvailableIngredients(data)
    } catch (err) {
      console.error('Failed to fetch ingredients:', err)
    }
  }

  const fetchDrinks = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📋 Fetching all drinks...')
      const data = await api.get('/api/drinks')
      console.log('✅ Received drinks:', data.length)
      setDrinks(data)
    } catch (err) {
      console.error('❌ Failed to fetch drinks:', err)
      setError(`Failed to load drinks: ${err.message}`)
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
      console.log('🔍 Searching for:', searchQuery)
      const data = await api.get(`/api/drinks/search/${encodeURIComponent(searchQuery)}`)
      console.log('✅ Search results:', data.length)
      setDrinks(data)
    } catch (err) {
      console.error('❌ Search failed:', err)
      setError(`Search failed: ${err.message}`)
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
      
      const filterUrl = `/api/drinks/filter?${params.toString()}`
      console.log('🔽 Filtering drinks:', newFilters, filterUrl)
      const data = await api.get(filterUrl)
      console.log('✅ Filter results:', data.length)
      setDrinks(data)
      setActiveFilters(newFilters)
    } catch (err) {
      console.error('❌ Filter error:', err)
      setError(`Filter failed: ${err.message}`)
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

  // Ingredient search functions
  const handleIngredientInputChange = (e) => {
    const value = e.target.value
    setIngredientInput(value)
    
    if (value.trim()) {
      const filtered = availableIngredients
        .filter(ing => {
          const searchName = ing.displayName || ing.name
          const searchValue = value.toLowerCase()
          return (
            searchName.toLowerCase().includes(searchValue) &&
            !selectedIngredients.includes(ing.name)
          )
        })
        .slice(0, 10)
      setIngredientSuggestions(filtered)
    } else {
      setIngredientSuggestions([])
    }
  }

  const addIngredient = (ingredient) => {
    // Handle both direct name strings and ingredient objects
    const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name
    if (ingredientName && !selectedIngredients.includes(ingredientName)) {
      setSelectedIngredients([...selectedIngredients, ingredientName])
      setIngredientInput('')
      setIngredientSuggestions([])
    }
  }

  const removeIngredient = (ingredientName) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing !== ingredientName))
  }

  const searchByIngredients = async () => {
    if (selectedIngredients.length === 0) {
      setError('Please select at least one ingredient')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSelectedDrink(null)
      setSearchQuery('')
      setActiveFilters({ method: null, glass: null, garnish: null })
      
      const params = new URLSearchParams()
      selectedIngredients.forEach(ing => params.append('ingredients', ing))
      
      console.log('🔍 Searching drinks by ingredients:', selectedIngredients)
      const data = await api.get(`/api/drinks/by-ingredients?${params.toString()}`)
      console.log('✅ Ingredient search results:', data.length)
      setDrinks(data)
    } catch (err) {
      console.error('❌ Ingredient search failed:', err)
      setError(`Search failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearIngredientSearch = () => {
    setSelectedIngredients([])
    setIngredientInput('')
    setIngredientSuggestions([])
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
        <footer className="footer">
          <a href="https://zachriley.dev" target="_blank" rel="noopener noreferrer" className="footer-link">
            Zach Riley
          </a>
        </footer>
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
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('search')
              clearFilters()
              setSelectedDrink(null)
            }}
          >
            Search
          </button>
          <button
            className={`tab-button ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('ingredients')
              clearFilters()
              setSelectedDrink(null)
            }}
          >
            Search by Ingredients
          </button>
        </div>

        {activeTab === 'search' ? (
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
        ) : (
          <div className="ingredient-search-section">
            <div className="ingredient-input-wrapper">
              <input
                type="text"
                placeholder="Type ingredient name..."
                value={ingredientInput}
                onChange={handleIngredientInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (ingredientSuggestions.length > 0) {
                      addIngredient(ingredientSuggestions[0])
                    } else if (ingredientInput.trim()) {
                      addIngredient(ingredientInput.trim())
                    }
                  }
                }}
                className="ingredient-input"
              />
              {ingredientSuggestions.length > 0 && (
                <div className="ingredient-suggestions">
                  {ingredientSuggestions.map((ing) => (
                    <div
                      key={ing.ingredient_id || `subcat-${ing.name}`}
                      className={`ingredient-suggestion-item ${ing.type === 'subcategory' ? 'subcategory-item' : ''}`}
                      onClick={() => addIngredient(ing)}
                    >
                      {ing.displayName || ing.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedIngredients.length > 0 && (
              <div className="selected-ingredients">
                <div className="selected-ingredients-label">Selected ingredients:</div>
                <div className="selected-ingredients-list">
                  {selectedIngredients.map((ing) => {
                    // Find the ingredient object to get display name if it's a subcategory
                    const ingObj = availableIngredients.find(i => i.name === ing)
                    const displayName = ingObj?.displayName || ing
                    return (
                      <span key={ing} className="ingredient-tag">
                        {displayName}
                        <button
                          onClick={() => removeIngredient(ing)}
                          className="remove-ingredient-button"
                          title="Remove ingredient"
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="ingredient-search-actions">
              <button
                onClick={searchByIngredients}
                className="search-button"
                disabled={selectedIngredients.length === 0}
              >
                Search Drinks
              </button>
              <button
                onClick={clearIngredientSearch}
                className="clear-button"
              >
                Clear
              </button>
            </div>
          </div>
        )}

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
                          {getGlassIcon(drink.glass_type) && (
                            <img src={getGlassIcon(drink.glass_type)} alt={drink.glass_type} className="glass-icon" />
                          )}
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
                        {getGlassIcon(selectedDrink.glass_type) && (
                          <img src={getGlassIcon(selectedDrink.glass_type)} alt={selectedDrink.glass_type} className="glass-icon" />
                        )}
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
      <footer className="footer">
        <a href="https://zachriley.dev" target="_blank" rel="noopener noreferrer" className="footer-link">
          Zach Riley
        </a>
      </footer>
    </div>
  )
}

export default App

