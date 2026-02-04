import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { apiService, Expense, ExpenseCategory, ReportSummary } from '../../services/api';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import CategoryDoughnut from '../../components/charts/CategoryDoughnut';
import ExpenseBarChart from '../../components/charts/ExpenseBarChart';
import MultiCategorySelector from '../../components/MultiCategorySelector';
import DatePicker from '../../components/DatePicker';

export default function ReportsScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    loadReports();
  }, [dateFrom, dateTo, categoryIds]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;
      if (categoryIds.length > 0) {
        filters.category = categoryIds.join(',');
      }

      const [expensesData, summaryData] = await Promise.all([
        apiService.getExpenses(filters),
        apiService.getReports(filters),
      ]);

      // Ensure expensesData is an array
      const expensesArray = Array.isArray(expensesData) ? expensesData : [];
      setExpenses(expensesArray);
      setReportSummary(summaryData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setCategoryIds([]);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filtersContainer}>
        <Text style={styles.sectionTitle}>Filters</Text>

        <View style={styles.filterRow}>
          <View style={styles.filterField}>
            <DatePicker
              label="From Date"
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="Select start date"
            />
          </View>

          <View style={styles.filterField}>
            <DatePicker
              label="To Date"
              value={dateTo}
              onChange={setDateTo}
              placeholder="Select end date"
            />
          </View>
        </View>

        <View style={styles.filterField}>
          <Text style={styles.label}>Categories</Text>
          <MultiCategorySelector
            selectedIds={categoryIds}
            onSelect={setCategoryIds}
          />
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.label}>Group By</Text>
          <View style={styles.groupByContainer}>
            {(['day', 'week', 'month'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.groupByButton,
                  groupBy === option && styles.groupByButtonActive,
                ]}
                onPress={() => setGroupBy(option)}
              >
                <Text
                  style={[
                    styles.groupByButtonText,
                    groupBy === option && styles.groupByButtonTextActive,
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetFilters}
        >
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>

      {reportSummary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(reportSummary.total_amount)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Count</Text>
              <Text style={styles.summaryValue}>
                {reportSummary.total_count}
              </Text>
            </View>
          </View>
          {reportSummary.average_daily !== null && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Average Daily</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(reportSummary.average_daily)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      <TimeSeriesChart expenses={expenses} />
      <CategoryDoughnut expenses={expenses} />
      <ExpenseBarChart expenses={expenses} groupBy={groupBy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterField: {
    flex: 1,
    marginBottom: 16,
    ...Platform.select({
      web: {
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      },
    }),
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  groupByContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  groupByButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  groupByButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  groupByButtonText: {
    fontSize: 14,
    color: '#333',
  },
  groupByButtonTextActive: {
    color: '#fff',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
});
