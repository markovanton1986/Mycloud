export const validateRegistrationForm = (formData) => {
    const errors = {};

    // Валидация логина
    if (!/^[a-zA-Z][a-zA-Z0-9]{3,19}$/.test(formData.username)) {
        errors.username = "Логин - только латинские буквы и цифры, первый символ - буква, длина от 4 до 20 символов.";
    }

    // Валидация email
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Введите корректный email.";
    }

    // Валидация пароля
    if (
        !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(formData.password)
    ) {
        errors.password =
            "Пароль - не менее 6 символов: как минимум одна заглавная буква, одна цифра и один специальный символ.";
    }

    return errors;
};