import React, { useState, useEffect} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import api from '../api';
import { FlatList } from 'react-native';
import CheckBox from '@react-native-community/checkbox';


/* DESIGN IDEA FOR HOMESCREEN
- Top Section Header: 
    - Profile button top right corner
    - Welcome message with username
    - Filter
        -checkbox for each star rating (1-5)
            - When checked, only show books with that rating.
              for example, if 4 is checked, only show books with average rating >=4 and <5
              if 4 and 5 are checked, show books with average rating >=4 and <=5
              if all is checked, show all books


- Middle Section:
    - List of books displayed in a scrollable view
    - Each book item shows title, author, Date published and average rating. If none available,
        show "No rating yet"
    - Each book item is clickable to view more details

- Bottom Section Footer:
    - Plus Button to post a review
*/
export default function HomeScreen({ navigation }) {
    const [user, setUser] = useState(null); // Get current user info
    const [books, setBooks] = useState([]); // Get all books from backend
    const [filterRatings, setFilterRatings] = useState({
        all: true,
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
    }); // Star rating filters


    const fetchUser = async () => {
        try {
            const res = await api.get('/profile');
            setUser(res.data);
        } catch (error) {
            Alert.alert('Failed to fetch user info', error.response?.data?.detail ?? '');
            console.log('Profile error:', error.response?.status, error.response?.data);
        }
    };

    const fetchBooks = async () => {
            try {
                const res = await api.get('/books');
                setBooks(res.data);
            } catch (error) {
                console.log('Fetch books error:', error.response?.status, error.response?.data);
                
            }
    };


    const handleFilterChange = (rating) => {
        const updatedFilters = { ...filterRatings };

        if (rating === 'all') {
            const newValue = !updatedFilters.all;
            Object.keys(updatedFilters).forEach(key => {
                updatedFilters[key] = newValue;
            });
        } else {
            updatedFilters[rating] = !updatedFilters[rating];
            updatedFilters.all = false; // Uncheck "all" if any specific rating is changed
        }
        setFilterRatings(updatedFilters);
    };

    const filteredBooks = books.filter(book => {
        if (filterRatings.all) {
            return true; // Show all books
        }
        const avgRating = Math.floor(book.Average_rating); // Round down to nearest integer
        return filterRatings[avgRating];
    });


    useEffect(() => {
        fetchUser();
    }, []);

    // Refresh books when returning to Home (e.g., after delete)
    useFocusEffect(
        React.useCallback(() => {
            fetchBooks();
        }, [])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>

                <Text> Welcome {user?.username ?? ''} </Text>
                <Button title="Profile" onPress={() => navigation.navigate('Profile')} />

            </View>

            <View style={styles.filter}>
                <Text>Filter by Average Rating:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {['all', 1, 2, 3, 4, 5].map((rating) => (
                        <View key={rating} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                        <CheckBox
                            value={filterRatings[rating]}
                            onValueChange={() => handleFilterChange(rating)}
                        />
                        <Text>{rating === 'all' ? 'All' : `${rating}⭐`}</Text>
                        </View>
                    ))}
                </View>
                
            </View>
            
            <FlatList
                contentContainerStyle={styles.List}
                data={filteredBooks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('Book', { bookId: item.id });
                        }}
                        activeOpacity={0.7}
                        style={[
                            styles.row,
                            { backgroundColor: '#eef6ff' }
                        ]}
                    >
                        <View style={styles.leftAlign}>
                            <Text style={{ fontSize: 26, fontWeight:"bold" ,marginBottom: 8 }}>
                                {item.title} 
                            </Text>

                            <Text style={{ fontSize: 16, fontWeight: 'bold' ,marginBottom: 8 }}>
                                By: <Text style={{fontStyle: 'italic'}}>{item.author}</Text>
                            </Text>
                            <Text>Published on: {item.Date_published}</Text>
                        </View>
                        <View style={styles.rightAlignCenter}>
                            {item.Average_rating != null ? (
                                <Text style={{ fontSize: 26, fontWeight:"bold"}}>
                                    {item.Average_rating}⭐
                                    </Text>
                            ) : (
                                <Text style={{fontSize: 20}}>No ratings yet</Text>
                            )}
                        </View>
                    </TouchableOpacity>

                )}
            />

            <View style={styles.Footer}>
                <Button title="Post Review" onPress={() => navigation.navigate('Post')} />
            </View>

        </View>
    );


    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        position: 'absolute', 
        top: 0,             
        left: 0,             
        right: 0,             
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: '#000000'

    },
    filter :{
        marginTop: 60,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    List:{
        flexGrow: 1,
        paddingBottom: 60,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000000',
    },
    leftAlign: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    rightAlignCenter: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    Footer: {
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: 10, 
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#000000',

    }
});
