import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { useUser } from '../contexts/UserContext';

const StepCountGrid: React.FC = () => {
    const { user } = useUser();
  
    const currentYear = new Date().getFullYear(); // Get the current year
    const currentMonth = new Date().getMonth(); // Get the current month (0-indexed)

    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Get the number of days in the month
    const columns = 7;
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // Get the weekday for the 1st day

    const rows = Math.ceil((daysInMonth + firstDayOfMonth) / columns); // Calculate rows dynamically
    const screenWidth = Dimensions.get('window').width;
    const squareSize = screenWidth / columns - 22;

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [values, setValues] = useState<{ [key: string]: string }>({});
    const [floatingMessage, setFloatingMessage] = useState<{ day: number; value: string } | null>(null);
    const [marginTop, setMarginTop] = useState(0); // State to hold marginTop value

    // Fetch data from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/monthly-steps?id=${user?.user_id}`);
                const data = await response.json();
                setValues(data);
            } catch (error) {
                console.error('Error fetching step data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (rows === 6) {
            setMarginTop(-13);
        } else {
            setMarginTop(0);
        }
        if (floatingMessage) {
            const timer = setTimeout(() => {
                setFloatingMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [floatingMessage]);

    const handleBoxClick = (day: number) => {
        const value = values[day.toString()] || '0';
        setFloatingMessage({ day, value });
    };

    if (!user) {
        return (
            <SafeAreaView style={[{ justifyContent: 'center', flex: 1, padding: 10, backgroundColor: '#2B2B2B' }]}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: "black", textAlign: 'center', marginTop: 10 }}>
                    Loading...
                </Text>
            </SafeAreaView>
        );
    }

    const getContributionLevel = (value: number): number => {
        const maxValue = user?.stepgoal || 10000; // Use a fallback max value if stepgoal is not available

        if (value === 0) return 0; // Grey for 0 steps
    
        const level = Math.min(4, Math.floor(((value / maxValue) * 4) + 0.99)); // Adding 0.5 for rounding up small values
        return level;
    };

    const colors = [
        '#b0b0b0', // Grey for 0 steps
        '#aac6ff', // Light blue for level 1
        '#76aaff', // Slightly darker blue for level 2
        '#428bff', // Darker blue for level 3
        '#0043b8', // Dark blue for level 4
    ]; // 5 levels of colors

    return (
        <View style={[styles.section, {marginTop}]}>
            <Text style={styles.title}>{`${currentMonthName} ${currentYear}`}</Text>
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
                            // Calculate the day for each box
                            const dayIndex = rowIndex * columns + colIndex;
                            const actualDay = dayIndex - firstDayOfMonth + 1;

                            // Show days if it's within the month range, else show grey
                            const value = actualDay > 0 && actualDay <= daysInMonth ? values[actualDay.toString()] || '0' : '0';
                            const level = getContributionLevel(Number(value));

                            return (
                                <View key={`col-${colIndex}`} style={styles.cell}>
                                    {/* Show grey for empty days */}
                                    {dayIndex >= firstDayOfMonth && actualDay <= daysInMonth && actualDay > 0 ? (
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
                                                if (actualDay <= daysInMonth) handleBoxClick(actualDay);
                                                return true;
                                            }}
                                        >
                                            <Text style={styles.dateText}>{actualDay}</Text>
                                        </View>
                                    ) : (
                                        <View
                                            style={[
                                                styles.square,
                                                {
                                                    backgroundColor: '#E2E6E9', // Grey for empty boxes
                                                    width: squareSize,
                                                    height: squareSize,
                                                },
                                            ]}
                                        />
                                    )}
                                    {floatingMessage?.day === actualDay && (
                                        <View style={styles.floatingContainer}>
                                            <View style={styles.floatingMessage}>
                                                <Text style={styles.floatingText}>
                                                    Day {actualDay}: {floatingMessage.value}
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
        width: '185%',
    },
    floatingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
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
        transform: [{ rotate: '180deg' }],
    },
});

export default StepCountGrid;
