import { useState, useEffect } from 'react'
import './DrinksWithRishaMenu.css'
import { api } from './api'
import { getGlassIcon } from './glassIcons'

function DrinksWithRishaMenu() {
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
      console.log('📋 Fetching Drinks with Risha menu...')
      const data = await api.get('/api/drinks-with-risha-menu')
      console.log('✅ Received menu items:', data.length)
      setMenuItems(data)
    } catch (err) {
      console.error('❌ Error fetching menu:', err)
      const extra = [err.details, err.hint].filter(Boolean).join(' — ')
      setError(extra ? `${err.message} — ${extra}` : `Failed to load menu: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrinkDetails = async (menuId, dbDrinkName, drinkName) => {
    const lookupName = dbDrinkName || drinkName
    if (!lookupName) return null
    try {
      console.log('🍹 Fetching drink details for menu:', lookupName)
      const data = await api.get(`/api/drinks/${encodeURIComponent(lookupName)}`)
      console.log('✅ Received drink details:', lookupName)
      setDrinkDetails(prev => ({ ...prev, [menuId]: data }))
      return data
    } catch (err) {
      console.error('❌ Error fetching drink details:', err)
      return null
    }
  }

  const handleDrinkClick = async (item) => {
    if (expandedDrink === item.menu_id) {
      setExpandedDrink(null)
    } else {
      setExpandedDrink(item.menu_id)
      const hasDetails = drinkDetails[item.menu_id]
      if (!hasDetails) {
        await fetchDrinkDetails(item.menu_id, item.db_drink_name, item.drink_name)
      }
    }
  }

  return (
    <div className="drinks-with-risha-menu">
      <header className="menu-header">
        <h1>Drinks with Risha</h1>
        <p className="menu-subtitle">I cooked</p>
        <p className="menu-address">
          <a href="https://www.google.com/maps/search/?api=1&query=181+Bedford+Ave,+Brooklyn,+NY+11211" target="_blank" rel="noopener noreferrer">181 Bedford Ave, Brooklyn 11211, Apt 2</a>
          <span className="menu-see-you">— See you there at 8.</span>
        </p>
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
              const details = drinkDetails[item.menu_id] || null

              return (
                <div key={item.menu_id} className={`menu-item ${isExpanded ? 'expanded' : ''}`}>
                  <div
                    className="menu-item-header"
                    onClick={() => handleDrinkClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3 className="menu-item-name">{item.drink_name}</h3>
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
                            <strong>Glass:</strong>{' '}
                            {getGlassIcon(details.glass_type) && (
                              <img src={getGlassIcon(details.glass_type)} alt={details.glass_type} className="glass-icon" />
                            )}
                            {details.glass_type}
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
                  {isExpanded && !details && item.drink_id && (
                    <div className="menu-item-details">
                      <div className="loading-details">Loading details...</div>
                    </div>
                  )}
                  {isExpanded && !details && !item.drink_id && (
                    <div className="menu-item-details">
                      <div className="loading-details">Recipe not in database yet.</div>
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

export default DrinksWithRishaMenu
