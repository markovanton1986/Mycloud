import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./FileStorage.css";

const FileStorage = () => {
    const { userId } = useParams();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    axios.defaults.withCredentials = true;

    const getCSRFToken = () => {
        const csrfCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="));
        return csrfCookie ? csrfCookie.split("=")[1] : null;
    };

    const authorizedRequest = async (config) => {
        try {
            const csrfToken = getCSRFToken();
            const headers = {
                ...config.headers,
                "X-CSRFToken": csrfToken,
            };

            const response = await axios({
                ...config,
                withCredentials: true,
                headers,
            });
            return response;
        } catch (error) {
            if (error.response?.status === 401) {
                console.log(
                    "Необходима аутентификация. Пожалуйста, войдите в систему."
                );
            } else if (error.response?.status === 403) {
                console.log("Доступ запрещён. Проверьте CSRF или права доступа.");
            }
            throw error;
        }
    };

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await authorizedRequest({
                method: "GET",
                url: `http://localhost:8000/api/users/${userId}/files/`,
            });
            setFiles(response.data || []);
        } catch (error) {
            console.error("Ошибка получения файлов:", error);
            setError("Ошибка при загрузке файлов.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [userId]);


    const handleDelete = async (fileId) => {
        if (window.confirm("Вы уверены, что хотите удалить этот файл?")) {
            try {
                const csrfToken = getCSRFToken();
                console.log("CSRF Token:", csrfToken);

                await axios.delete(`http://localhost:8000/api/users/${userId}/files/${fileId}/delete/`, {
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                    withCredentials: true,
                });
                console.log("Файл успешно удалён.");
                fetchFiles();
            } catch (error) {
                if (error.response?.status === 403) {
                    console.error("Доступ запрещён. Проверьте CSRF или права доступа.");
                    alert("У вас нет прав на удаление этого файла.");
                } else {
                    console.error("Ошибка удаления файла:", error);
                }
            }
        }
    };

    return (
        <div className="file-storage-container">
            <h2>Управление файлами пользователя #{userId}</h2>
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p>Загрузка...</p>
            ) : files.length === 0 ? (
                <p>Нет загруженных файлов.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Название файла</th>
                            <th>Размер</th>
                            <th>Дата загрузки</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file.id}>
                                <td>{file.name}</td>
                                <td>{file.size} KB</td>
                                <td>{new Date(file.uploaded_at).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => handleDelete(file.id)}>
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FileStorage;