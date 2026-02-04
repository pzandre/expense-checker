import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface CategoryInfo {
  name: string;
  total: number;
  percentage: number;
  color: string;
}

interface StackedBarTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  datePeriod: string;
  categories: CategoryInfo[];
  totalAmount: number;
}

export default function StackedBarTooltip({
  visible,
  x,
  y,
  datePeriod,
  categories,
  totalAmount,
}: StackedBarTooltipProps) {
  if (!visible || categories.length === 0) return null;

  return (
    <View
      style={[
        styles.tooltip,
        {
          left: x,
          top: y - 150,
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.tooltipContent}>
        <Text style={styles.tooltipTitle}>{datePeriod}</Text>
        <View style={styles.tooltipDivider} />
        <ScrollView style={styles.categoriesList} nestedScrollEnabled>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <View
                  style={[
                    styles.categoryColor,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.categoryValues}>
                <Text style={styles.categoryAmount}>
                  ${category.total.toFixed(2)}
                </Text>
                <Text style={styles.categoryPercentage}>
                  {category.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.tooltipDivider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.tooltipArrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    zIndex: 1000,
    maxWidth: 250,
  },
  tooltipContent: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tooltipDivider: {
    height: 1,
    backgroundColor: '#555',
    marginVertical: 8,
  },
  categoriesList: {
    maxHeight: 200,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  categoryName: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  categoryValues: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryPercentage: {
    color: '#ccc',
    fontSize: 11,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
  },
  totalValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#333',
  },
});
