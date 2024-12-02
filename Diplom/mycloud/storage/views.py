from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser, File
from .serializers import FileSerializer, CustomUserSerializer
import json


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

    user = CustomUser.objects.create_user(username=username, email=email, password=password)
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
        login(request, user)
        return JsonResponse({'message': 'Успешный вход в систему.'})
    return JsonResponse({'error': 'Неверные учетные данные.'}, status=401)


# Выход пользователя
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return JsonResponse({'message': 'Успешный выход.'})


# Список пользователей (админ)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    users = CustomUser.objects.all()
    serializer = CustomUserSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)


# Удаление пользователя (админ)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        user.delete()
        return JsonResponse({'message': 'Пользователь удален.'})
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'Пользователь не найден.'}, status=404)


# Список файлов
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_files(request):
    files = File.objects.filter(user=request.user)
    serializer = FileSerializer(files, many=True)
    return JsonResponse(serializer.data, safe=False)


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
        response = JsonResponse({'message': 'Скачивание началось.'})  # Здесь настройте возвращение файла
        return response
    except File.DoesNotExist:
        return JsonResponse({'error': 'Файл не найден.'}, status=404)


# Генерация ссылки на файл
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_file_link(request, file_id):
    try:
        file = File.objects.get(id=file_id, user=request.user)
        return JsonResponse({'link': f'/media/{file.file}'})
    except File.DoesNotExist:
        return JsonResponse({'error': 'Файл не найден.'}, status=404)