import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { apiService, Expense, ExpenseCategory } from '../services/api';
import CategorySelector from './CategorySelector';
import DatePicker from './DatePicker';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: Partial<Expense>) => Promise<void>;
  onCancel?: () => void;
}

export interface ExpenseFormRef {
  reset: () => void;
}

const ExpenseForm = forwardRef<ExpenseFormRef, ExpenseFormProps>(
  ({ expense, onSubmit, onCancel }, ref) => {
    // Extract category_id from category object if not present
    const getCategoryId = (exp?: Expense): number | null => {
      if (!exp) return null;
      return exp.category_id || exp.category?.id || null;
    };

    const [amount, setAmount] = useState(expense?.amount || '');
    const [description, setDescription] = useState(expense?.description || '');
    const [categoryId, setCategoryId] = useState<number | null>(
      getCategoryId(expense)
    );
    const [date, setDate] = useState(
      expense?.date || new Date().toISOString().split('T')[0]
    );
    const [loading, setLoading] = useState(false);

    // Reset form function exposed via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        setAmount('');
        setDescription('');
        setCategoryId(null);
        setDate(new Date().toISOString().split('T')[0]);
      },
    }));

    // Update form when expense prop changes
    useEffect(() => {
      if (expense) {
        setAmount(expense.amount || '');
        setDescription(expense.description || '');
        // Extract category_id from category object if not present
        const categoryId = expense.category_id || expense.category?.id || null;
        setCategoryId(categoryId);
        setDate(expense.date || new Date().toISOString().split('T')[0]);
      }
    }, [expense]);

    const handleSubmit = async () => {
      if (!amount || !description || !categoryId) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        Alert.alert('Error', 'Amount must be a positive number');
        return;
      }

      setLoading(true);
      try {
        await onSubmit({
          amount: amount,
          description,
          category_id: categoryId,
          date,
        });
        // Form reset is handled by parent component after success
      } catch (error) {
        // Error handling is done by parent component
        throw error;
      } finally {
        setLoading(false);
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.field}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <CategorySelector
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
        </View>

        <View style={styles.field}>
          <DatePicker
            label="Date"
            value={date}
            onChange={setDate}
            placeholder="Select date"
          />
        </View>

        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : expense ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ExpenseForm;
