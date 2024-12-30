from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import File, CustomUser

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'fullname']

    def create(self, validated_data):
        fullname = validated_data.pop('fullname', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        if fullname:
            user.fullname = fullname
            user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'fullname']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'name', 'size', 'uploaded_at', 'file', 'comment']

    def validate_file(self, value):
        # Ограничиваем размер файла 10 MB
        if value.size > 10 * 1024 * 1024:  # 10 MB max
            raise serializers.ValidationError("Файл слишком большой. Максимальный размер: 10 МБ.")
        # Ограничиваем типы файлов
        if not value.name.lower().endswith(('.jpg', '.png', '.pdf', '.docx', '.xlsx')):
            raise serializers.ValidationError("Неверный формат файла. Разрешены только изображения и документы.")
        return value

class CustomUserSerializer(serializers.ModelSerializer):
    fullname = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'fullname', 'email', 'is_staff']

    def create(self, validated_data):
        return CustomUser.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.fullname = validated_data.get('fullname', instance.fullname)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.save()
        return instance