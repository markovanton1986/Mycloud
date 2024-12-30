import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FileStorage.css';

const getCSRFToken = () => {
    const csrfCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
};

function FileStorage() {
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

    const authorizedRequest = async (config) => {
        try {
            const csrfToken = getCSRFToken();
            const headers = {
                ...config.headers,
                'X-CSRFToken': csrfToken,
            };

            const response = await axios({
                ...config,
                withCredentials: true,
                headers,
            });

            if (response.status === 304) {
                console.log('Ресурс не изменился, используется кэшированный ответ');
                return response;
            }

            return response;
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('Необходима аутентификация. Перенаправляем на страницу входа...');
                navigate('/login');
            } else if (error.response?.status === 403) {
                console.log('Доступ запрещён. Проверьте CSRF или права доступа.');
            }
            throw error;
        }
    };

    const fetchFiles = async () => {
        setLoadingFiles(true);
        try {
            const response = await authorizedRequest({
                method: 'GET',
                url: "http://localhost:8000/api/files/",
            });
            setFiles(response.data.files || []);
        } catch (error) {
            console.error('Ошибка получения файлов:', error);
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
            console.log('Выберите файл.');
            return;
        }

        setIsLoading(true);
        setUploadStatus(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('comment', comment);

            await authorizedRequest({
                method: 'POST',
                url: '/api/files/upload/',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setUploadStatus('success');
            console.log('Файл успешно загружен!');
            setSelectedFile(null);
            setComment('');
        } catch (error) {
            setUploadStatus('error');
            console.error('Ошибка загрузки файла:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (fileId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
            try {
                await authorizedRequest({
                    method: 'DELETE',
                    url: `/api/files/${fileId}/delete/`,
                });
                console.log('Файл успешно удалён.');
                fetchFiles();
            } catch (error) {
                console.error('Ошибка удаления файла:', error);
            }
        }
    };

    const handleUpdateComment = async (fileId) => {
        if (!newComment) {
            console.log('Комментарий не может быть пустым.');
            return;
        }

        const updatedFiles = files.map((file) =>
            file.id === fileId ? { ...file, comment: newComment } : file
        );
        setFiles(updatedFiles);

        try {
            await authorizedRequest({
                method: 'PATCH',
                url: `/api/files/${fileId}/comment/`,
                data: { comment: newComment },
            });
            console.log('Комментарий обновлён.');
            setEditingFileId(null);
            setNewComment('');
        } catch (error) {
            console.error('Ошибка обновления комментария:', error);
        }
    };

    const handleGenerateLink = async (fileId) => {
        try {
            const response = await authorizedRequest({
                method: 'GET',
                url: `/api/files/${fileId}/link/`,
            });
            const fullUrl = response.data.link;
            navigator.clipboard.writeText(fullUrl)
                .then(() => {
                    console.log('Ссылка скопирована в буфер обмена!');
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 3000);
                })
                .catch((error) => console.error('Ошибка копирования ссылки:', error));
        } catch (error) {
            console.error('Ошибка генерации ссылки:', error);
        }
    };

    const handleDownloadFile = (fileUrl) => {
        const link = document.createElement('a');
        link.href = `http://localhost:8000${fileUrl}`;
        link.download = true;
        link.click();
    };

    const formatFileSize = (size) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="file-storage-container">
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
                    {isLoading ? 'Загрузка...' : 'Загрузить'}
                </button>
            </form>

            {uploadStatus === 'success' && <p className="success-message">Файл успешно загружен!</p>}
            {uploadStatus === 'error' && <p className="error-message">Ошибка загрузки файла.</p>}

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
                                            <button onClick={() => handleUpdateComment(file.id)}>Сохранить</button>
                                        </div>
                                    ) : (
                                        file.comment
                                    )}
                                </td>
                                <td>{formatFileSize(file.size)}</td>
                                <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => window.open(`http://localhost:8000${file.file}`, '_blank')}>Просмотр</button>
                                    <button onClick={() => handleDownloadFile(file.file)}>Скачать</button>
                                    <button onClick={() => handleGenerateLink(file.id)}>Скачать ссылку</button>
                                    <button onClick={() => setEditingFileId(file.id)}>Редактировать комментарий</button>
                                    <button onClick={() => handleDelete(file.id)}>Удалить</button>
                                    <button onClick={() => handleRenameFile(file.id, file.name)}>Переименовать файл</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default FileStorage;