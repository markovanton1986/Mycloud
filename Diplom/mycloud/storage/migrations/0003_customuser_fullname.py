# Generated by Django 4.2.16 on 2024-12-09 08:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('storage', '0002_alter_file_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='fullname',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
