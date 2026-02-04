import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
  Text,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { apiService, Expense } from '../../services/api';
import ExpenseForm from '../../components/ExpenseForm';
import ConfirmModal from '../../components/ConfirmModal';

export default function EditExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadExpense();
  }, [id]);

  const loadExpense = async () => {
    try {
      const data = await apiService.getExpense(parseInt(id!));
      // Extract category_id from category object if not present
      if (data && !data.category_id && data.category) {
        data.category_id = data.category.id;
      }
      setExpense(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load expense');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await apiService.updateExpense(parseInt(id!), data);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Expense updated successfully',
        position: 'top',
        visibilityTime: 3000,
      });
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.detail || error.message || 'Failed to update expense',
        position: 'top',
        visibilityTime: 4000,
      });
      throw error;
    }
  };

  const performDeleteDirect = async () => {
    if (!id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Expense ID not found',
        position: 'top',
        visibilityTime: 4000,
      });
      return;
    }

    try {
      await apiService.deleteExpense(parseInt(id));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Expense deleted successfully',
        position: 'top',
        visibilityTime: 3000,
      });
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.detail || error.message || 'Failed to delete expense',
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  const handleDelete = () => {
    if (!id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Expense ID not found',
        position: 'top',
        visibilityTime: 4000,
      });
      return;
    }

    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    performDeleteDirect();
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!expense) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <ExpenseForm expense={expense} onSubmit={handleSubmit} />
      </ScrollView>
      <View style={styles.deleteContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            loading && styles.deleteButtonDisabled,
            pressed && styles.deleteButtonPressed,
          ]}
          onPress={handleDelete}
          disabled={loading || !id}
        >
          <Text style={styles.deleteButtonText}>Delete Expense</Text>
        </Pressable>
      </View>
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
});
