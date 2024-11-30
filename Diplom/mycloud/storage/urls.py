from django.urls import path
from . import views

urlpatterns = [
    # Аутентификация и регистрация
    path('api/register/', views.register_user, name='register_user'),
    path('api/login/', views.login_user, name='login_user'),
    path('api/logout/', views.logout_user, name='logout_user'),

    # Административный интерфейс
    path('api/admin/users/', views.list_users, name='list_users'),
    path('api/admin/users/<int:user_id>/delete/', views.delete_user, name='delete_user'),

    # Файловое хранилище
    path('api/files/', views.list_files, name='list_files'),
    path('api/files/upload/', views.upload_file, name='upload_file'),
    path('api/files/<int:file_id>/delete/', views.delete_file, name='delete_file'),
    path('api/files/<int:file_id>/download/', views.download_file, name='download_file'),
    path('api/files/<int:file_id>/link/', views.generate_file_link, name='generate_file_link'),
]