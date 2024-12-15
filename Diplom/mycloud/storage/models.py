from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Расширенная модель пользователя
class CustomUser(AbstractUser):
    id = models.AutoField(primary_key=True, unique=True)
    username = models.CharField(max_length=50, unique=True)
    fullname = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    def __str__(self):
        return self.username

    def get_fullname(self):
        return self.fullname or f'{self.first_name} {self.last_name}'

    @property
    def is_admin(self):
        # Это свойство возвращает, является ли пользователь администратором
        return self.is_staff


# Модель для хранения файлов
class File(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Ссылка на пользователя
        on_delete=models.CASCADE,
        related_name="files"
    )
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='files/')  # Путь к файлу
    uploaded_at = models.DateTimeField(auto_now_add=True)
    size = models.PositiveIntegerField()  # Размер файла в байтах
    upload_date = models.DateTimeField(default=timezone.now)  # Дата загрузки
    last_downloaded = models.DateTimeField(null=True, blank=True)  # Дата последнего скачивания
    comment = models.TextField(null=True, blank=True)  # Комментарий к файлу
    public_link = models.URLField(null=True, blank=True)  # Специальная ссылка для внешнего доступа

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.public_link:
            self.public_link = f"http://localhost:8000/media/{self.file.name}"
        super().save(*args, **kwargs)

    def generate_public_link(self):
        """
        Генерация уникальной публичной ссылки для скачивания файла.
        Ссылка должна быть уникальной и безопасной для доступа.
        """
        import uuid
        return f"{settings.BASE_URL}/files/{uuid.uuid4()}/"

# Модель для истории скачивания файлов
class FileDownloadHistory(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name="download_history")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    download_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Download of {self.file.original_name} by {self.user.username} on {self.download_date}"