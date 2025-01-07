from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register_user, test_csrf_view, delete_user_file
from .views import current_user
from .views import update_user_status
from .views import UserFilesView

urlpatterns = [
    # Аутентификация и регистрация
    path('register/', register_user, name='register_user'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),

    # Административный интерфейс
    path('admin/users/', views.list_users, name='list_users'),
    path('admin/users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('admin/users/<int:user_id>/update-status/', update_user_status, name='update_user_status'),

    # Файловое хранилище

    path('files/', views.list_files, name='list_files'),
    path('files/upload/', views.upload_file, name='upload_file'),
    path('files/<int:file_id>/delete/', views.delete_file, name='delete_file'),
    path('files/<int:file_id>/download/', views.download_file, name='download_file'),
    path('files/<int:file_id>/link/', views.generate_file_link, name='generate_file_link'),
    path('files/<int:file_id>/rename/', views.rename_file, name='rename_file'),
    path('files/<int:file_id>/', views.file_detail, name='file_detail'),
    path('files/<int:file_id>/comment/', views.update_comment, name='update_comment'),


    path('test-csrf/', test_csrf_view, name='test_csrf'),
    path('user/', current_user, name='current_user'),
    path('users/<int:user_id>/files/', UserFilesView.as_view(), name='user-files'),
    path('users/<int:user_id>/files/<int:file_id>/delete/', delete_user_file, name='delete_user_file'),
    path('delete-file/<int:file_id>/', views.delete_file, name='delete_file'),  # Для пользователей
    path('delete-user-file/<int:user_id>/<int:file_id>/', views.delete_user_file, name='delete_user_file'),
    # Для администраторов
]