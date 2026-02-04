import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  datePeriod: string;
  categoryName: string;
  categoryTotal: number;
  percentage: number;
  totalAmount: number;
}

export default function Tooltip({
  visible,
  x,
  y,
  datePeriod,
  categoryName,
  categoryTotal,
  percentage,
  totalAmount,
}: TooltipProps) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.tooltip,
        Platform.select({
          web: {
            position: 'fixed' as any,
            left: x,
            top: y,
          },
          default: {
            left: x,
            top: y - 100,
          },
        }),
      ]}
      pointerEvents="none"
    >
      <View style={styles.tooltipContent}>
        <Text style={styles.tooltipTitle}>{datePeriod}</Text>
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipRow}>
          <Text style={styles.tooltipLabel}>Category:</Text>
          <Text style={styles.tooltipValue}>{categoryName}</Text>
        </View>
        <View style={styles.tooltipRow}>
          <Text style={styles.tooltipLabel}>Amount:</Text>
          <Text style={styles.tooltipValue}>${categoryTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.tooltipRow}>
          <Text style={styles.tooltipLabel}>Percentage:</Text>
          <Text style={styles.tooltipValue}>{percentage.toFixed(1)}%</Text>
        </View>
        <View style={styles.tooltipRow}>
          <Text style={styles.tooltipLabel}>Total:</Text>
          <Text style={styles.tooltipValue}>${totalAmount.toFixed(2)}</Text>
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
  },
  tooltipContent: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    minWidth: 180,
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
    marginBottom: 8,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tooltipLabel: {
    color: '#ccc',
    fontSize: 12,
    flex: 1,
  },
  tooltipValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
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
