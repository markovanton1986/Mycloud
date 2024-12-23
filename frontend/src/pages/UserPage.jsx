import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserPage.css';

function UserPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingFileId, setEditingFileId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isVisible: false, fileId: null });

  // Показ уведомления
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Получение токена из cookies
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split('; ');
    const accessToken = cookies.find(cookie => cookie.startsWith('access_token='));
    return accessToken ? accessToken.split('=')[1] : null;
  };

  // Обновление токена
  const refreshAccessToken = async () => {
    const refreshToken = getTokenFromCookies();
    if (!refreshToken) {
      console.error("Refresh token отсутствует");
      return null;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: refreshToken
      }, { withCredentials: true });

      const newAccessToken = response.data.access;
      document.cookie = `access_token=${newAccessToken};path=/;`;
      return newAccessToken;
    } catch (error) {
      console.error("Ошибка обновления токена:", error);
      return null;
    }
  };

  // Обёртка для защищённых запросов
  const authorizedRequest = async (config) => {
    const token = getTokenFromCookies();
    if (!token) {
      console.error("Токен отсутствует. Перенаправление на страницу входа...");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return axios({
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
            withCredentials: true,
          });
        }
      }
      throw error;
    }
  };

  // Получение списка файлов
  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await authorizedRequest({
        method: "GET",
        url: "http://localhost:8000/api/files/",
      });
      setFiles(response.data.files || []);
    } catch (error) {
      console.error("Ошибка получения файлов:", error);
      showNotification("Ошибка загрузки списка файлов.", "error");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [uploadStatus]);

  // Обработчик загрузки файлов
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      showNotification("Выберите файл для загрузки.", "error");
      return;
    }

    setIsLoading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("comment", comment);

      await authorizedRequest({
        method: "POST",
        url: "http://localhost:8000/api/files/upload/",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadStatus("success");
      showNotification("Файл успешно загружен!", "success");
      setSelectedFile(null);
      setComment('');
    } catch (error) {
      setUploadStatus("error");
      console.error("Ошибка загрузки файла:", error);
      showNotification("Ошибка загрузки файла.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление файла
  const handleDelete = async () => {
    if (!confirmDelete.fileId) return;

    try {
      await authorizedRequest({
        method: "DELETE",
        url: `http://localhost:8000/api/files/${confirmDelete.fileId}/delete/`,
      });
      showNotification("Файл успешно удалён.", "success");
      fetchFiles();
    } catch (error) {
      console.error("Ошибка удаления файла:", error);
      showNotification("Не удалось удалить файл.", "error");
    } finally {
      setConfirmDelete({ isVisible: false, fileId: null });
    }
  };

  // Обновление комментария
  const handleUpdateComment = async (fileId) => {
    if (!newComment) {
      showNotification("Комментарий не может быть пустым.", "error");
      return;
    }

    const updatedFiles = files.map((file) =>
      file.id === fileId ? { ...file, comment: newComment } : file
    );
    setFiles(updatedFiles);

    try {
      await authorizedRequest({
        method: "PATCH",
        url: `http://localhost:8000/api/files/${fileId}/comment/`,
        data: { comment: newComment },
      });
      showNotification("Комментарий обновлён.", "success");
      setEditingFileId(null);
      setNewComment("");
    } catch (error) {
      console.error("Ошибка обновления комментария:", error);
      showNotification("Не удалось обновить комментарий.", "error");
    }
  };

  // Формат размера файла
  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="user-page-container">
      <h2>Мои файлы</h2>

      {/* Уведомления */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label>Выберите файл:</label>
          <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} required />
        </div>
        <div className="form-group">
          <label>Комментарий:</label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Введите комментарий"
          />
        </div>
        <button type="submit" disabled={isLoading} className="upload-button">
          {isLoading ? "Загрузка..." : "Загрузить"}
        </button>
      </form>

      {uploadStatus === "success" && <p className="success-message">Файл успешно загружен!</p>}
      {uploadStatus === "error" && <p className="error-message">Ошибка загрузки файла.</p>}

      <h3>Список файлов</h3>
      {loadingFiles ? (
        <p>Загрузка...</p>
      ) : files.length === 0 ? (
        <p>Нет загруженных файлов.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Имя файла</th>
              <th>Комментарий</th>
              <th>Размер</th>
              <th>Дата загрузки</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td>{file.name}</td>
                <td>
                  {editingFileId === file.id ? (
                    <div>
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button onClick={() => handleUpdateComment(file.id)}>Сохранить</button>
                    </div>
                  ) : (
                    file.comment
                  )}
                </td>
                <td>{formatFileSize(file.size)}</td>
                <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => setConfirmDelete({ isVisible: true, fileId: file.id })}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Модальное окно подтверждения */}
      {confirmDelete.isVisible && (
        <div className="modal">
          <div className="modal-content">
            <p>Вы уверены, что хотите удалить файл?</p>
            <button onClick={handleDelete}>Да</button>
            <button onClick={() => setConfirmDelete({ isVisible: false, fileId: null })}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPage;