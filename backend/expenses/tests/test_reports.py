from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from datetime import date, timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from expenses.models import Expense, ExpenseCategory


class ReportTests(APITestCase):
    """Test cases for report endpoints."""

    def setUp(self):
        """Set up test data."""
        self.user1 = User.objects.create_user(
            username='user1',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            password='testpass123'
        )
        
        self.category1 = ExpenseCategory.objects.create(name='Food')
        self.category2 = ExpenseCategory.objects.create(name='Transport')
        
        # Create expenses for user1
        self.expense1 = Expense.objects.create(
            user=self.user1,
            amount='100.00',
            description='Lunch',
            category=self.category1,
            date=date.today()
        )
        self.expense2 = Expense.objects.create(
            user=self.user1,
            amount='50.00',
            description='Dinner',
            category=self.category1,
            date=date.today() - timedelta(days=1)
        )
        self.expense3 = Expense.objects.create(
            user=self.user1,
            amount='30.00',
            description='Bus',
            category=self.category2,
            date=date.today() - timedelta(days=2)
        )
        
        # Create expense for user2 (should not appear in user1's reports)
        self.expense4 = Expense.objects.create(
            user=self.user2,
            amount='200.00',
            description='Other user expense',
            category=self.category1,
            date=date.today()
        )
        
        self.token = RefreshToken.for_user(self.user1)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.token.access_token}'
        )
        self.summary_url = reverse('report-summary')

    def test_summary_report_unauthenticated(self):
        """Test summary report fails when unauthenticated."""
        self.client.credentials()
        response = self.client.get(self.summary_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_summary_report_basic(self):
        """Test basic summary report returns correct totals."""
        response = self.client.get(self.summary_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 180.00)
        self.assertEqual(response.data['total_count'], 3)
        self.assertIsNone(response.data['average_daily'])

    def test_summary_report_category_totals(self):
        """Test summary report includes category totals."""
        response = self.client.get(self.summary_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        category_totals = response.data['category_totals']
        self.assertEqual(len(category_totals), 2)
        
        # Check totals are correct
        food_total = next(
            (ct for ct in category_totals if ct['category__name'] == 'Food'),
            None
        )
        self.assertIsNotNone(food_total)
        self.assertEqual(food_total['total'], 150.00)
        self.assertEqual(food_total['count'], 2)
        
        transport_total = next(
            (ct for ct in category_totals if ct['category__name'] == 'Transport'),
            None
        )
        self.assertIsNotNone(transport_total)
        self.assertEqual(transport_total['total'], 30.00)
        self.assertEqual(transport_total['count'], 1)

    def test_summary_report_filter_by_category(self):
        """Test summary report filtered by single category."""
        response = self.client.get(
            self.summary_url,
            {'category': str(self.category1.id)}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 150.00)
        self.assertEqual(response.data['total_count'], 2)
        self.assertEqual(len(response.data['category_totals']), 1)

    def test_summary_report_filter_by_multiple_categories(self):
        """Test summary report filtered by multiple categories."""
        # Filter by both categories (comma-separated)
        response = self.client.get(
            self.summary_url,
            {'category': f'{self.category1.id},{self.category2.id}'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 180.00)  # 100 + 50 + 30
        self.assertEqual(response.data['total_count'], 3)
        self.assertEqual(len(response.data['category_totals']), 2)
        
        # Verify both categories are in totals
        category_names = [ct['category__name'] for ct in response.data['category_totals']]
        self.assertIn('Food', category_names)
        self.assertIn('Transport', category_names)
        
        # Filter by single category using comma format
        response = self.client.get(
            self.summary_url,
            {'category': str(self.category1.id)}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 150.00)
        self.assertEqual(len(response.data['category_totals']), 1)

    def test_summary_report_filter_by_date_from(self):
        """Test summary report filtered by date_from."""
        response = self.client.get(
            self.summary_url,
            {'date_from': str(date.today())}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 100.00)
        self.assertEqual(response.data['total_count'], 1)

    def test_summary_report_filter_by_date_to(self):
        """Test summary report filtered by date_to."""
        response = self.client.get(
            self.summary_url,
            {'date_to': str(date.today() - timedelta(days=1))}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 80.00)
        self.assertEqual(response.data['total_count'], 2)

    def test_summary_report_filter_by_date_range(self):
        """Test summary report filtered by date range."""
        response = self.client.get(
            self.summary_url,
            {
                'date_from': str(date.today() - timedelta(days=1)),
                'date_to': str(date.today())
            }
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 150.00)
        self.assertEqual(response.data['total_count'], 2)
        # Should calculate average daily
        self.assertIsNotNone(response.data['average_daily'])
        self.assertEqual(response.data['average_daily'], 75.00)

    def test_summary_report_filter_by_description(self):
        """Test summary report filtered by description."""
        response = self.client.get(
            self.summary_url,
            {'description': 'Lunch'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 100.00)
        self.assertEqual(response.data['total_count'], 1)

    def test_summary_report_multiple_filters(self):
        """Test summary report with multiple filters."""
        response = self.client.get(
            self.summary_url,
            {
                'category': self.category1.id,
                'date_from': str(date.today() - timedelta(days=1)),
                'date_to': str(date.today()),
                'description': 'Lunch'
            }
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 100.00)
        self.assertEqual(response.data['total_count'], 1)

    def test_summary_report_user_isolation(self):
        """Test summary report only includes current user's expenses."""
        response = self.client.get(self.summary_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should not include user2's expenses
        self.assertEqual(response.data['total_amount'], 180.00)
        self.assertNotEqual(response.data['total_amount'], 380.00)

    def test_summary_report_empty_result(self):
        """Test summary report with no matching expenses."""
        response = self.client.get(
            self.summary_url,
            {'date_from': str(date.today() + timedelta(days=10))}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 0.0)
        self.assertEqual(response.data['total_count'], 0)
        self.assertEqual(len(response.data['category_totals']), 0)

    def test_summary_report_filters_in_response(self):
        """Test summary report includes applied filters in response."""
        response = self.client.get(
            self.summary_url,
            {
                'category': self.category1.id,
                'date_from': str(date.today() - timedelta(days=1)),
                'date_to': str(date.today()),
                'description': 'Lunch'
            }
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        filters = response.data['filters']
        self.assertEqual(str(filters['category']), str(self.category1.id))
        self.assertEqual(filters['date_from'], str(date.today() - timedelta(days=1)))
        self.assertEqual(filters['date_to'], str(date.today()))
        self.assertEqual(filters['description'], 'Lunch')
