from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from .models import File
import os
import json

# ----------------------------
# User Authentication Views
# ----------------------------

@csrf_exempt
def register_user(request):
    """Handle user registration."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data['username']
            email = data['email']
            password = data['password']
            is_admin = data.get('is_admin', False)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already exists"}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            user.is_staff = is_admin
            user.save()

            return JsonResponse({"message": "User registered successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def login_user(request):
    """Handle user login."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data['username']
            password = data['password']

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({"message": "Login successful"})
            else:
                return JsonResponse({"error": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@login_required
def logout_user(request):
    """Handle user logout."""
    logout(request)
    return JsonResponse({"message": "Logged out successfully"})


# ----------------------------
# Admin Views
# ----------------------------

@login_required
def list_users(request):
    """List all users (admin only)."""
    if not request.user.is_staff:
        return JsonResponse({"error": "Permission denied"}, status=403)

    users = User.objects.all().values('id', 'username', 'email', 'is_staff')
    return JsonResponse({"users": list(users)})


@login_required
def delete_user(request, user_id):
    """Delete a user (admin only)."""
    if not request.user.is_staff:
        return JsonResponse({"error": "Permission denied"}, status=403)

    user = get_object_or_404(User, id=user_id)
    user.delete()
    return JsonResponse({"message": "User deleted successfully"})


# ----------------------------
# File Storage Views
# ----------------------------

@login_required
def list_files(request):
    """List all files for the authenticated user."""
    if request.user.is_staff:
        user_id = request.GET.get('user_id', None)
        if user_id:
            files = File.objects.filter(user_id=user_id)
        else:
            files = File.objects.all()
    else:
        files = File.objects.filter(user=request.user)

    files_data = files.values('id', 'original_name', 'size', 'uploaded_at', 'last_downloaded', 'comment')
    return JsonResponse({"files": list(files_data)})


@login_required
def upload_file(request):
    """Handle file uploads."""
    if request.method == "POST":
        uploaded_file = request.FILES['file']
        comment = request.POST.get('comment', '')

        file_path = os.path.join("uploads", request.user.username, uploaded_file.name)
        saved_path = default_storage.save(file_path, uploaded_file)

        File.objects.create(
            user=request.user,
            original_name=uploaded_file.name,
            size=uploaded_file.size,
            path=saved_path,
            comment=comment
        )
        return JsonResponse({"message": "File uploaded successfully"})
    return JsonResponse({"error": "Invalid request method"}, status=405)


@login_required
def delete_file(request, file_id):
    """Delete a file."""
    file = get_object_or_404(File, id=file_id)

    if file.user != request.user and not request.user.is_staff:
        return JsonResponse({"error": "Permission denied"}, status=403)

    file_path = file.path
    file.delete()

    if default_storage.exists(file_path):
        default_storage.delete(file_path)

    return JsonResponse({"message": "File deleted successfully"})


@login_required
def download_file(request, file_id):
    """Download a file."""
    file = get_object_or_404(File, id=file_id)

    if file.user != request.user and not request.user.is_staff:
        return JsonResponse({"error": "Permission denied"}, status=403)

    with default_storage.open(file.path, 'rb') as f:
        response = HttpResponse(f.read(), content_type="application/octet-stream")
        response['Content-Disposition'] = f'attachment; filename="{file.original_name}"'
        return response


@login_required
def generate_file_link(request, file_id):
    """Generate a special link for a file."""
    file = get_object_or_404(File, id=file_id)

    if file.user != request.user and not request.user.is_staff:
        return JsonResponse({"error": "Permission denied"}, status=403)

    special_link = f"/files/download/{file.id}/"
    return JsonResponse({"link": special_link})