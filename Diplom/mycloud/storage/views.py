from datetime import timedelta, timezone
from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import JsonResponse
from .models import File
from .serializers import FileSerializer, UserSerializer
import json
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import CustomUser
from .serializers import CustomUserSerializer

User = get_user_model()
# Регистрация пользователя
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = json.loads(request.body)  # Получаем данные из запроса
    print("Received data:", data)  # Добавляем логирование

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Проверка обязательных полей
    if not username or not email or not password:
        print("Error: Missing fields")  # Логируем ошибку
        return JsonResponse({'error': 'Все поля обязательны.'}, status=400)

    if User.objects.filter(username=username).exists():
        print("Error: Username already exists")  # Логируем ошибку
        return JsonResponse({'error': 'Пользователь с таким username уже существует.'}, status=400)

    if User.objects.filter(email=email).exists():
        print("Error: Email already exists")  # Логируем ошибку
        return JsonResponse({'error': 'Пользователь с таким email уже существует.'}, status=400)

    # Создание пользователя
    user = User.objects.create_user(username=username, email=email, password=password)
    print("User created successfully:", user)  # Логируем успешную регистрацию

    # user.groups.add(Group.objects.get(name='some_group'))  # Здесь добавляем в нужную группу
    # user.is_staff = True  # Если хотите сделать пользователя администратором
    # user.save()

    return JsonResponse({'message': 'Пользователь успешно зарегистрирован.'}, status=201)


# Вход пользователя


@api_view(['POST'])
@permission_classes([AllowAny])  # Разрешить доступ всем пользователям
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    # Аутентификация пользователя
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token_str = str(refresh)

        # Сохраняем токены в cookies
        response = Response({
            "message": "Вход выполнен успешно",
            "access": access_token,
            "refresh": refresh_token_str,
        })

        response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite='Lax')
        response.set_cookie("refresh_token", refresh_token_str, httponly=True, secure=False, samesite='Lax')

        return response

    return Response({"error": "Неправильный логин или пароль"}, status=400)


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
        return JsonResponse({'access': access_token})
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
@permission_classes([IsAdminUser])  # Ограничиваем доступ только администраторам
def delete_user(request, user_id):
    try:
        # Получаем пользователя по ID
        user = CustomUser.objects.get(id=user_id)

        # Дополнительная проверка (например, для запрета удалять самого себя)
        if request.user == user:
            return Response({'error': 'Вы не можете удалить себя.'}, status=403)

        # Удаляем пользователя
        user.delete()

        # Возвращаем успешный ответ
        return Response({'message': 'Пользователь успешно удалён.'}, status=200)

    except CustomUser.DoesNotExist:
        # Если пользователь не найден, возвращаем ошибку
        return Response({'error': 'Пользователь не найден.'}, status=404)


@api_view(['GET'])
def get_user_info(request):
    user = request.user  # Получаем текущего авторизованного пользователя
    serializer = UserSerializer(user)
    return Response(serializer.data)