from datetime import timedelta, timezone
from venv import logger

from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.views import APIView
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
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_protect
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required


from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from datetime import timedelta
from rest_framework.decorators import api_view


from django.middleware.csrf import CsrfViewMiddleware
from django.utils.decorators import method_decorator




User = get_user_model()

# Регистрация пользователя
@method_decorator(csrf_exempt, name='dispatch')
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    print("Received data:", data)

    username = data.get('username')
    fullname = data.get('fullname')
    email = data.get('email')
    password = data.get('password')

    if not username or not password or not email:
        return JsonResponse({'message': 'Все поля обязательны!'}, status=400)

    try:
        user = CustomUser.objects.create_user(
            username=username,
            fullname=fullname,
            email=email,
            password=password
        )
        print("User created successfully:", user)
        return JsonResponse({'message': 'Пользователь успешно зарегистрирован.'}, status=201)
    except Exception as e:
        print("Error creating user:", e)
        return JsonResponse({'message': 'Ошибка при создании пользователя.'}, status=500)


# Вход пользователя
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user:
        login(request, user)

        # Получаем роль пользователя (используем is_staff для администраторов)
        role = "admin" if user.is_staff else "user"

        response = JsonResponse({
            "message": "Вход выполнен успешно",
            "is_staff": user.is_staff,
            "role": role,  # передаем правильную роль
            "username": user.username,
        })

        response.set_cookie(
            key="sessionid",
            value=request.session.session_key,
            httponly=True,
            secure=False,
            max_age=timedelta(days=7),
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
        serializer = FileSerializer(files, many=True)
        return JsonResponse({'files': serializer.data}, status=200)

    except Exception as e:
        logger.error(f"Error fetching files: {str(e)}", exc_info=True)
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

    File.objects.create(user=request.user, name=file.name, file=file, comment=comment, size=file.size)
    return JsonResponse({'message': 'Файл успешно загружен.'})


# Удаление файла
# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# def delete_file(request, file_id):
#     try:
#         file = File.objects.get(id=file_id, user=request.user)
#         file.delete()
#         return JsonResponse({'message': 'Файл удален.'})
#     except File.DoesNotExist:
#         return JsonResponse({'error': 'Файл не найден.'}, status=404)


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
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_file_link(request, file_id):
    try:
        file = File.objects.get(id=file_id, user=request.user)

        print(f"File URL: {file.file.url}")

        file_url = file.file.url

        return JsonResponse({'link': file_url})

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

        response = JsonResponse({'access': access_token})
        response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')
        return response
    except Exception as e:
        return JsonResponse({'error': 'Invalid refresh token'}, status=400)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_users(request):
    users = CustomUser.objects.all()
    serializer = CustomUserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)

        if request.user == user:
            return Response({'error': 'Вы не можете удалить себя.'}, status=status.HTTP_403_FORBIDDEN)

        File.objects.filter(user=user).delete()

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    except CustomUser.DoesNotExist:
        return Response({'error': 'Пользователь не найден.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_user_info(request):
    user = request.user
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
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def rename_file(request, file_id):
    try:
        file = File.objects.get(id=file_id, user=request.user)
        new_name = request.data.get('name')

        if new_name:
            file.name = new_name
            file.save()
            return JsonResponse({'message': 'Имя файла успешно обновлено.'})
        else:
            return JsonResponse({'error': 'Новое имя не предоставлено.'}, status=400)

    except File.DoesNotExist:
        return JsonResponse({'error': 'Файл не найден.'}, status=404)


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer



def file_detail(request, file_id):
    file = get_object_or_404(File, id=file_id)
    serializer = FileSerializer(file)
    return JsonResponse(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_comment(request, file_id):
    try:
        file = File.objects.get(id=file_id)

        if file.user != request.user:
            return Response({'detail': 'У вас нет прав для редактирования комментария этого файла.'},
                             status=status.HTTP_403_FORBIDDEN)

        if 'comment' in request.data:
            new_comment = request.data['comment']

            if not new_comment:
                return Response({'detail': 'Комментарий не может быть пустым.'}, status=status.HTTP_400_BAD_REQUEST)

            if len(new_comment) > 500:
                return Response({'detail': 'Комментарий не может быть длиннее 500 символов.'},
                                status=status.HTTP_400_BAD_REQUEST)

            file.comment = new_comment
            file.save()

            serializer = FileSerializer(file)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response({'detail': 'Комментарий не был передан.'}, status=status.HTTP_400_BAD_REQUEST)

    except File.DoesNotExist:
        return Response({'detail': 'Файл не найден.'}, status=status.HTTP_404_NOT_FOUND)



@csrf_protect
def test_csrf_view(request):
    if request.method == "POST":
        return JsonResponse({"message": "CSRF token is valid!"}, status=200)
    elif request.method == "GET":
        csrf_token = get_token(request)
        return JsonResponse({"csrf_token": csrf_token}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})


class CustomCsrfViewMiddleware(CsrfViewMiddleware):
    def _reject(self, request, reason):
        print(f"CSRF rejected: {reason}")
        return super()._reject(request, reason)



@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_users(request):
    # Убедитесь, что запрос сделан администратором
    if request.user.is_staff:
        users = CustomUser.objects.all().values("id", "username", "email")
        return Response(users)
    return Response({"detail": "Доступ запрещён"}, status=403)


@login_required
def current_user(request):
    user = request.user
    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
    })


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_user_status(request, user_id):
    """
    Обновление статуса администратора (is_staff) для пользователя.
    """
    try:
        user = CustomUser.objects.get(id=user_id)

        if user == request.user:
            return Response({'error': 'Вы не можете изменить собственный статус.'}, status=status.HTTP_403_FORBIDDEN)

        is_staff = request.data.get("is_staff")

        if is_staff is not None:
            user.is_staff = is_staff
            user.save()
            return Response({'message': f"Статус пользователя {user.username} обновлен."}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Параметр is_staff не предоставлен.'}, status=status.HTTP_400_BAD_REQUEST)

    except CustomUser.DoesNotExist:
        return Response({'error': 'Пользователь не найден.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserFilesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        files = File.objects.filter(user_id=user_id).values("id", "name", "size", "uploaded_at")
        return Response(files)



@api_view(['DELETE'])
@permission_classes([IsAdminUser])  # Администратор имеет доступ
def delete_user_file(request, user_id, file_id):
    """
    Администратор может удалять файлы других пользователей.
    :param user_id: ID пользователя, чьи файлы нужно удалить.
    :param file_id: ID файла, который нужно удалить.
    """
    try:
        file = File.objects.get(id=file_id, user_id=user_id)  # Ищем файл по ID пользователя и ID файла
        file.delete()
        return Response({"message": "Файл удалён."}, status=204)
    except File.DoesNotExist:
        return Response({"error": "Файл не найден."}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])  # Только авторизованные пользователи могут удалить свои файлы
def delete_file(request, file_id):
    """
    Пользователь может удалить только свои файлы.
    :param file_id: ID файла, который нужно удалить.
    """
    try:
        # Ищем файл, который принадлежит текущему пользователю
        file = File.objects.get(id=file_id, user=request.user)
        file.delete()
        return JsonResponse({'message': 'Файл удален.'})
    except File.DoesNotExist:
        return JsonResponse({'error': 'Файл не найден.'}, status=404)


