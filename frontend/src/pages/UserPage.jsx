import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Импортируем хук useNavigate
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
  const [linkCopied, setLinkCopied] = useState(false);

  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const getCSRFToken = () => {
    const csrfCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
  };



  const authorizedRequest = async (config) => {
    try {
      const csrfToken = getCSRFToken();
      const headers = {
        ...config.headers,
        'X-CSRFToken': csrfToken,  // Добавляем CSRF-токен
      };

      const response = await axios({
        ...config,
        withCredentials: true,  // Передача куков
        headers,
      });
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("Необходима аутентификация. Перенаправляем на страницу входа...");
        navigate('/login');  // Перенаправление на страницу входа
      } else if (error.response?.status === 403) {
        console.log("Доступ запрещён. Проверьте CSRF или права доступа.");
      }
      throw error;
    }
  };

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

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      console.log("Выберите файл.");
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
      console.log("Файл успешно загружен!");
      setSelectedFile(null);
      setComment('');
    } catch (error) {
      setUploadStatus("error");
      console.error("Ошибка загрузки файла:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот файл?")) {
      try {
        await authorizedRequest({
          method: "DELETE",
          url: `http://localhost:8000/api/files/${fileId}/delete/`,
        });
        console.log("Файл успешно удалён.");
        fetchFiles();
      } catch (error) {
        console.error("Ошибка удаления файла:", error);
        console.log("Не удалось удалить файл.");
      }
    }
  };

  const handleUpdateComment = async (fileId) => {
    if (!newComment) {
      console.log("Комментарий не может быть пустым.");
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
      console.log("Комментарий обновлён.");
      setEditingFileId(null);
      setNewComment("");
    } catch (error) {
      console.error("Ошибка обновления комментария:", error);
      console.log("Не удалось обновить комментарий.");
    }
  };

  const handleViewFile = (fileUrl) => {
    const fullUrl = `http://localhost:8000${fileUrl}`;
    window.open(fullUrl, "_blank");
  };

  const handleRenameFile = async (fileId, oldFileName) => {
    const newFileName = prompt("Введите новое имя файла:", oldFileName);
    if (newFileName && newFileName !== oldFileName) {
      try {
        await authorizedRequest({
          method: "PUT",
          url: `http://localhost:8000/api/files/${fileId}/rename/`,
          data: { name: newFileName },
        });
        console.log("Имя файла обновлено.");
        fetchFiles();
      } catch (error) {
        console.error("Ошибка обновления имени файла:", error);
        console.log("Не удалось обновить имя файла.");
      }
    }
  };

  const handleDownloadFile = (fileUrl) => {
    const link = document.createElement("a");
    link.href = `http://localhost:8000${fileUrl}`;
    link.download = true;
    link.click();
  };

  const handleGenerateLink = async (fileId) => {
    try {
      const response = await authorizedRequest({
        method: "GET",
        url: `http://localhost:8000/api/files/${fileId}/link/`,
      });
      console.log("Server Response:", response.data);
      console.log("Generated file link:", response.data.link);
      if (response.data.link) {
        const fullUrl = `http://localhost:8000${response.data.link}`;
        navigator.clipboard.writeText(fullUrl)
          .then(() => {
            console.log("Ссылка скопирована в буфер обмена!");
            setLinkCopied(true);  // Устанавливаем состояние, что ссылка скопирована
            setTimeout(() => setLinkCopied(false), 3000);  // Сбрасываем состояние через 3 секунды
          })
          .catch((error) => {
            console.error("Ошибка при копировании ссылки:", error);
            console.log("Не удалось скопировать ссылку.");
          });
      } else {
        console.log("Ошибка: Не удалось получить ссылку.");
      }
    } catch (error) {
      console.error("Ошибка генерации ссылки:", error);
      console.log("Не удалось получить ссылку.");
    }
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
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

      {linkCopied && <p className="success-message">Ссылка успешно скопирована в буфер обмена!</p>}

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
                  <button onClick={() => handleGenerateLink(file.id)}>Скачать ссылку</button>
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