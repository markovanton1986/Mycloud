import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingFile from './LoadingFile';

function FileManager() {
    const [files, setFiles] = useState([]);
    const [newFile, setNewFile] = useState(null);
    const [comment, setComment] = useState('');

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

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', newFile);
        formData.append('comment', comment);

        try {
            await axios.post('/api/files/upload/', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Файл успешно загружен!');
        } catch (error) {
            console.error('Ошибка загрузки файла:', error);
        }
    };

    return (
        <div>
            <h1>Мои файлы</h1>
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
                    {files.map(file => (
                        <tr key={file.id}>
                            <td>{file.name}</td>
                            <td>{file.comment}</td>
                            <td>{file.size}</td>
                            <td>
                                <a href={file.url}>Скачать</a>
                                <button onClick={() => {
                                    navigator.clipboard.writeText(file.url);
                                    alert('Ссылка скопирована!');
                                }}>Скопировать ссылку</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Загрузить файл</h2>
            <input type="file" onChange={(e) => setNewFile(e.target.files[0])} />
            <input type="text" placeholder="Комментарий" onChange={(e) => setComment(e.target.value)} />
            <button onClick={handleUpload}>Загрузить</button>
        </div>
    );
}

export default FileManager;


function FileManager() {
    return (
        <div>
            <h1>Файловый менеджер</h1>
            {/* Список файлов */}
            {/* Форма загрузки файла */}
            <LoadingFile />
        </div>
    );
}