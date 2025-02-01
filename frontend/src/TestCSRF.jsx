import React, { useState } from "react";
import axios from "axios";

const TestCSRF = () => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    // Получение CSRF токена из cookies
    const getCSRFToken = () => {
        const cookies = document.cookie.split("; ");
        const csrfCookie = cookies.find((cookie) => cookie.startsWith("csrftoken="));
        return csrfCookie ? csrfCookie.split("=")[1] : null;
    };

    const handleTestCSRF = async () => {
        try {
            const csrfToken = getCSRFToken();
            if (!csrfToken) {
                throw new Error("CSRF токен не найден.");
            }

            const res = await axios.post(
                "http://89.104.66.22/api/test-csrf/",
                { data: "test" },
                {
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                    withCredentials: true,
                }
            );

            setResponse(res.data.message);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    return (
        <div>
            <button onClick={handleTestCSRF}>Проверить CSRF</button>
            {response && <p style={{ color: "green" }}>{response}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default TestCSRF;
