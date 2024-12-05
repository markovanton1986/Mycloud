from django.contrib import admin
from .models import CustomUser, File


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'full_name', 'is_admin', 'email')
    search_fields = ('username', 'email')
    list_filter = ('is_staff',)


class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'uploaded_at', 'comment')
    search_fields = ('name', 'user__username')
    list_filter = ('uploaded_at',)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(File, FileAdmin)
