# Generated by Django 4.2.16 on 2024-12-12 05:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('storage', '0004_alter_customuser_first_name_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='file',
            name='upload_date',
        ),
    ]