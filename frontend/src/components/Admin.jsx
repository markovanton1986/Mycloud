import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/users/")
      .then(response => setUsers(response.data))
      .catch(err => setError(err.message));
  }, []);

  const toggleAdminStatus = (userId, isAdmin) => {
    axios.patch(`/api/admin/users/${userId}/`, { is_admin: !isAdmin })
      .then(() => {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, is_admin: !isAdmin } : user
        ));
      })
      .catch(err => setError(err.message));
  };

  const deleteUser = (userId) => {
    axios.delete(`/api/admin/users/${userId}/`)
      .then(() => {
        setUsers(users.filter(user => user.id !== userId));
      })
      .catch(err => setError(err.message));
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Администратор</h1>
      <table>
        <thead>
          <tr>
            <th>Имя пользователя</th>
            <th>Полное имя</th>
            <th>Электронный адрес</th>
            <th>Администратор</th>
            <th>Файл</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.is_admin ? "Да" : "Нет"}</td>
              <td>
                {user.file_storage.file_count} files ({user.file_storage.total_size})
                <a href={user.file_storage.link}>Управлять</a>
              </td>
              <td>
                <button onClick={() => toggleAdminStatus(user.id, user.is_admin)}>
                  {user.is_admin ? "Отозвать администратора" : "Сделать администратором"}
                </button>
                <button onClick={() => deleteUser(user.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;