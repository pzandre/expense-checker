from django.contrib.auth.models import User
from django.urls import reverse
from datetime import date, timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from expenses.models import Expense, ExpenseCategory


class ExpenseTests(APITestCase):
    """Test cases for expense endpoints."""

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
        
        self.expense1 = Expense.objects.create(
            user=self.user1,
            amount='100.50',
            description='Lunch',
            category=self.category1,
            date=date.today()
        )
        self.expense2 = Expense.objects.create(
            user=self.user1,
            amount='50.00',
            description='Bus ticket',
            category=self.category2,
            date=date.today() - timedelta(days=1)
        )
        self.expense3 = Expense.objects.create(
            user=self.user2,
            amount='200.00',
            description='Dinner',
            category=self.category1,
            date=date.today()
        )
        
        self.token = RefreshToken.for_user(self.user1)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.token.access_token}'
        )
        self.list_url = reverse('expense-list')
        self.detail_url = reverse('expense-detail', kwargs={'pk': self.expense1.pk})

    def test_list_expenses_authenticated(self):
        """Test listing expenses when authenticated."""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only return expenses for user1
        self.assertEqual(len(response.data['results']), 2)
        expense_ids = [exp['id'] for exp in response.data['results']]
        self.assertIn(self.expense1.id, expense_ids)
        self.assertIn(self.expense2.id, expense_ids)
        self.assertNotIn(self.expense3.id, expense_ids)

    def test_list_expenses_unauthenticated(self):
        """Test listing expenses fails when unauthenticated."""
        self.client.credentials()
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_expense(self):
        """Test creating a new expense."""
        data = {
            'amount': '75.25',
            'description': 'Coffee',
            'category_id': self.category1.id,
            'date': str(date.today())
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['amount'], '75.25')
        self.assertEqual(response.data['description'], 'Coffee')
        self.assertEqual(Expense.objects.filter(user=self.user1).count(), 3)

    def test_create_expense_invalid_amount(self):
        """Test creating expense with invalid amount fails."""
        data = {
            'amount': '-10.00',
            'description': 'Invalid',
            'category_id': self.category1.id,
            'date': str(date.today())
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_expense_zero_amount(self):
        """Test creating expense with zero amount fails."""
        data = {
            'amount': '0.00',
            'description': 'Invalid',
            'category_id': self.category1.id,
            'date': str(date.today())
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_expense_detail(self):
        """Test retrieving a specific expense."""
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.expense1.id)
        self.assertEqual(response.data['description'], 'Lunch')
        self.assertIn('category', response.data)

    def test_get_other_user_expense(self):
        """Test cannot retrieve another user's expense."""
        other_expense_url = reverse('expense-detail', kwargs={'pk': self.expense3.pk})
        response = self.client.get(other_expense_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_expense(self):
        """Test updating an expense."""
        data = {
            'amount': '120.00',
            'description': 'Updated lunch',
            'category_id': self.category1.id,
            'date': str(date.today())
        }
        response = self.client.put(self.detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['amount'], '120.00')
        self.expense1.refresh_from_db()
        self.assertEqual(self.expense1.amount, 120.00)

    def test_partial_update_expense(self):
        """Test partially updating an expense."""
        data = {'amount': '150.00'}
        response = self.client.patch(self.detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.expense1.refresh_from_db()
        self.assertEqual(self.expense1.amount, 150.00)

    def test_delete_expense(self):
        """Test deleting an expense."""
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Expense.objects.filter(user=self.user1).count(), 1)

    def test_filter_expenses_by_category(self):
        """Test filtering expenses by single category."""
        response = self.client.get(self.list_url, {'category': str(self.category1.id)})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['category_name'], 'Food')

    def test_filter_expenses_by_multiple_categories(self):
        """Test filtering expenses by multiple categories."""
        # Create a third expense with category1 for user1
        expense3 = Expense.objects.create(
            user=self.user1,
            amount='75.00',
            description='Snack',
            category=self.category1,
            date=date.today()
        )
        
        # Filter by both categories (comma-separated)
        response = self.client.get(
            self.list_url,
            {'category': f'{self.category1.id},{self.category2.id}'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)
        category_names = [exp['category_name'] for exp in response.data['results']]
        self.assertIn('Food', category_names)
        self.assertIn('Transport', category_names)
        
        # Filter by single category using comma format
        response = self.client.get(
            self.list_url,
            {'category': str(self.category1.id)}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        for exp in response.data['results']:
            self.assertEqual(exp['category_name'], 'Food')

    def test_filter_expenses_by_category_invalid_ids(self):
        """Test filtering expenses with invalid category IDs."""
        # Create another expense with category1 for user1
        Expense.objects.create(
            user=self.user1,
            amount='75.00',
            description='Snack',
            category=self.category1,
            date=date.today()
        )
        
        # Empty string should return all expenses
        response = self.client.get(self.list_url, {'category': ''})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Invalid ID should return empty results
        response = self.client.get(self.list_url, {'category': '99999'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)
        
        # Mix of valid and invalid IDs should only use valid ones
        response = self.client.get(
            self.list_url,
            {'category': f'{self.category1.id},99999'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_filter_expenses_by_date_from(self):
        """Test filtering expenses by date_from."""
        response = self.client.get(
            self.list_url,
            {'date_from': str(date.today())}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], self.expense1.id)

    def test_filter_expenses_by_date_to(self):
        """Test filtering expenses by date_to."""
        response = self.client.get(
            self.list_url,
            {'date_to': str(date.today() - timedelta(days=1))}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], self.expense2.id)

    def test_filter_expenses_by_date_range(self):
        """Test filtering expenses by date range."""
        response = self.client.get(
            self.list_url,
            {
                'date_from': str(date.today() - timedelta(days=2)),
                'date_to': str(date.today())
            }
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_search_expenses_by_description(self):
        """Test searching expenses by description."""
        response = self.client.get(self.list_url, {'search': 'Lunch'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['description'], 'Lunch')

    def test_search_expenses_by_category_name(self):
        """Test searching expenses by category name."""
        response = self.client.get(self.list_url, {'search': 'Food'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_ordering_expenses_by_date(self):
        """Test ordering expenses by date."""
        response = self.client.get(self.list_url, {'ordering': 'date'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dates = [exp['date'] for exp in response.data['results']]
        self.assertEqual(dates, sorted(dates))

    def test_ordering_expenses_by_amount(self):
        """Test ordering expenses by amount."""
        response = self.client.get(self.list_url, {'ordering': 'amount'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        amounts = [float(exp['amount']) for exp in response.data['results']]
        self.assertEqual(amounts, sorted(amounts))
