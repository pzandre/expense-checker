"""
URL configuration for expense_api project.
"""
from django.urls import path, include

urlpatterns = [
    path('api/', include('expenses.urls')),
]
