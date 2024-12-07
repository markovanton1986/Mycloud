import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserPage.css';

function UserPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState(''); 
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error('Refresh token не найден');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: refreshToken
      });
      const newAccessToken = response.data.access;
      localStorage.setItem('token', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не найден');
      return;
    }
    fetchFiles(token);
  }, []);

  const fetchFiles = async (token) => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/files/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Received files:', response.data);
      if (response.data && Array.isArray(response.data.files)) {
        setFiles(response.data.files);
      } else {
        console.error('Файлы не найдены или структура данных неверна');
      }
    } catch (error) {
      console.error('Ошибка при получении файлов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  
  const handleCommentChange = (e) => setComment(e.target.value);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Выберите файл для загрузки.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('comment', comment);

    const token = localStorage.getItem('token');

    try {
      setUploadStatus('uploading');
      await axios.post('http://localhost:8000/api/files/upload/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('success');
      alert('Файл успешно загружен!');
      fetchFiles(token); 
    } catch (error) {
      setUploadStatus('error');
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:8000/api/files/${fileId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Файл успешно удалён.');
        fetchFiles(token); 
      } catch (error) {
        console.error('Ошибка при удалении файла:', error);
        alert('Не удалось удалить файл.');
      }
    }
  };

  const handleRename = async (fileId, newName) => {
    const newComment = prompt('Введите новый комментарий:', newName);
    if (newComment && newComment !== newName) {
      const token = localStorage.getItem('token');
      try {
        await axios.put(`http://localhost:8000/api/files/${fileId}/`, { comment: newComment }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Комментарий успешно обновлён.');
        fetchFiles(token);
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

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className="user-page-container">
      <h2>Мои файлы</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="file">Выберите файл:</label>
          <input type="file" id="file" onChange={handleFileChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Комментарий:</label>
          <input
            type="text"
            id="comment"
            value={comment}
            onChange={handleCommentChange}
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
                <td>{formatDate(file.uploaded_at)}</td>
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