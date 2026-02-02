from django.test import TestCase
from django.contrib.auth.models import User
from expenses.models import Expense, ExpenseCategory


class ExpenseCategoryModelTests(TestCase):
    """Test cases for ExpenseCategory model."""

    def test_create_category(self):
        """Test creating a category."""
        category = ExpenseCategory.objects.create(
            name='Food',
            description='Food expenses'
        )
        self.assertEqual(category.name, 'Food')
        self.assertEqual(str(category), 'Food')

    def test_category_unique_name(self):
        """Test category name must be unique."""
        ExpenseCategory.objects.create(name='Food')
        with self.assertRaises(Exception):
            ExpenseCategory.objects.create(name='Food')

    def test_category_ordering(self):
        """Test categories are ordered by name."""
        ExpenseCategory.objects.create(name='Zebra')
        ExpenseCategory.objects.create(name='Apple')
        categories = list(ExpenseCategory.objects.all())
        self.assertEqual(categories[0].name, 'Apple')
        self.assertEqual(categories[1].name, 'Zebra')


class ExpenseModelTests(TestCase):
    """Test cases for Expense model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = ExpenseCategory.objects.create(name='Food')

    def test_create_expense(self):
        """Test creating an expense."""
        from decimal import Decimal
        expense = Expense.objects.create(
            user=self.user,
            amount='100.50',
            description='Lunch',
            category=self.category,
            date='2024-01-01'
        )
        # Amount is stored as Decimal, compare as Decimal
        self.assertEqual(float(expense.amount), 100.50)
        self.assertEqual(expense.description, 'Lunch')
        self.assertEqual(str(expense), 'Lunch - 100.50 (2024-01-01)')

    def test_expense_user_relationship(self):
        """Test expense belongs to a user."""
        expense = Expense.objects.create(
            user=self.user,
            amount='50.00',
            description='Test',
            category=self.category,
            date='2024-01-01'
        )
        self.assertEqual(expense.user, self.user)
        self.assertIn(expense, self.user.expenses.all())

    def test_expense_category_relationship(self):
        """Test expense belongs to a category."""
        expense = Expense.objects.create(
            user=self.user,
            amount='50.00',
            description='Test',
            category=self.category,
            date='2024-01-01'
        )
        self.assertEqual(expense.category, self.category)
        self.assertIn(expense, self.category.expenses.all())

    def test_expense_ordering(self):
        """Test expenses are ordered by date descending."""
        Expense.objects.create(
            user=self.user,
            amount='10.00',
            description='Old',
            category=self.category,
            date='2024-01-01'
        )
        Expense.objects.create(
            user=self.user,
            amount='20.00',
            description='New',
            category=self.category,
            date='2024-01-02'
        )
        expenses = list(Expense.objects.all())
        self.assertEqual(expenses[0].date.strftime('%Y-%m-%d'), '2024-01-02')
        self.assertEqual(expenses[1].date.strftime('%Y-%m-%d'), '2024-01-01')
