import React, { useEffect, useState } from "react";
import { 
    StyleSheet, 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    RefreshControl, 
    Dimensions, 
    ActivityIndicator, 
    ToastAndroid, 
    Image,
    TextInput
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import BottomNavBar from "../components/BottomNavBar";
import { useUser } from '../contexts/UserContext';
import LinearGradient from "react-native-linear-gradient";
import Icon from 'react-native-vector-icons/Ionicons';
import  SearchUsers from "../components/SearchBar"

const { width, height } = Dimensions.get("window");

interface Friend {
    user_id: string;
    friend_id: string;
    username: string;
    requester_name?: string;
    friendship_id?: number;
}

// --- Reusable Friend Card Component ---
// The props now expect simple functions with no arguments.
const FriendCard = ({ item, type, onAccept, onReject, onRemove }: { item: Friend, type: 'friend' | 'pending', onAccept?: () => void, onReject?: () => void, onRemove?: () => void }) => {
    const name = type === 'pending' ? item.requester_name : item.username;

    return (
        <View style={styles.card}>
            <Image 
                source={{ uri: `https://i.pravatar.cc/150?u=${item.user_id}` }} 
                style={styles.profilePic}
            />
            <Text style={styles.cardName}>{name}</Text>
            <View style={styles.actionButtons}>
                {type === 'pending' && onAccept && onReject && (
                    <>
                        {/* The onPress now calls the prop directly, without passing arguments */}
                        <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={onAccept}>
                            <Icon name="checkmark-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onReject}>
                            <Icon name="close-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </>
                )}
                {type === 'friend' && onRemove && (
                    <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onRemove}>
                        <Icon name="person-remove-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const Friends = ({ navigation }: NativeStackScreenProps<RootStackParamList, "Friends">) => {
    const [activeList, setActiveList] = useState<'Friends' | 'Pending'>("Friends");
    const { user } = useUser();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Data Fetching and Handling Logic ---
    const removeDuplicates = (array: any[], key: string | number) => {
        return array.filter((item, index, self) => 
            index === self.findIndex((t) => t[key] === item[key])
        );
    };
    
    const fetchFriends = async () => {
        try {
            const response = await fetch(`http://172.16.0.60:8002/get-friends?id=${user?.user_id}`);
            let data = await response.json();
            const uniqueFriends = removeDuplicates(data, "user_id");
            setFriends(uniqueFriends || []);
        } catch (error) {
            console.error("Error fetching friends list:", error);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await fetch(`http://172.16.0.60:8002/get-pending-requests?id=${user?.user_id}`);
            const data = await response.json();
            setPendingRequests(data || []);
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchFriends(), fetchPendingRequests()]);
        setLoading(false);
    };

    useEffect(() => {
        if (user?.user_id) {
            loadData();
        }
    }, [user]);

    const handleResponse = async (friendship_id: number, status: string) => {
        try {
            const response = await fetch(`http://172.16.0.60:8002/respond-request?id=${friendship_id}&status=${status}`);
            const result = await response.json();
            if (response.ok) {
                ToastAndroid.show(`Request ${status}`, ToastAndroid.SHORT);
                await loadData(); // Refresh both lists
            } else {
                console.error("Error responding to request:", result.detail);
            }
        } catch (error) {
            console.error("Error responding to request:", error);
        }
    };

    // Placeholder function for removing a friend
    const handleRemoveFriend = async (friend_id: string) => {
        // In a real app, you would call your API to remove the friend
        ToastAndroid.show(`Removing friend... (Not implemented)`, ToastAndroid.SHORT);
        console.log("Attempting to remove friend with ID:", friend_id);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const filteredFriends = friends.filter(friend => friend.username.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredRequests = pendingRequests.filter(req => req.requester_name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const ListContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#114D5B" style={{ marginTop: 50 }} />;
        }

        const data = activeList === 'Friends' ? filteredFriends : filteredRequests;
        const type = activeList === 'Friends' ? 'friend' : 'pending';

        if (data.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Icon name={activeList === 'Friends' ? "people-outline" : "mail-unread-outline"} size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                        {searchQuery ? `No results for "${searchQuery}"` : `No ${activeList.toLowerCase()} requests`}
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <FriendCard 
                        item={item} 
                        type={type}
                        // The logic is now handled here, passing the correct arguments to handleResponse
                        onAccept={() => handleResponse(item.friendship_id!, 'accepted')}
                        onReject={() => handleResponse(item.friendship_id!, 'rejected')}
                        onRemove={() => handleRemoveFriend(item.friend_id)}
                    />
                )}
                keyExtractor={(item, index) => `${item.user_id}_${index}`}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#114D5B"]} />}
            />
        );
    };

  return (
    <View style={{ flex: 1 }}>
        <LinearGradient colors={['#ffffff', '#D9F8FB']} style={styles.container}>
            <Text style={styles.title}>Friends</Text>

            {/* --- Tab Switcher --- */}
            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setActiveList("Friends")} style={[styles.tabButton, activeList === "Friends" && styles.tabButtonActive]}>
                    <Text style={[styles.tabText, activeList === "Friends" && styles.tabTextActive]}>My Friends ({friends.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveList("Pending")} style={[styles.tabButton, activeList === "Pending" && styles.tabButtonActive]}>
                    <Text style={[styles.tabText, activeList === "Pending" && styles.tabTextActive]}>Requests ({pendingRequests.length})</Text>
                </TouchableOpacity>
            </View>

            {/* --- Search Bar --- */}
            <SearchUsers />

            <ListContent />
        </LinearGradient>
        <BottomNavBar navigation={navigation} activeTab="Friends" setActiveTab={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#114D5B",
    textAlign: "center",
    marginVertical: height * 0.02,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 77, 91, 0.1)',
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#114D5B',
    shadowColor: "#114D5B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#114D5B',
  },
  tabTextActive: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#333',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  cardName: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  emptyText: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 15,
    fontStyle: "italic",
    textAlign: "center"
  },
});

export default Friends;
