from abc import ABC

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import File
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_admin']


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'name', 'size', 'uploaded_at', 'file', 'comment']


class CustomUserSerializer:
    def __init__(self):
        self.data = None

    pass


