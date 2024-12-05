import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingFile from './LoadingFile';
import './FileStorage.css';

function FileManager() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get('/api/files/', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                console.log('Ответ от сервера:', response.data);

                if (response.status === 200 && Array.isArray(response.data)) {
                    setFiles(response.data);
                } else {
                    setError('Получены некорректные данные');
                }
            } catch (error) {
                console.error('Ошибка загрузки файлов:', error);
                
                setError(error.response?.data?.detail || 'Ошибка загрузки файлов');
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    const handleCopyLink = (url) => {
        navigator.clipboard.writeText(url);
        alert('Ссылка скопирована!');
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Файловый менеджер</h1>

            {/* Список файлов */}
            <h2>Список файлов</h2>
            {files.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Имя файла</th>
                            <th>Комментарий</th>
                            <th>Размер</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file.id}>
                                <td>{file.name}</td>
                                <td>{file.comment}</td>
                                <td>{file.size}</td>
                                <td>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer">Скачать</a>
                                    <button onClick={() => handleCopyLink(file.url)}>Скопировать ссылку</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Нет файлов для отображения.</p>
            )}

            {/* Форма загрузки нового файла */}
            <h2>Загрузить новый файл</h2>
            <LoadingFile />
        </div>
    );
}

export default FileManager;