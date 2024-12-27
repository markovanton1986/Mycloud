from django.db import migrations
from django.contrib.auth import get_user_model

def create_superuser(apps, schema_editor):
    User = get_user_model()

    username = "postgres"
    email = "mojohed@mail.ru"
    password = "postgres"

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)

class Migration(migrations.Migration):
    dependencies = [
        ('storage', '0006_file_upload_date'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]