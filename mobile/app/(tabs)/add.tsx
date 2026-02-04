import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { apiService } from '../../services/api';
import ExpenseForm, { ExpenseFormRef } from '../../components/ExpenseForm';

export default function AddExpenseScreen() {
  const router = useRouter();
  const formRef = useRef<ExpenseFormRef>(null);

  const handleSubmit = async (data: any) => {
    try {
      await apiService.createExpense(data);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Expense created successfully',
        position: 'top',
        visibilityTime: 3000,
      });
      // Reset form
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.detail || 'Failed to create expense',
        position: 'top',
        visibilityTime: 4000,
      });
      throw error;
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <ExpenseForm ref={formRef} onSubmit={handleSubmit} />
      </ScrollView>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
