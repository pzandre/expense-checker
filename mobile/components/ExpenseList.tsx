import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Expense } from '../services/api';
import { useRouter } from 'expo-router';

interface ExpenseListProps {
  expenses: Expense[];
  onRefresh: () => void;
  refreshing: boolean;
}

export default function ExpenseList({
  expenses,
  onRefresh,
  refreshing,
}: ExpenseListProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatAmount = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const renderItem = ({ item }: { item: Expense }) => {
    // Handle both list view (category_name) and detail view (category object)
    const categoryName = item.category_name || item.category?.name || 'Unknown';
    
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/expense/${item.id}`)}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
        </View>
        <View style={styles.itemFooter}>
          <Text style={styles.category}>{categoryName}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No expenses found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={expenses}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
