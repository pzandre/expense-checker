import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Expense } from '../../services/api';

interface TimeSeriesChartProps {
  expenses: Expense[];
}

export default function TimeSeriesChart({ expenses }: TimeSeriesChartProps) {
  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  // Group expenses by date and category
  const dateCategoryMap = new Map<string, Map<string, number>>();
  const dateMap = new Map<string, number>();
  let totalAmount = 0;
  
  expenses.forEach((expense) => {
    const date = expense.date;
    const amount = parseFloat(expense.amount);
    const categoryName = expense.category_name || expense.category?.name || 'Unknown';
    
    dateMap.set(date, (dateMap.get(date) || 0) + amount);
    
    if (!dateCategoryMap.has(date)) {
      dateCategoryMap.set(date, new Map<string, number>());
    }
    const categoryMap = dateCategoryMap.get(date)!;
    categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
    
    totalAmount += amount;
  });

  // Sort dates and prepare data
  const sortedDates = Array.from(dateMap.keys()).sort();
  const labels = sortedDates.map((date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  const data = sortedDates.map((date) => dateMap.get(date) || 0);

  const chartData = {
    labels: labels.length > 7 ? labels.slice(-7) : labels,
    datasets: [
      {
        data: data.length > 7 ? data.slice(-7) : data,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;

  // Get all unique categories for color mapping
  const categorySet = new Set<string>();
  expenses.forEach((expense) => {
    const categoryName = expense.category_name || expense.category?.name || 'Unknown';
    categorySet.add(categoryName);
  });
  const sortedCategories = Array.from(categorySet).sort();
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

  // Prepare table data - show all dates with category breakdown
  const tableData = sortedDates.map((date) => {
    const d = new Date(date);
    const dateTotal = dateMap.get(date) || 0;
    const categoryMap = dateCategoryMap.get(date);
    const categories = sortedCategories
      .map((category, catIndex) => {
        const categoryTotal = categoryMap?.get(category) || 0;
        const percentage = dateTotal > 0 ? (categoryTotal / dateTotal) * 100 : 0;
        return {
          name: category,
          total: categoryTotal,
          percentage,
          color: colors[catIndex % colors.length],
        };
      })
      .filter((cat) => cat.total > 0)
      .sort((a, b) => b.total - a.total);

    return {
      date,
      dateLabel: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`,
      total: dateTotal,
      categories,
    };
  });

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses Over Time</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#007AFF',
            },
          }}
          bezier
          style={styles.chart}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withInnerLines={true}
          withOuterLines={true}
          withShadow={false}
        />
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.dateColumn]}>Date</Text>
          <Text style={[styles.tableHeaderText, styles.totalColumn]}>Total</Text>
          <Text style={[styles.tableHeaderText, styles.categoriesColumn]}>
            Categories
          </Text>
        </View>
        {tableData.map((row) => (
          <View key={row.date} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.dateColumn]}>
              {row.dateLabel}
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
  dateColumn: {
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
