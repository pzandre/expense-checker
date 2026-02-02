from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Expense, ExpenseCategory


class ExpenseCategorySerializer(serializers.ModelSerializer):
    """Serializer for ExpenseCategory model."""
    
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expense model."""
    category = ExpenseCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ExpenseCategory.objects.all(),
        source='category',
        write_only=True
    )
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'amount',
            'description',
            'category',
            'category_id',
            'date',
            'user',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_amount(self, value):
        """Validate that amount is positive."""
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )
        return value


class ExpenseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for expense lists."""
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'amount',
            'description',
            'category_name',
            'date',
            'created_at',
        ]
