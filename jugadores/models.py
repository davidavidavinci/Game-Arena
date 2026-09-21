from django.db import models

class Jugador(models.Model):
    nombre = models.CharField(max_length=120)
    nickname = models.CharField(max_length=60, unique=True)
    email = models.CharField(unique=True)
    pais = models.CharField(max_length=80)
    nivel = models.PositiveIntegerField(default=1)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nickname

