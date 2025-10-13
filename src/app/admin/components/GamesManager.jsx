// components/GamesManager.js
'use client'

import { useState, useEffect } from 'react'
import { getImageUrl } from '../lib/supabase'

export default function GamesManager() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingGame, setEditingGame] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    category: '',
    duration: '',
    rules: '',
    requirements: '{}'
  })

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/games')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }
      
      const data = await response.json()
      setGames(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching games:', error)
      setError(`Failed to fetch games: ${error.message}`)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submitFormData = new FormData()
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        submitFormData.append(key, formData[key])
      })
      
      // Append image if selected
      if (imageFile) {
        submitFormData.append('image', imageFile)
      }

      // Append current image path for updates
      if (editingGame?.image_path) {
        submitFormData.append('currentImagePath', editingGame.image_path)
      }
      
      const url = editingGame ? `/api/games/${editingGame.id}` : '/api/games'
      const method = editingGame ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        body: submitFormData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save game')
      }
      
      await fetchGames()
      resetForm()
      alert(editingGame ? 'Game updated successfully!' : 'Game created successfully!')
    } catch (error) {
      console.error('Error saving game:', error)
      alert(`Error saving game: ${error.message}`)
    }
  }

  const handleEdit = (game) => {
    setEditingGame(game)
    setFormData({
      slug: game.slug,
      title: game.title,
      description: game.description || '',
      category: game.category || '',
      duration: game.duration || '',
      rules: game.rules || '',
      requirements: JSON.stringify(game.requirements || {})
    })
    
    // Set current image preview
    if (game.image_path) {
      setImagePreview(getImageUrl(game.image_path))
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this game?')) {
      try {
        const response = await fetch(`/api/games/${id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete game')
        }
        
        await fetchGames()
        alert('Game deleted successfully!')
      } catch (error) {
        console.error('Error deleting game:', error)
        alert(`Error deleting game: ${error.message}`)
      }
    }
  }

  const resetForm = () => {
    setEditingGame(null)
    setImageFile(null)
    setImagePreview(null)
    setFormData({
      slug: '',
      title: '',
      description: '',
      category: '',
      duration: '',
      rules: '',
      requirements: '{}'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading games...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={fetchGames}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Games Management</h1>
      
      {/* Create/Edit Game Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingGame ? 'Edit Game' : 'Create New Game'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Game Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Game preview" 
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Rules</label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({...formData, rules: e.target.value})}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingGame ? 'Update Game' : 'Create Game'}
            </button>
            
            {editingGame && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Games List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Existing Games ({games.length})</h2>
        </div>
        
        {games.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No games found. Create your first game above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {games.map((game) => (
                  <tr key={game.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {game.image_path ? (
                        <img 
                          src={getImageUrl(game.image_path)} 
                          alt={game.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{game.title}</div>
                      <div className="text-sm text-gray-500">{game.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(game)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
