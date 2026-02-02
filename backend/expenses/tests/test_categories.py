from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from expenses.models import ExpenseCategory


class ExpenseCategoryTests(APITestCase):
    """Test cases for expense category endpoints."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = ExpenseCategory.objects.create(
            name='Food',
            description='Food expenses'
        )
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.token.access_token}'
        )
        self.list_url = reverse('category-list')
        self.detail_url = reverse('category-detail', kwargs={'pk': self.category.pk})

    def test_list_categories_authenticated(self):
        """Test listing categories when authenticated."""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Food')

    def test_list_categories_unauthenticated(self):
        """Test listing categories fails when unauthenticated."""
        self.client.credentials()
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_category(self):
        """Test creating a new category."""
        data = {
            'name': 'Transport',
            'description': 'Transportation expenses'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Transport')
        self.assertEqual(ExpenseCategory.objects.count(), 2)

    def test_create_category_duplicate_name(self):
        """Test creating category with duplicate name fails."""
        data = {
            'name': 'Food',
            'description': 'Duplicate'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_category_detail(self):
        """Test retrieving a specific category."""
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Food')
        self.assertEqual(response.data['id'], self.category.id)

    def test_update_category(self):
        """Test updating a category."""
        data = {
            'name': 'Food & Dining',
            'description': 'Updated description'
        }
        response = self.client.put(self.detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Food & Dining')
        self.category.refresh_from_db()
        self.assertEqual(self.category.name, 'Food & Dining')

    def test_partial_update_category(self):
        """Test partially updating a category."""
        data = {'description': 'New description'}
        response = self.client.patch(self.detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.category.refresh_from_db()
        self.assertEqual(self.category.description, 'New description')

    def test_delete_category(self):
        """Test deleting a category."""
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ExpenseCategory.objects.count(), 0)

    def test_search_categories(self):
        """Test searching categories by name."""
        ExpenseCategory.objects.create(name='Transport', description='Transport')
        ExpenseCategory.objects.create(name='Bills', description='Bills')
        
        response = self.client.get(self.list_url, {'search': 'Food'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Food')

    def test_search_categories_by_description(self):
        """Test searching categories by description."""
        ExpenseCategory.objects.create(name='Transport', description='Car expenses')
        
        response = self.client.get(self.list_url, {'search': 'expenses'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_ordering_categories(self):
        """Test ordering categories."""
        ExpenseCategory.objects.create(name='Bills', description='Bills')
        ExpenseCategory.objects.create(name='Transport', description='Transport')
        
        response = self.client.get(self.list_url, {'ordering': 'name'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [cat['name'] for cat in response.data['results']]
        self.assertEqual(names, sorted(names))
