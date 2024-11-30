import { validateEmail, validatePassword, validateUsername } from './Validations';
import { copyToClipboard } from './FileActions';

// Тесты для валидации
describe('Проверочные тесты', () => {
  test('Действительный адрес электронной почты должен пройти проверку', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  test('Неверный адрес электронной почты не прошел проверку', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  test('Действительное имя пользователя должно пройти проверку', () => {
    expect(validateUsername('ValidUser123')).toBe(true);
  });

  test('Неверное имя пользователя не прошло проверку', () => {
    expect(validateUsername('12User')).toBe(false); // Начинается с цифры
    expect(validateUsername('a')).toBe(false); // Короткий
    expect(validateUsername('a'.repeat(25))).toBe(false); // Длинный
  });

  test('Действительный пароль должен пройти проверку', () => {
    expect(validatePassword('StrongPass1!')).toBe(true);
  });

  test('Неверный пароль не прошел проверку', () => {
    expect(validatePassword('weakpass')).toBe(false); // Нет заглавных букв, цифр или специальных символов
    expect(validatePassword('Weak1')).toBe(false); // Короткий
    expect(validatePassword('NoSpecial123')).toBe(false); //  Нет особого символа
  });
});

// Тесты для действий с файлами
describe('Тесты действий с файлами', () => {
  test('Копирование в буфер обмена должно быть успешным', () => {
    // Mocking clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      }
    });

    return copyToClipboard('https://example.com/file-link').then(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/file-link');
    });
  });

  test('Копирование в буфер обмена должно завершиться ошибкой', () => {
    // Mocking clipboard API with rejection
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.reject(new Error('Ошибка буфера обмена')))
      }
    });

    return copyToClipboard('https://example.com/file-link').catch((error) => {
      expect(error.message).toBe('Ошибка буфера обмена');
    });
  });
});

// Тесты для компонентов React (например, с помощью Testing Library)
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';

describe('Тесты формы входа в систему', () => {
  test('Должна ли форма входа в систему отображаться корректно', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('Следует вызвать функцию отправки с допустимыми входными данными', () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'ValidUser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass1!' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockSubmit).toHaveBeenCalledWith({
      username: 'ValidUser',
      password: 'StrongPass1!'
    });
  });

  test('Не следует вызывать функцию отправки с недопустимыми входными данными', () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: '' } }); // Пустое имя пользователя
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '' } }); // Пустой пароль
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockSubmit).not.toHaveBeenCalled();
  });
});