import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Card, Divider } from "react-native-paper";

interface PointHistoryItem {
  type: "earned" | "expired";
  date: string;
  points: number;
}

const pointsHistory: PointHistoryItem[] = [
  { type: "expired", date: "02-02-2025", points: -71 },
  { type: "earned", date: "06-01-2025", points: 649 },
  { type: "earned", date: "16-05-2024", points: 60 },
  { type: "earned", date: "15-05-2024", points: 346 },
  { type: "earned", date: "15-04-2024", points: 71 },
];

const MyPointsScreen = () => {
  const totalPoints = 1126;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My points</Text>
      <Text style={styles.points}>{totalPoints} points</Text>
      <Text style={styles.expiryText}>Points expire 365 days after they were earned</Text>
      
      <Text style={styles.sectionTitle}>Points history</Text>
      
      <FlatList
        data={pointsHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={[styles.pointType, item.type === "expired" && styles.expired]}>
                {item.type === "expired" ? "Expired" : "Earned"}
              </Text>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={[styles.pointsAmount, item.type === "expired" && styles.expired]}>
                {item.points}
              </Text>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    paddingBottom:10,
  },
  points: {
    fontSize: 37,
    fontWeight: "bold",
    marginTop: 5,
    paddingBottom:10,
    color: 'blue',
  },
  expiryText: {
    fontSize: 16,
    color: "gray",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    padding: 20,
    marginVertical: 6,
    backgroundColor: "white",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pointType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  expired: {
    color: "red",
  },
  date: {
    fontSize: 14,
    color: "gray",
  },
  pointsAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  rewardsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  rewardsText: {
    fontSize: 14,
    color: "gray",
  },
});

export default MyPointsScreen;
