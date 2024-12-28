# Дипломный проект по профессии «Fullstack-разработчик на Python»


## «MyCloud» - облачное хранилище. 


## Инструкция по развёртыванию и запуску проекта. 


## Серверная часть приложения (бэкенд).


1. Клонирование репозитория 

git clone https://github.com/markovanton1986/Mycloud.git

cd <название папки с проектом>

2. Создание виртуального окружения. 

python3 -m venv venv

venv\Scripts\activate (для Windows)

3. Установка зависимостей. 

pip install --upgrade pip

pip install -r requirements.txt

4. Установите PostgreSQL. Создайте базу данных - PostgreSQL.

Настройки в файле settings.py: 

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydatabase',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

5. Применение миграций. 

python manage.py makemigrations

python manage.py migrate

6. Создание "суперпользователя" (для допустка к "админке"). 

python manage.py createsuperuser

name: postgres
password: postgres
email: mojohed@mail.ru

7. Сборка статических файлов.

python manage.py collectstatic

8. Настройка путей для статических и медиа-файлов (в файле settings.py)

STATIC_URL = '/static/'
MEDIA_URL = '/media/'
STATICFILES_DIRS = [BASE_DIR / "static"]
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

9. Запуск локального сервера. 

python manage.py runserver

Сервер будет доступен по адресу: http://127.0.0.1:8000/


## Пользовательский интерфейс (фронтенд).

1. Установка зависимостей. 

npm install

2. Установка и настройка CORS.

pip install django-cors-headers

Добавление в файл settings.py:

INSTALLED_APPS = ['corsheaders']

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
]

CORS_ALLOWED_ORIGINS = ['http://localhost:3000'] - адрес фронтенда. 

3. Запуск проекта. 

npm run dev



## Структура папок и файлов проекта. 

```
Mucloud/  
    Diplom/  
        .idea/ - скрытая папка, в которой хрянятся конфигурационные файлы проекта  
        venv/ - папка для хранения виртуальной среды  
        mycloud/  
            media/ - папка для хранения данных  
                files/  
                static/ - статические файлы Django  
                mycloud/  
                    __pycache__ - директория  
                    __init__.py - обозначение директории как пакета  
                    asgi.py - настройки ASGI  
                    settings.py - настройки  
                    urls.py - маршруты  
                    wsgi.py - конфигурации для WSGI  
                storage/ - приложение Django  
                    __pycache__/  
                    migrations/ - миграции базы данных  
                    templates/ - шаблоны HTML  
                        storage/ - приложение  
                    __init__.py  
                    admin.py - настройки панели администратора  
                    apps.py - конфигурация приложения  
                    forms.py - создание форм  
                    models.py - модели данных Django  
                    serializers.py - сериализаторы DRF  
                    tests.py - тесты для приложения  
                    urls.py - URL маршруты для бэкенда  
                    utils.py - хранение вспомогательных функций  
                    views.py - представления Django  
                .gitignore - игнорирование файлов, данных  
                manage.py - точка для входа Django  
                requirements.txt - зависимости Python  
    frontend/  
        .vscode/ - скрытая директория, в которой находятся настройки и конфигурации  
            settings.json - файл конфигурации  
        dist/ - хранение скомпилированных, упакованных или готовых для распространения файлов проекта  
        node_modules/ - для всех зависимостей, которые необходимы проекту для выполнения  
        public/ - публичные файлы  
            vite.svg  
            img/ - папка для хранения файлов  
                logo.png  
                mycloud2.jpg  
        src/ - исходные файлы приложения   
            assets/ - для хранения статичных ресурсов  
                react.svg  
            components/ - компоненты React  
                FileStorage.css  
                FileStorage.jsx  
                Footer.css  
                Footer. jsx  
                Header.css  
                Header.jsx  
                LoadingFile.css  
                LoadingFile.jsx  
                NavBar.css  
                NavBar.jsx  
            pages/ - страницы приложения  
                Admin.css  
                Admin.jsx  
                Home.css  
                Home.jsx  
                Login.css  
                Login.jsx  
                Logout.css  
                Logout.jsx  
                Register.css  
                Register.jsx  
                UserPage.css  
                UserPage.jsx  
                Validations.jsx  
            tests/  
                tests.jsx - тесты  
        App.css стили для App.jsx  
        App.jsx - главный компонент приложения  
        index.css - стили  
        index.jsx - точка входа для React  
        main.jsx - точка входа для React-приложений  
        static/ - статистически файлы  
        .gitignore - игнорирование файлов, данных  
        build.jsx - кастомный файл  
        eslint.config.js - конфигурационный файл для ESLint  
        index.html - основной HTML-файл  
        package-lock.json - важный компонент проект, использующий npm для управления зависимостями в JavaScript  
        package.json - зависимости для фронтенда  
        README.md - описание проекта  
        vite.congig.jsx - конфигурационный файл для инструмента сборки Vite  
    README.md - инструкция по развёртыванию проекта и описание папок и файлов  
```

        












            


