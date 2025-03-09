// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const Navbar: React.FC = () => {
  const { users, currentUser, setCurrentUser } = useUserContext();

  const handleSwitchUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedUser = users.find(user => user.id === selectedId) || null;
    setCurrentUser(selectedUser);
  };

  return (
    <nav style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
      <Link to="/">腦波分析</Link> |{' '}
      <Link to="/files">檔案管理</Link> |{' '}
      <Link to="/users">使用者管理</Link> |{' '}
      <span>
        {currentUser ? (
          <>
            當前使用者: {currentUser.name}{' '}
            <select value={currentUser.id} onChange={handleSwitchUser}>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          "尚未選擇使用者"
        )}
      </span>
    </nav>
  );
};

export default Navbar;