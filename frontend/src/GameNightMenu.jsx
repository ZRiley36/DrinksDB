import { useState, useEffect } from 'react'
import './GameNightMenu.css'
import { api } from './api'

function GameNightMenu() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedDrink, setExpandedDrink] = useState(null)
  const [drinkDetails, setDrinkDetails] = useState({})

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📋 Fetching game night menu...')
      const data = await api.get('/api/game-night-menu')
      console.log('✅ Received menu items:', data.length)
      setMenuItems(data)
    } catch (err) {
      console.error('❌ Error fetching menu:', err)
      setError(`Failed to load menu: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrinkDetails = async (drinkId, drinkName) => {
    try {
      console.log('🍹 Fetching drink details for menu:', drinkName)
      const data = await api.get(`/api/drinks/${encodeURIComponent(drinkName)}`)
      console.log('✅ Received drink details:', drinkName)
      // Store details using drink_id if available, otherwise use drink name as key
      const key = drinkId || drinkName.toLowerCase()
      setDrinkDetails(prev => ({ ...prev, [key]: data }))
      return data
    } catch (err) {
      console.error('❌ Error fetching drink details:', err)
      console.log(`Drink "${drinkName}" not found in database or network error`)
      return null
    }
  }

  const handleDrinkClick = async (item) => {
    if (expandedDrink === item.menu_id) {
      // Collapse if already expanded
      setExpandedDrink(null)
    } else {
      // Expand and fetch details if needed
      setExpandedDrink(item.menu_id)
      const detailsKey = item.drink_id || item.drink_name.toLowerCase()
      const hasDetails = drinkDetails[detailsKey]
      if (!hasDetails) {
        await fetchDrinkDetails(item.drink_id, item.drink_name)
      }
    }
  }

  return (
    <div className="game-night-menu">
      <header className="menu-header">
        <h1>Game Night Menu</h1>
        <p className="menu-subtitle">Cocktails ($5)</p>
      </header>

      <div className="menu-container">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Loading menu...</div>
        ) : (
          <div className="menu-items">
            {menuItems.map((item) => {
              const isExpanded = expandedDrink === item.menu_id
              // Get details - use drink_id if available, otherwise use drink name as key
              const detailsKey = item.drink_id || item.drink_name.toLowerCase()
              const details = drinkDetails[detailsKey] || null
              
              return (
                <div key={item.menu_id} className={`menu-item ${isExpanded ? 'expanded' : ''}`}>
                  <div 
                    className="menu-item-header" 
                    onClick={() => handleDrinkClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3 className="menu-item-name">{item.drink_name}</h3>
                    <span className="menu-item-price">{item.price || '$5'}</span>
                    <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                  </div>
                  {item.description && (
                    <p className="menu-item-description">{item.description}</p>
                  )}
                  {isExpanded && details && (
                    <div className="menu-item-details">
                      <div className="details-section">
                        {details.glass_type && (
                          <div className="detail-row">
                            <strong>Glass:</strong> {details.glass_type}
                          </div>
                        )}
                        {details.build_method && (
                          <div className="detail-row">
                            <strong>Method:</strong> {details.build_method}
                          </div>
                        )}
                        {details.garnish && (
                          <div className="detail-row">
                            <strong>Garnish:</strong> {details.garnish}
                          </div>
                        )}
                      </div>
                      {details.ingredients && details.ingredients.length > 0 && (
                        <div className="ingredients-section">
                          <h4>Ingredients</h4>
                          <ul className="ingredients-list">
                            {details.ingredients.map((ing, idx) => (
                              <li key={idx} className="ingredient-item">
                                <span className="ingredient-amount">
                                  {ing.amount} {ing.unit}
                                </span>
                                <span className="ingredient-name">{ing.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {isExpanded && !details && (
                    <div className="menu-item-details">
                      <div className="loading-details">Loading details...</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameNightMenu

