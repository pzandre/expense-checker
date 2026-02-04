import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Expense } from '../../services/api';

interface CategoryDoughnutProps {
  expenses: Expense[];
}

export default function CategoryDoughnut({ expenses }: CategoryDoughnutProps) {
  // Group expenses by category and sum amounts
  const categoryMap = new Map<string, number>();
  let totalAmount = 0;
  expenses.forEach((expense) => {
    const categoryName = expense.category_name || expense.category?.name || 'Unknown';
    const amount = parseFloat(expense.amount);
    categoryMap.set(
      categoryName,
      (categoryMap.get(categoryName) || 0) + amount
    );
    totalAmount += amount;
  });

  // Prepare data for chart
  const colors = [
    '#007AFF',
    '#34C759',
    '#FF9500',
    '#FF3B30',
    '#AF52DE',
    '#FF2D55',
    '#5AC8FA',
    '#FFCC00',
  ];

  const chartData = Array.from(categoryMap.entries()).map(
    ([name, value], index) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      amount: value,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    })
  );

  // Sort by amount descending for table
  const tableData = Array.from(categoryMap.entries())
    .map(([name, amount], index) => ({
      name,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;
  const chartHeight = 220;

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses by Category</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
          absolute
        />
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.categoryColumn]}>
            Category
          </Text>
          <Text style={[styles.tableHeaderText, styles.amountColumn]}>
            Amount
          </Text>
          <Text style={[styles.tableHeaderText, styles.percentageColumn]}>
            %
          </Text>
        </View>
        {tableData.map((item) => (
          <View key={item.name} style={styles.tableRow}>
            <View style={[styles.tableCell, styles.categoryColumn]}>
              <View style={styles.categoryCell}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: item.color },
                  ]}
                />
                <Text style={styles.categoryName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            </View>
            <Text style={[styles.tableCell, styles.amountColumn]}>
              {formatCurrency(item.amount)}
            </Text>
            <Text style={[styles.tableCell, styles.percentageColumn]}>
              {item.percentage.toFixed(1)}%
            </Text>
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
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  categoryColumn: {
    flex: 2,
  },
  amountColumn: {
    flex: 1,
    textAlign: 'right',
  },
  percentageColumn: {
    flex: 0.8,
    textAlign: 'right',
  },
  categoryCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
