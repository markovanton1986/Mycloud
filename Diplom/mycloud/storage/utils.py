from django.core.exceptions import PermissionDenied

import hashlib
from django.http import FileResponse



def has_access_to_storage(request, user):
    # Администратор имеет доступ ко всем хранилищам
    if request.user.is_admin:
        return True
    # Обычные пользователи имеют доступ только к своему хранилищу
    if request.user == user:
        return True
    raise PermissionDenied("У вас нет разрешения на доступ к этому хранилищу.")




def generate_public_link(file):
    # Уникальный идентификатор на основе ID файла и случайной строки
    unique_string = f"{file.id}-{uuid.uuid4()}"
    link = hashlib.sha256(unique_string.encode()).hexdigest()
    file.public_link = link
    file.save()
    return link



def download_by_public_link(request, link):
    file = get_object_or_404(File, public_link=link)
    file.last_downloaded_at = timezone.now()
    file.save()

    response = FileResponse(open(file.file_path, 'rb'))
    response['Content-Disposition'] = f'attachment; filename="{file.original_name}"'
    return response