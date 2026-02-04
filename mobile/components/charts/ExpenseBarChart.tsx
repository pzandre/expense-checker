import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';
import { Expense } from '../../services/api';

interface ExpenseBarChartProps {
  expenses: Expense[];
  groupBy: 'day' | 'week' | 'month';
}

export default function ExpenseBarChart({
  expenses,
  groupBy = 'month',
}: ExpenseBarChartProps) {
  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  // Group expenses by time period AND category
  const timeCategoryMap = new Map<string, Map<string, number>>();
  const categorySet = new Set<string>();

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    let timeKey: string;

    switch (groupBy) {
      case 'day':
        timeKey = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        timeKey = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
      default:
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    const categoryName = expense.category_name || expense.category?.name || 'Unknown';
    categorySet.add(categoryName);

    if (!timeCategoryMap.has(timeKey)) {
      timeCategoryMap.set(timeKey, new Map<string, number>());
    }

    const categoryMap = timeCategoryMap.get(timeKey)!;
    const amount = parseFloat(expense.amount);
    categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
  });

  // Sort time periods and categories
  const sortedTimeKeys = Array.from(timeCategoryMap.keys()).sort();
  const sortedCategories = Array.from(categorySet).sort();

  // Prepare labels
  const labels = sortedTimeKeys.map((key) => {
    if (groupBy === 'month') {
      const [year, month] = key.split('-');
      return `${month}/${year.slice(2)}`;
    }
    const d = new Date(key);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // Color palette for categories
  const colors = [
    '#007AFF',
    '#34C759',
    '#FF9500',
    '#FF3B30',
    '#AF52DE',
    '#FF2D55',
    '#5AC8FA',
    '#FFCC00',
    '#8E8E93',
    '#5856D6',
  ];

  // Prepare data for StackedBarChart
  const barData = sortedTimeKeys.map((timeKey) => {
    const categoryMap = timeCategoryMap.get(timeKey);
    return sortedCategories.map((category) => {
      const value = categoryMap?.get(category) || 0;
      return parseFloat(value.toFixed(2));
    });
  });

  // Limit to last 7 bars if there are more
  const displayLabels = labels.length > 7 ? labels.slice(-7) : labels;
  const displayBarData = barData.length > 7 ? barData.slice(-7) : barData;
  const displayTimeKeys = sortedTimeKeys.length > 7 ? sortedTimeKeys.slice(-7) : sortedTimeKeys;

  // Calculate total for each time period
  const timePeriodTotals = displayTimeKeys.map((timeKey) => {
    const categoryMap = timeCategoryMap.get(timeKey);
    let total = 0;
    categoryMap?.forEach((amount) => {
      total += amount;
    });
    return total;
  });

  const chartData = {
    labels: displayLabels,
    data: displayBarData,
    barColors: colors.slice(0, sortedCategories.length),
    legend: [] as string[], // Empty array to hide legend
  };

  const screenWidth = Dimensions.get('window').width;

  // Prepare table data
  const tableData = displayTimeKeys.map((timeKey, index) => {
    const categoryMap = timeCategoryMap.get(timeKey);
    const totalForPeriod = timePeriodTotals[index];
    const categories = sortedCategories
      .map((category, catIndex) => {
        const categoryTotal = categoryMap?.get(category) || 0;
        const percentage = totalForPeriod > 0 ? (categoryTotal / totalForPeriod) * 100 : 0;
        return {
          name: category,
          total: categoryTotal,
          percentage,
          color: colors[catIndex % colors.length],
        };
      })
      .filter((cat) => cat.total > 0)
      .sort((a, b) => b.total - a.total);

    let periodLabel: string;
    if (groupBy === 'month') {
      const [year, month] = timeKey.split('-');
      periodLabel = `${month}/${year}`;
    } else {
      const d = new Date(timeKey);
      periodLabel = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }

    return {
      period: displayLabels[index],
      periodLabel,
      total: totalForPeriod,
      categories,
    };
  });

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Expenses by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
      </Text>
      <View style={styles.chartContainer}>
        <StackedBarChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            formatTopBarValue: () => '',
            propsForBackgroundLines: {
              strokeDasharray: '',
            },
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
          yAxisLabel="$"
          yAxisSuffix=""
          withVerticalLabels={true}
          withHorizontalLabels={true}
          hideLegend={true}
        />
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.periodColumn]}>Period</Text>
          <Text style={[styles.tableHeaderText, styles.totalColumn]}>Total</Text>
          <Text style={[styles.tableHeaderText, styles.categoriesColumn]}>
            Categories
          </Text>
        </View>
        {tableData.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.periodColumn]}>
              {row.periodLabel}
            </Text>
            <Text style={[styles.tableCell, styles.totalColumn]}>
              {formatCurrency(row.total)}
            </Text>
            <View style={[styles.categoriesColumn]}>
              {row.categories.map((cat) => (
                <View key={cat.name} style={styles.categoryRow}>
                  <View style={styles.categoryCell}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: cat.color },
                      ]}
                    />
                    <Text style={styles.categoryText}>
                      {cat.name}: {formatCurrency(cat.total)} ({cat.percentage.toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  chartContainer: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  tableContainer: {
    marginTop: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  periodColumn: {
    flex: 1.2,
  },
  totalColumn: {
    flex: 1,
    textAlign: 'right',
  },
  categoriesColumn: {
    flex: 2,
    paddingLeft: 16,
  },
  categoryRow: {
    marginBottom: 4,
  },
  categoryCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
});
