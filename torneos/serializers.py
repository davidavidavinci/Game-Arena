from rest_framework import serializers
from .models import Torneo, Inscripcion

class TorneoSerializers(serializers.ModelSerializer):
    class Meta:
        model = Torneo,
        fields = '__all__'

    def validate_cupo_maximo(self, value):
        if value < 2:
            raise serializers
