import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserPage.css';

function UserPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'success', 'error'

  useEffect(() => {
    // Загружаем список файлов пользователя при монтировании компонента
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/files/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Ошибка при получении файлов:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Выберите файл для загрузки.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('comment', comment);

    try {
      setUploadStatus('uploading');
      const response = await axios.post('/api/files/upload/', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('success');
      alert('Файл успешно загружен!');
      fetchFiles(); // Перезагружаем список файлов
    } catch (error) {
      setUploadStatus('error');
      console.error('Ошибка при загрузке файла:', error);
      alert('Не удалось загрузить файл.');
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      try {
        await axios.delete(`/api/files/${fileId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchFiles(); // Перезагружаем список файлов
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
        await axios.put(`/api/files/${fileId}/`, { comment: newComment }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchFiles(); // Перезагружаем список файлов
      } catch (error) {
        console.error('Ошибка при переименовании файла:', error);
        alert('Не удалось переименовать файл.');
      }
    }
  };

  const handleViewFile = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="user-page-container">
      <h2>Мои файлы</h2>

      {/* Форма загрузки файла */}
      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="file">Выберите файл:</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept="*/*"
            required
          />
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

      {/* Отображение статуса загрузки */}
      {uploadStatus === 'uploading' && <p>Загрузка файла...</p>}
      {uploadStatus === 'success' && <p className="success-message">Файл успешно загружен!</p>}
      {uploadStatus === 'error' && <p className="error-message">Ошибка при загрузке файла.</p>}

      {/* Список файлов */}
      <h3>Список файлов</h3>
      <div className="file-list">
        {files.length === 0 ? (
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
                  <td>{file.size} KB</td>
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
    </div>
  );
}

export default UserPage;