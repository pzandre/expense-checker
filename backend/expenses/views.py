from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from datetime import datetime
from .models import Expense, ExpenseCategory
from .serializers import (
    ExpenseSerializer,
    ExpenseListSerializer,
    ExpenseCategorySerializer,
)


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing expense categories."""
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing expenses."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date']  # Removed 'category' - handled manually for multi-select
    search_fields = ['description', 'category__name']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        """Return expenses for the authenticated user."""
        queryset = Expense.objects.filter(user=self.request.user)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        # Support multiple categories (comma-separated IDs)
        category = self.request.query_params.get('category', None)
        if category:
            category_ids = []
            for cid in category.split(','):
                cid = cid.strip()
                if cid:
                    try:
                        category_ids.append(int(cid))
                    except ValueError:
                        # Skip invalid category IDs
                        continue
            if category_ids:
                queryset = queryset.filter(category_id__in=category_ids)
        
        return queryset

    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return ExpenseListSerializer
        return ExpenseSerializer

    def perform_create(self, serializer):
        """Set the user when creating an expense."""
        serializer.save(user=self.request.user)


class ReportViewSet(viewsets.ViewSet):
    """ViewSet for expense reports."""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary report with filters."""
        queryset = Expense.objects.filter(user=request.user)
        
        # Apply filters
        category = request.query_params.get('category', None)
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        description = request.query_params.get('description', None)
        
        # Support multiple categories (comma-separated IDs)
        if category:
            category_ids = []
            for cid in category.split(','):
                cid = cid.strip()
                if cid:
                    try:
                        category_ids.append(int(cid))
                    except ValueError:
                        # Skip invalid category IDs
                        continue
            if category_ids:
                queryset = queryset.filter(category_id__in=category_ids)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        if description:
            queryset = queryset.filter(
                description__icontains=description
            )
        
        # Calculate totals
        total_amount = queryset.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Group by category
        category_totals = queryset.values('category__name', 'category__id').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        # Date range stats
        if date_from and date_to:
            try:
                start_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                end_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                days = (end_date - start_date).days + 1
                avg_daily = total_amount / days if days > 0 else 0
            except ValueError:
                avg_daily = 0
        else:
            avg_daily = None
        
        return Response({
            'total_amount': float(total_amount),
            'total_count': queryset.count(),
            'category_totals': list(category_totals),
            'average_daily': float(avg_daily) if avg_daily else None,
            'filters': {
                'category': category,
                'date_from': date_from,
                'date_to': date_to,
                'description': description,
            },
        })
