import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingFile from './LoadingFile';
import './FileManager.css';

function FileManager() {
    const [files, setFiles] = useState([]);

    // Загружаем список файлов при монтировании компонента
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get('/api/files/', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setFiles(response.data);
            } catch (error) {
                console.error('Ошибка загрузки файлов:', error);
            }
        };

        fetchFiles();
    }, []);

    // Функция копирования ссылки в буфер обмена
    const handleCopyLink = (url) => {
        navigator.clipboard.writeText(url);
        alert('Ссылка скопирована!');
    };

    return (
        <div>
            <h1>Файловый менеджер</h1>

            {/* Список файлов */}
            <h2>Список файлов</h2>
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
                                <a href={file.url}>Скачать</a>
                                <button onClick={() => handleCopyLink(file.url)}>Скопировать ссылку</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Форма загрузки нового файла */}
            <h2>Загрузить новый файл</h2>
            <LoadingFile />
        </div>
    );
}

export default FileManager;