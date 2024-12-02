import React, { useState } from 'react';
import axios from 'axios';
import './LoadingFile.css'; 

function LoadingFile() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [comment, setComment] = useState('');
    const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'success', 'error'

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
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadStatus('success');
            alert('Файл успешно загружен!');
        } catch (error) {
            setUploadStatus('error');
            console.error('Ошибка при загрузке файла:', error);
            alert('Не удалось загрузить файл.');
        }
    };

    return (
        <div className="file-upload-container">
            <h2>Загрузить новый файл</h2>
            <form onSubmit={handleUpload} className="file-upload-form">
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
                <button type="submit" className="upload-button">
                    Загрузить
                </button>
            </form>
            {uploadStatus === 'uploading' && <p>Загрузка файла...</p>}
            {uploadStatus === 'success' && <p className="success-message">Файл успешно загружен!</p>}
            {uploadStatus === 'error' && <p className="error-message">Ошибка при загрузке файла.</p>}
        </div>
    );
}

export default LoadingFile;