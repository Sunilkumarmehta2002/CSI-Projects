import React, { useState, useEffect } from 'react';

const TodoList = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return alert('Task cannot be empty');
    setTasks([...tasks, { id: Date.now(), text: input.trim(), completed: false }]);
    setInput('');
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task =>
    filter === 'all' ? true : filter === 'completed' ? task.completed : !task.completed
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortAsc) return a.text.localeCompare(b.text);
    else return b.text.localeCompare(a.text);
  });

  return (
    <div className="todo-container">
      <h2>📝 To-Do List</h2>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && addTask()}
        placeholder="Enter a new task..."
      />
      <button onClick={addTask}>Add</button>

      <div>
        <br></br>
        <label>Filter:</label>
        <select onChange={e => setFilter(e.target.value)} value={filter}>
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>

        <button onClick={() => setSortAsc(!sortAsc)}>
          Sort {sortAsc ? '🔼 A-Z' : '🔽 Z-A'}
        </button>
      </div>

      <ul>
        {sortedTasks.map(task => (
          <li key={task.id} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id)} />
            {task.text}
            <button onClick={() => removeTask(task.id)}>❌ delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
