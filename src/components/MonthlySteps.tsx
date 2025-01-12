import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, Animated } from 'react-native';

const StepCountGrid: React.FC = () => {
  const days = 31;
  const values: { [key: string]: string } = {
    "1": "5000", "2": "7000", "3": "0", "4": "9000", "5": "10000",
    "6": "2000", "7": "6000", "8": "10000", "9": "3000", "10": "8000",
    "11": "0", "12": "7000", "13": "5000", "14": "6000", "15": "0",
    "16": "4000", "17": "9000", "18": "8000", "19": "10000", "20": "2000",
    "21": "7000", "22": "0", "23": "5000", "24": "10000", "25": "6000",
    "26": "3000", "27": "4000", "28": "9000", "29": "8000", "30": "10000",
    "31": "2000",
  };

  const colors = ['#b0b0b0', '#aac6ff', '#0043b8'];
  const columns = 7;
  const totalSquares = 35;
  const rows = Math.ceil(totalSquares / columns);

  const currentMonth = 'January';
  const screenWidth = Dimensions.get('window').width;
  const squareSize = screenWidth / columns - 22;

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [floatingMessage, setFloatingMessage] = useState<{ day: number; value: string } | null>(null);

  useEffect(() => {
    if (floatingMessage) {
      const timer = setTimeout(() => {
        setFloatingMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [floatingMessage]);

  const getContributionLevel = (value: number): number => {
    if (value === 0) return 0;
    const maxValue = 10000;
    const level = Math.min(colors.length - 1, Math.floor((value / maxValue) * (colors.length - 1)));
    return level;
  };

  const handleBoxClick = (day: number) => {
    const value = values[day.toString()] || '0';
    setFloatingMessage({ day, value });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{currentMonth}</Text>
      <View style={styles.weekdaysContainer}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>
      <View style={styles.gridContainer}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {Array.from({ length: columns }).map((_, colIndex) => {
              const dayIndex = rowIndex * columns + colIndex + 1;
              const value = dayIndex <= days ? values[dayIndex.toString()] || '0' : '0';
              const level = getContributionLevel(Number(value));

              return (
                <View key={`col-${colIndex}`} style={styles.cell}>
                  <View
                    style={[
                      styles.square,
                      {
                        backgroundColor: colors[level],
                        width: squareSize,
                        height: squareSize,
                      },
                    ]}
                    onStartShouldSetResponder={() => {
                      if (dayIndex <= days) handleBoxClick(dayIndex);
                      return true;
                    }}
                  >
                    {dayIndex <= days && <Text style={styles.dateText}>{dayIndex}</Text>}
                  </View>
                  {floatingMessage?.day === dayIndex && (
                    <View style={styles.floatingContainer}>
                      <View style={styles.floatingMessage}>
                        <Text style={styles.floatingText}>
                          Day {dayIndex}: {floatingMessage.value}
                        </Text>
                      </View>
                      <View style={styles.pointer} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
    marginTop: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#4A4A4A',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 5,
  },
  weekdayCell: {
    width: '13%',
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  gridContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginVertical: 1,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E6E9',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  floatingContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: -30,
    zIndex: 1,
  },
  floatingMessage: {
    backgroundColor: '#333',
    borderRadius: 6,
    padding: 5,
    paddingHorizontal: 1,
    width:"185%"
  },
  floatingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign:"center"
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#333',
    marginTop: -1,
    transform: [{ rotate: '180deg' }], // Rotate the triangle

  },
});

export default StepCountGrid;
