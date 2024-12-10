from datetime import timedelta, timezone
from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.http import JsonResponse
from .models import File, CustomUser
from .serializers import FileSerializer, UserSerializer, CustomUserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import json
import re
from django.core.exceptions import ValidationError

User = get_user_model()

# Регистрация пользователя
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = json.loads(request.body)
    print("Received data:", data)

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Проверка обязательных полей
    if not username or not email or not password:
        print("Error: Missing fields")
        return JsonResponse({'error': 'Все поля обязательны.'}, status=400)

    # Валидация email
    if not validate_email(email):
        return JsonResponse({'error': 'Неверный формат email.'}, status=400)

    # Валидация пароля
    try:
        validate_password(password)
    except ValidationError as e:
        return JsonResponse({'error': str(e)}, status=400)

    if User.objects.filter(username=username).exists():
        print("Error: Username already exists")
        return JsonResponse({'error': 'Пользователь с таким username уже существует.'}, status=400)

    if User.objects.filter(email=email).exists():
        print("Error: Email already exists")
        return JsonResponse({'error': 'Пользователь с таким email уже существует.'}, status=400)

    # Создание пользователя
    user = User.objects.create_user(username=username, email=email, password=password)
    print("User created successfully:", user)

    return JsonResponse({'message': 'Пользователь успешно зарегистрирован.'}, status=201)


# Вход пользователя
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = JsonResponse({
            "message": "Вход выполнен успешно",
            "access": access_token,
            "refresh": refresh_token,
            "is_staff": user.is_staff,
        })

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite='Lax'
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite='Lax'
        )

        return response
    return JsonResponse({"error": "Неправильный логин или пароль"}, status=400)


# Выход пользователя
@api_view(["POST"])
def logout_user(request):
    response = Response({"message": "Вы вышли из системы"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


# Список файлов (защищенный доступ)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_files(request):
    try:
        files = File.objects.filter(user=request.user)

        if not files.exists():
            return JsonResponse({'message': 'У вас нет загруженных файлов.'}, status=404)

        serializer = FileSerializer(files, many=True)
        return JsonResponse({'files': serializer.data}, status=200)

    except Exception as e:
        print(f"Error: {e}")
        return JsonResponse({'error': 'Произошла ошибка при получении файлов.'}, status=500)


# Загрузка файла
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_file_size(file):
    if file.size > MAX_FILE_SIZE:
        raise ValidationError("Размер файла не должен превышать 10 MB.")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    file = request.FILES['file']
    comment = request.POST.get('comment', '')

    try:
        validate_file_size(file)
    except ValidationError as e:
        return JsonResponse({'error': str(e)}, status=400)

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
        file = File.objects.get(id=file_id, user=request.user)

        expiration_time = file.uploaded_at + timedelta(days=30)

        if timezone.now() > expiration_time:
            return Response({
                'error': 'Этот файл истек. Пожалуйста, загрузите его снова, если вам нужно получить доступ.',
            }, status=410)

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


# Обновление токена
@api_view(['POST'])
def refresh_token(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return JsonResponse({'error': 'Refresh token is required'}, status=400)
    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)

        # Отправка только нового access token в response с cookies
        response = JsonResponse({'access': access_token})
        response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')
        return response
    except Exception as e:
        return JsonResponse({'error': 'Invalid refresh token'}, status=400)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_users(request):
    # Получаем всех пользователей
    users = CustomUser.objects.all()
    serializer = CustomUserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)

        # Дополнительная проверка (например, для запрета удалять самого себя)
        if request.user == user:
            return Response({'error': 'Вы не можете удалить себя.'}, status=403)

        # Удаление всех файлов пользователя, если это необходимо
        File.objects.filter(user=user).delete()

        user.delete()
        return Response({'message': 'Пользователь успешно удалён.'}, status=200)

    except CustomUser.DoesNotExist:
        return Response({'error': 'Пользователь не найден.'}, status=404)


@api_view(['GET'])
def get_user_info(request):
    user = request.user  # Получаем текущего авторизованного пользователя
    serializer = UserSerializer(user)
    return Response(serializer.data)


# Валидация email
def validate_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return False
    return True

# Валидация пароля
def validate_password(password):
    if len(password) < 8:
        raise ValidationError("Пароль должен содержать хотя бы 8 символов.")
    if not any(char.isdigit() for char in password):
        raise ValidationError("Пароль должен содержать хотя бы одну цифру.")
    if not any(char.isalpha() for char in password):
        raise ValidationError("Пароль должен содержать хотя бы одну букву.")



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user  # Получаем текущего авторизованного пользователя
    serializer = UserSerializer(user)
    return Response(serializer.data)