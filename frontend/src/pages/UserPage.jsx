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
  const [editingFileId, setEditingFileId] = useState(null); // ID файла, комментарий которого редактируется
  const [newComment, setNewComment] = useState(''); // Новый комментарий для редактирования

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
      alert("Выберите файл.");
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
      alert("Файл успешно загружен!");
      setSelectedFile(null);
      setComment('');
    } catch (error) {
      setUploadStatus("error");
      console.error("Ошибка загрузки файла:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление файла
  const handleDelete = async (fileId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот файл?")) {
      try {
        await axios.delete(`http://localhost:8000/api/files/${fileId}/delete/`, {
          headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
          },
        });
        alert("Файл успешно удалён.");
        fetchFiles(); // Обновление списка файлов
      } catch (error) {
        console.error("Ошибка удаления файла:", error);
        alert("Не удалось удалить файл.");
      }
    }
  };

  // Обновление комментария
  const handleUpdateComment = async (fileId) => {
    if (!newComment) {
      alert("Комментарий не может быть пустым.");
      return;
    }
  
    const updatedFiles = files.map((file) =>
      file.id === fileId ? { ...file, comment: newComment } : file
    );
    setFiles(updatedFiles); // Немедленно обновите локальное состояние
  
    try {
      await authorizedRequest({
        method: "PATCH",
        url: `http://localhost:8000/api/files/${fileId}/comment/`,
        data: { comment: newComment },
      });
      alert("Комментарий обновлён.");
      setEditingFileId(null);
      setNewComment("");
    } catch (error) {
      console.error("Ошибка обновления комментария:", error);
      alert("Не удалось обновить комментарий.");
    }
  };

  // Просмотр файла
  const handleViewFile = (fileUrl) => {
    const fullUrl = `http://localhost:8000${fileUrl}`; // формируем полный URL
    window.open(fullUrl, "_blank"); // открываем файл в новой вкладке
  };

  // Переименование файла
  const handleRenameFile = async (fileId, oldFileName) => {
    const newFileName = prompt("Введите новое имя файла:", oldFileName);
    if (newFileName && newFileName !== oldFileName) {
      try {
        await authorizedRequest({
          method: "PUT",
          url: `http://localhost:8000/api/files/${fileId}/rename/`,
          data: { name: newFileName },
        });
        alert("Имя файла обновлено.");
        fetchFiles(); // Обновление списка файлов после переименования
      } catch (error) {
        console.error("Ошибка обновления имени файла:", error);
        alert("Не удалось обновить имя файла.");
      }
    }
  };

  // Скачивание файла
  const handleDownloadFile = (fileUrl) => {
    const link = document.createElement("a");
    link.href = `http://localhost:8000${fileUrl}`;  // Преобразуем относительный URL в полный
    link.download = true;
    link.click();
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCopyLink = (fileUrl) => {
    navigator.clipboard.writeText(fileUrl)
      .then(() => {
        alert("Ссылка скопирована в буфер обмена!");
      })
      .catch((error) => {
        console.error("Ошибка при копировании ссылки:", error);
        alert("Не удалось скопировать ссылку.");
      });
  };

  return (
    <div className="user-page-container">
      <h2>Мои файлы</h2>

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
                      <button onClick={() => handleUpdateComment(file.id)}>Сохранить комментарий</button>
                    </div>
                  ) : (
                    file.comment
                  )}
                </td>
                <td>{formatFileSize(file.size)}</td>
                <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleViewFile(file.file)}>Просмотр</button>
                  <button onClick={() => handleRenameFile(file.id, file.name)}>Переименовать файл</button>
                  <button onClick={() => setEditingFileId(file.id)}>Редактировать комментарий</button>
                  <button onClick={() => handleDownloadFile(file.file)}>Скачать</button>
                  <button onClick={() => handleDelete(file.id)}>Удалить</button>
                  <button onClick={() => handleCopyLink(file.public_link)}>Копировать ссылку</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserPage;