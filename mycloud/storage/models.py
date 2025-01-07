import os

from django.db.models import Sum
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid


# Расширенная модель пользователя
class CustomUser(AbstractUser):
    id = models.AutoField(primary_key=True, unique=True)
    username = models.CharField(max_length=50, unique=True)
    fullname = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    role = models.CharField(max_length=50, choices=[('admin', 'Admin'), ('user', 'User')], default='user')

    def __str__(self):
        return self.username

    def get_fullname(self):
        return self.fullname or f'{self.first_name} {self.last_name}'

    @property
    def is_admin(self):
        return self.is_staff

        # Укажите поле для использования в качестве идентификатора

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def file_count(self):
        # Предположим, у вас есть модель File с ForeignKey на пользователя
        return self.files.count()

    def total_file_size(self):
        # Предположим, у модели File есть поле size
        return self.files.aggregate(total_size=Sum('size'))['total_size'] or 0





# Модель для хранения файлов
class File(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="files"
    )
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    size = models.PositiveIntegerField()
    upload_date = models.DateTimeField(default=timezone.now)
    last_downloaded = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    public_link = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.public_link:
            self.public_link = self.generate_public_link()
        super().save(*args, **kwargs)

    def generate_public_link(self):
        """
        Генерация уникальной публичной ссылки для скачивания файла.
        Ссылка должна быть уникальной и безопасной для доступа.
        """
        # Генерация уникального идентификатора для ссылки
        file_uuid = uuid.uuid4()
        return f"{settings.BASE_URL}/files/{file_uuid}/"

    @property
    def file_url(self):
        """
        Получение URL файла (относительный путь в /media).
        """
        return os.path.join(settings.MEDIA_URL, self.file.name)




# Модель для истории скачивания файлов
class FileDownloadHistory(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name="download_history")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    download_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Download of {self.file.original_name} by {self.user.username} on {self.download_date}"


