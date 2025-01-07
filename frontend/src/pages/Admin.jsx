import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Admin.css";


const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullname: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isVisible: false, userId: null });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getCSRFToken = () => {
    const name = "csrftoken";
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
  };

  const authorizedRequest = async (config) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios({
        ...config,
        headers: {
          ...config.headers,
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      });
      return response;
    } catch (error) {
      console.error("Ошибка запроса:", error);
      throw error;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, password, email, fullname } = formData;

    if (!username || !password || !email || !fullname) {
      setError("Все поля обязательны для заполнения!");
      return;
    }

    setLoading(true);
    try {
      await authorizedRequest({
        method: "POST",
        url: "http://localhost:8000/api/register/",
        data: { username, password, email, fullname },
      });
      showNotification("Пользователь успешно зарегистрирован!");
      setFormData({ username: "", password: "", email: "", fullname: "" });
      fetchUsers();
    } catch (err) {
      setError("Ошибка при регистрации пользователя");
      console.error("Ошибка регистрации:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authorizedRequest({
        method: "GET",
        url: "http://localhost:8000/api/admin/users/",
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error("Ошибка получения пользователей:", error);
      setError("Ошибка при загрузке пользователей");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete.userId) return;

    try {
      await authorizedRequest({
        method: "DELETE",
        url: `http://localhost:8000/api/admin/users/${confirmDelete.userId}/delete/`,
      });
      setUsers(users.filter((user) => user.id !== confirmDelete.userId));
      showNotification("Пользователь успешно удалён.");
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      showNotification("Ошибка при удалении пользователя.", "error");
    } finally {
      setConfirmDelete({ isVisible: false, userId: null });
    }
  };

  const toggleStaffStatus = async (userId, isStaff) => {
    try {
      await authorizedRequest({
        method: "PATCH",
        url: `http://localhost:8000/api/admin/users/${userId}/update-status/`,
        data: { is_staff: !isStaff },
      });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_staff: !isStaff } : user
        )
      );
      showNotification("Статус сотрудника обновлён.");
    } catch (error) {
      console.error("Ошибка изменения статуса сотрудника:", error);
      showNotification("Ошибка при обновлении статуса.", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      <h2>Управление пользователями</h2>
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <h3>Регистрация нового пользователя</h3>
      <form onSubmit={handleRegister}>
        <div>
          <label>Имя пользователя:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>
        <div>
          <label>Полное имя:</label>
          <input
            type="text"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрировать"}
        </button>
      </form>

      <h3>Список пользователей</h3>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Имя пользователя</th>
              <th>Полное имя</th>
              <th>Email</th>
              <th>Администратор</th>
              <th>Файлы</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.fullname}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    onClick={() => toggleStaffStatus(user.id, user.is_staff)}
                  >
                    {user.is_staff ? "Снять" : "Назначить"}
                  </button>
                </td>
                <td>
                  <span>{user.file_count} файл(а)</span>, <span>{user.total_size} КB</span>
                  <br />
                  <button onClick={() => navigate(`/files/${user.id}`)}>
                    Управление файлами
                  </button>
                </td>
                <td>
                  <button onClick={() => setConfirmDelete({ isVisible: true, userId: user.id })}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {confirmDelete.isVisible && (
        <div className="modal">
          <div className="modal-content">
            <p>Вы уверены, что хотите удалить этого пользователя?</p>
            <button onClick={handleDeleteUser}>Да</button>
            <button onClick={() => setConfirmDelete({ isVisible: false, userId: null })}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;