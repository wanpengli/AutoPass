from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class AutoPassUser(User):
    enc_master_pwd = models.CharField(max_length=150)
    hash_master_pwd = models.CharField(max_length=150)

    def __str__(self):
        return self.username

class AutoPassPPD(models.Model):
    username = models.CharField(max_length=150)
    domain = models.CharField(max_length=30)
    user_account = models.CharField(max_length=150)
    pwd_offset = models.CharField(max_length=150)
    input_type = models.CharField(max_length=30)

    def __str__(self):
        return self.username
