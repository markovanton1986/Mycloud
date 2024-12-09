from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import File


# Получаем модель пользователя
User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

# Сериализатор для пользователя
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']  # `is_staff` для проверки прав администратора


# Сериализатор для файла
class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'name', 'size', 'uploaded_at', 'file', 'comment']


# Пример кастомного сериализатора пользователя (если вам нужно дополнительно обрабатывать данные)
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']  # `is_staff` или `is_admin` для ролей администратора

    def create(self, validated_data):
        # Здесь можно реализовать дополнительную логику для создания пользователя
        return User.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Логика обновления пользователя
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.save()
        return instance


