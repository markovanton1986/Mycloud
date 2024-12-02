from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import File

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_admin']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'original_name', 'unique_name', 'size', 'upload_date', 'comment']


class CustomUserSerializer:
    pass