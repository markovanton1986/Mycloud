from django.contrib import admin
from .models import CustomUser, File

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'full_name', 'is_admin', 'email')  # Добавляем full_name и is_admin
    search_fields = ('username', 'email')
    list_filter = ('is_staff',)

class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'uploaded_at', 'comment')  # Добавляем name и uploaded_at
    search_fields = ('name', 'user__username')  # Поиск по имени файла и имени пользователя
    list_filter = ('uploaded_at',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(File, FileAdmin)