import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiService, Expense } from '../../services/api';
import ExpenseList from '../../components/ExpenseList';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      const data = await apiService.getExpenses();
      // Ensure data is an array
      const expensesArray = Array.isArray(data) ? data : [];
      setExpenses(expensesArray);
    } catch (error) {
      Alert.alert('Error', 'Failed to load expenses');
      setExpenses([]); // Set empty array on error
    }
  }, []);

  // Load expenses when screen is focused (e.g., after navigating back from edit)
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ExpenseList
        expenses={expenses}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
