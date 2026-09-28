import { useState, useEffect, useMemo } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')

  const [todos, setTodos] = useState(() => {
      try {
        const savedTodos = localStorage.getItem('todos')
        return savedTodos ? JSON.parse(savedTodos) : []
      } catch {
        return []
      }
    }
  )
  
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])
  
  // Issue 5: Function yang tidak di-memoize, re-create setiap render
  const addTodo = () => {
    if (input.trim() === '') {
      alert('Please enter a todo')
      return
    }
    
    const newTodo = {
      id: crypto.randomUUID(),
      text: input,
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setTodos([...todos, newTodo])
    setInput('')
  }
  
  const deleteTodo = (id) => {
    if (id === undefined || id === null) {
      alert('Todo ID tidak valid')
      return
    }

    const todoExists = todos.some((todo) => todo.id === id)

    if (!todoExists) {
      alert(`Todo dengan ID ${id} tidak ditemukan`)
      return
    }

    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id)
    )
  }
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }
  
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': 
        return todos.filter(todo => !todo.completed)

      case 'completed':
        return todos.filter(todo => todo.completed)
      
      default:
        return todos
    }
  }, [todos, filter])
  
  const stats = useMemo(() => {
    const completed = todos.reduce(
      (total, todo) => total + (todo.completed ? 1 : 0),
      0
    )

    return {
      total: todos.length,
      completed,
      active: todos.length - completed,
    }
  }, [todos])
  
  // Issue 10: Inline event handler dengan arrow function (re-create setiap render)
  return (
    <div className="app">
      <h1>My Todo List</h1>
      
      <div className="input-section">
        <label htmlFor="todo-input">Todo baru</label>

        <input 
          id="todo-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addTodo()
            }
          }}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      {/* Issue 12: Inline styles (inconsistent dengan CSS file) */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setFilter('all')}
          style={{ background: filter === 'all' ? '#28a745' : '#007bff' }}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('active')}
          style={{ background: filter === 'active' ? '#28a745' : '#007bff' }}
        >
          Active
        </button>
        <button 
          onClick={() => setFilter('completed')}
          style={{ background: filter === 'completed' ? '#28a745' : '#007bff' }}
        >
          Completed
        </button>
      </div>
      
      <div className="todo-list">
        {/* Issue 13: Tidak ada handling untuk empty state */}
        {filteredTodos.map((todo) => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input 
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button 
              className="delete-btn"
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      
      <div className="stats">
        <p>Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}</p>
      </div>
    </div>
  )
}

export default App
