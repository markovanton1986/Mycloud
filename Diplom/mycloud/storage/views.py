from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt

from .models import CustomUser, File
from .serializers import FileSerializer, CustomUserSerializer
import json



from datetime import timedelta
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import File
from rest_framework import status


from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken



from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework import status


# Регистрация пользователя
@csrf_exempt
@api_view(['POST'])
def register_user(request):
    data = json.loads(request.body)
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return JsonResponse({'error': 'Все поля обязательны.'}, status=400)

    if CustomUser.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Пользователь с таким username уже существует.'}, status=400)

    if CustomUser.objects.filter(email=email).exists():
        return JsonResponse({'error': 'Пользователь с таким email уже существует.'}, status=400)

    CustomUser.objects.create_user(username=username, email=email, password=password)
    return JsonResponse({'message': 'Пользователь успешно зарегистрирован.'})


# Вход пользователя
@csrf_exempt
@api_view(['POST'])
def login_user(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        # Генерация токенов
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return JsonResponse({
            'message': 'Успешный вход в систему.',
            'refresh': str(refresh),
            'access': str(access),
            'is_admin': user.is_staff  # Например, для проверки прав администратора
        })
    return JsonResponse({'error': 'Неверные учетные данные.'}, status=401)


# Выход пользователя
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return JsonResponse({'message': 'Успешный выход.'})


# Список пользователей (админ)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_users(request):
    current_user = request.user  # Используем request для получения текущего пользователя
    if current_user.is_superuser:  # Дополнительная проверка (например, для суперпользователей)
        users = CustomUser.objects.all()
        serializer = CustomUserSerializer(users, many=True)
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({'error': 'Доступ запрещен'}, status=403)


# Удаление пользователя (админ)
@api_view(['DELETE'])
@permission_classes([IsAdminUser])  # Только для администраторов
def delete_user(request, user_id):  # Используем request для дальнейшей логики
    try:
        # Находим пользователя по id
        user = CustomUser.objects.get(id=user_id)

        # Дополнительная проверка прав доступа пользователя (если необходимо)
        if request.user != user:  # например, проверка, не пытается ли текущий пользователь удалить себя
            return JsonResponse({'error': 'Вы не можете удалить себя.'}, status=403)

        # Удаляем пользователя
        user.delete()

        # Возвращаем сообщение об успешном удалении
        return JsonResponse({'message': 'Пользователь удален.'})
    except CustomUser.DoesNotExist:
        # Если пользователь не найден, возвращаем ошибку
        return JsonResponse({'error': 'Пользователь не найден.'}, status=404)


# Список файлов
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_files(request):
    try:
        # Получаем все файлы текущего пользователя
        files = File.objects.filter(user=request.user)

        # Если файлов нет, возвращаем сообщение
        if not files.exists():
            return JsonResponse({'message': 'У вас нет загруженных файлов.'}, status=status.HTTP_404_NOT_FOUND)

        # Сериализация данных
        serializer = FileSerializer(files, many=True)

        # Возвращаем сериализованные данные
        return JsonResponse({'files': serializer.data}, status=status.HTTP_200_OK)

    except Exception as e:
        # Логирование ошибки на сервере
        print(f"Error while fetching files: {e}")

        # Возвращаем ошибку 500 с сообщением
        return Response({'error': 'Произошла ошибка при получении файлов.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Загрузка файла
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    file = request.FILES['file']
    comment = request.POST.get('comment', '')
    File.objects.create(user=request.user, file=file, comment=comment)
    return JsonResponse({'message': 'Файл успешно загружен.'})


# Удаление файла
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_file(request, file_id):
    try:
        file = File.objects.get(id=file_id, user=request.user)
        file.delete()
        return JsonResponse({'message': 'Файл удален.'})
    except File.DoesNotExist:
        return JsonResponse({'error': 'Файл не найден.'}, status=404)


# Скачивание файла
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_file(request, file_id):
    try:
        # Получаем файл по file_id и пользователю
        file = File.objects.get(id=file_id, user=request.user)

        # Устанавливаем время истечения для файла (например, 30 дней с момента загрузки)
        expiration_time = file.uploaded_at + timedelta(days=30)

        # Проверяем, истек ли срок действия файла
        if timezone.now() > expiration_time:
            return Response({
                'error': 'Этот файл истек. Пожалуйста, загрузите его снова, если вам нужно получить доступ.',
            }, status=410)  # Статус HTTP 410 Gone

        # Если файл не истек, продолжаем загрузку файла
        return Response({'message': 'Скачивание файла началось.'})

    except File.DoesNotExist:
        return Response({'error': 'Файл не найден.'}, status=404)


# Генерация ссылки на файл
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_file_link(request, file_id):
    try:
        file = File.objects.get(id=file_id, user=request.user)
        return JsonResponse({'link': f'/media/{file.file}'})
    except File.DoesNotExist:
        return JsonResponse({'error': 'Файл не найден.'}, status=404)


@api_view(['POST'])
def refresh_token(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return JsonResponse({'error': 'Refresh token is required'}, status=400)
    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        return JsonResponse({'access': access_token})
    except Exception as e:
        return JsonResponse({'error': 'Invalid refresh token'}, status=400)


