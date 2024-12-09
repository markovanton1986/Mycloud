import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './UserPage.css';

function UserPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Функция для получения токена из cookies
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split('; ');
    const accessToken = cookies.find(cookie => cookie.startsWith('access_token='));
    const refreshToken = cookies.find(cookie => cookie.startsWith('refresh_token='));
    
    // Для дебага
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    
    return accessToken ? accessToken.split('=')[1] : null;
  };

  // Функция для обновления токена
  const refreshAccessToken = async () => {
    const refreshToken = getTokenFromCookies();
    if (!refreshToken) {
      console.error('Refresh token не найден');
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
      console.error('Ошибка при обновлении токена:', error);
      return null;
    }
  };

  // Запрос на получение файлов
  useEffect(() => {
    const fetchFiles = async () => {
      const token = getTokenFromCookies();
      if (!token) {
        console.error('Токен не найден');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/files/', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log('Received files:', response.data);
        setFiles(response.data.files || []);
      } catch (error) {
        console.error('Ошибка при получении файлов:', error);
      }
    };

    fetchFiles();
  }, []);

  // Загрузка файлов
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Выберите файл для загрузки.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('comment', comment);
  
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
  
    try {
      setUploadStatus('uploading');
      await axios.post('http://localhost:8000/api/files/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
      });
      setUploadStatus('success');
      alert('Файл успешно загружен!');
      fetchFiles();
    } catch (error) {
      setUploadStatus('error');
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      try {
        const token = getTokenFromCookies();
        await axios.delete(`http://localhost:8000/api/files/${fileId}/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        alert('Файл успешно удалён.');
        fetchFiles();
      } catch (error) {
        console.error('Ошибка при удалении файла:', error);
        alert('Не удалось удалить файл.');
      }
    }
  };

  const handleRename = async (fileId, newName) => {
    const newComment = prompt('Введите новый комментарий:', newName);
    if (newComment && newComment !== newName) {
      try {
        const token = getTokenFromCookies();
        await axios.put(`http://localhost:8000/api/files/${fileId}/`, { comment: newComment }, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        alert('Комментарий успешно обновлён.');
        fetchFiles();
      } catch (error) {
        console.error('Ошибка при обновлении комментария:', error);
        alert('Не удалось обновить комментарий.');
      }
    }
  };

  const handleViewFile = (fileUrl) => window.open(fileUrl, '_blank');

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
          <label htmlFor="file">Выберите файл:</label>
          <input type="file" id="file" onChange={(e) => setSelectedFile(e.target.files[0])} required />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Комментарий:</label>
          <input
            type="text"
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Введите комментарий к файлу"
          />
        </div>
        <button type="submit" className="upload-button">Загрузить</button>
      </form>

      {uploadStatus === 'uploading' && <p>Загрузка файла...</p>}
      {uploadStatus === 'success' && <p className="success-message">Файл успешно загружен!</p>}
      {uploadStatus === 'error' && <p className="error-message">Ошибка при загрузке файла.</p>}

      <h3>Список файлов</h3>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : files.length === 0 ? (
        <p>У вас нет загруженных файлов.</p>
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
                <td>{file.comment}</td>
                <td>{formatFileSize(file.size)}</td>
                <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleViewFile(file.url)}>Просмотр</button>
                  <button onClick={() => handleRename(file.id, file.comment)}>Переименовать</button>
                  <button onClick={() => handleDelete(file.id)}>Удалить</button>
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