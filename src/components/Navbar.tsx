// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const Navbar: React.FC = () => {
  const { currentUser, users, setCurrentUser } = useUserContext();

  const handleSwitchUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedUser = users.find(user => user.id === selectedId) || null;
    setCurrentUser(selectedUser);
  };

  return (
    <nav className="navbar bg-base-100 shadow-lg px-4 py-2">
      <div className="flex-1">
        <span className="normal-case text-2xl font-bold">
          Hylove Demo
        </span>
        <Link to="/" className="btn btn-ghost normal-case">
          腦波分析
        </Link>
        <Link to="/files" className="btn btn-ghost normal-case">
          檔案管理
        </Link>
        <Link to="/users" className="btn btn-ghost normal-case">
          使用者管理
        </Link>
      </div>
      <div className="flex-none">
        {currentUser ? (
          <div className="form-control">
            <select
              className="select select-bordered"
              value={currentUser.id}
              onChange={handleSwitchUser}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-sm">尚未設定使用者</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;