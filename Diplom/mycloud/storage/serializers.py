from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import File, CustomUser

# Получаем модель пользователя
User = get_user_model()

# Сериализатор для регистрации пользователя
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'fullname']  # Поля для регистрации пользователя

    def create(self, validated_data):
        fullname = validated_data.pop('fullname', None)  # Извлекаем fullname, если оно есть
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        if fullname:
            user.fullname = fullname  # Сохраняем fullname
            user.save()  # Обновляем пользователя в базе данных
        return user

# Сериализатор для пользователя (для отображения данных)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'fullname']

# Сериализатор для файлов
class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'name', 'size', 'uploaded_at', 'file', 'comment']  # Поля для работы с файлами

    # Добавляем валидацию для поля file, чтобы проверять размер и тип файла
    def validate_file(self, value):
        # Ограничиваем размер файла 10 MB
        if value.size > 10 * 1024 * 1024:  # 10 MB max
            raise serializers.ValidationError("Файл слишком большой. Максимальный размер: 10 МБ.")
        # Ограничиваем типы файлов
        if not value.name.lower().endswith(('.jpg', '.png', '.pdf', '.docx', '.xlsx')):
            raise serializers.ValidationError("Неверный формат файла. Разрешены только изображения и документы.")
        return value

# Дополнительный кастомный сериализатор для пользователя (если потребуется для более сложной логики)
class CustomUserSerializer(serializers.ModelSerializer):
    fullname = serializers.CharField(source='get_fullname', read_only=True)  # Получаем полное имя пользователя

    class Meta:
        model = CustomUser  # Используем кастомную модель пользователя
        fields = ['id', 'username', 'fullname', 'email', 'is_staff']  # Указываем нужные поля

    def create(self, validated_data):
        # Дополнительная логика для создания пользователя
        return CustomUser.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Логика обновления пользователя
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.save()
        return instance