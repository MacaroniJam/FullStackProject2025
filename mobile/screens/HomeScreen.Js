import React, { useState, useEffect} from 'react';
import {
    View,
    TextInput,
    Button,
    Alert
} from 'react-native';
import api from '../api';
import { FlatList } from 'react-native/types_generated/index';


/* DESIGN IDEA FOR HOMESCREEN
- Top Section (Stays on screen while scrolling): 
    - Profile button top right corner
    - Welcome message with username
    - Filter/Search bar

- Middle Section:
    - List of books displayed in a scrollable view
    - Each book item shows title, author, Date published and average rating. If none available,
        show "No rating yet"
    - Each book item is clickable to view more details

- Bottom Section:
    - Plus Button to post a review
*/
export default function HomeScreen() {
    const [user, setUser] = useState(null); // Get current user info
    const [books, setBooks] = useState([]); // Get all books from backend

    const fetchUser = async () => {
        try {
            const res = await api.get('/profile');
            setUser(res.data);
        } catch (error) {
            Alert.alert('Failed to fetch user info');
        }
    };

    const fetchBooks = async () => {
            try {
                const res = await api.get('/books');
                setBooks(res.data);
            } catch (error) {
                Alert.alert('Failed to fetch books');
            }
    };


    useEffect(() => {
        fetchUser();
        fetchBooks();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>

                <Text> Welcome {user.username} </Text>
                <Button title="Profile" onPress={() => navigation.navigate('Profile Screen')} />

            </View>
            
            <FlatList>
                data={books}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View>
                        <View style={styles.leftAlign}>
                            <Text>{item.title} </Text>
                            <Text>By:{item.author} Published: {item.published_date}</Text>
                        </View>
                        <View style={styles.rightAlignCenter}>
                            {item.average_rating ? (
                                <Text> Average Rating: {item.average_rating} </Text>
                            ) : (
                                <Text> No ratings yet </Text>
                            )}
                        </View>
                    </View>

                    
                )}

            </FlatList>

        </View>

        
    );


    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
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
    }
});
