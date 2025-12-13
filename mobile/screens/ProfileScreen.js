import React, { useState, useEffect, useMemo} from 'react';
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
import { FlatList, Modal } from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';


/* DESIGN IDEA FOR PROFILE SCREEN
- Filter Section:
    - Radio buttons:
        - All (books and reviews)
        - Books
        - Reviews


- Added Books Section:
    - List of books the user has added
    - Each Book item shows title, author, Date published
    - Horizontal Flatlist 

- Reviews Section:
    - List of reviews the user has posted
    - Each review item shows book title, review text, star rating
    - Vertical Flatlist

- Footer Section:
    - Update Profile Button
    - Delete Profile Button
        - Deletes user created books and reviews as well, then deletes user account

*/
export default function ProfileScreen({ navigation }) {
    const [books, setBooks] = useState([]); // Get books posted by user
    const [reviews, setReviews] = useState([]); // Get reviews posted by user
    const [selectedBookId, setSelectedBookId] = useState(null); // Selected book
    const [selectedReviewId, setSelectedReviewId] = useState(null); // Selected review
    const [filter, setFilter] = useState('1'); // Filter selectedId ('1' | '2' | '3')
    const [radioButtons, setRadioButtons] = useState([
        { id: '1', label: 'All', value: 'all', selected: true },
        { id: '2', label: 'Books', value: 'books' },
        { id: '3', label: 'Reviews', value: 'reviews' },
    ]);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Popup modal visibility
    const [editModalVisible, setEditModalVisible] = useState(false); // Edit profile modal visibility

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

   


    const fetchBooks = async () => {
        try {
            const res = await api.get('/profile/books');
            const list = Array.isArray(res.data) ? res.data : [];
            setBooks(list);
        }
        catch (error) {
            console.log('Fetch profile books error:', error.response?.status, error.response?.data);
            setBooks([]);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get('/profile/reviews');
            const list = Array.isArray(res.data) ? res.data : [];
            setReviews(list);
        }
        catch (error) {
            console.log('Fetch profile reviews error:', error.response?.status, error.response?.data);
            setReviews([]);
        }
    };

    const deleteUser = async () => {
        try {
            await api.delete('/profile');
            Alert.alert('Profile deleted successfully');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        } catch (error) {
            console.log('Delete profile error:', error.response?.status, error.response?.data);
            Alert.alert('Failed to delete profile');
        }
    };

    const updateUser = async () => {
        try {
            await api.put('/profile', { username, password });
            Alert.alert('Profile updated successfully');
            fetchBooks();
            fetchReviews();
        } catch (error) {
            console.log('Update profile error:', error.response?.status, error.response?.data);
            Alert.alert('Failed to update profile');
        }
    };

    
    useEffect(() => {
        fetchBooks();
        fetchReviews();
    }, []);
    
    


    return (
        <View style={styles.container}>
           
            <View style={styles.filter}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                    Filter:
                </Text>
                <RadioGroup
                    radioButtons={radioButtons}
                    onPress={setFilter}
                    selectedId={filter}
                    layout="row"
                />
            </View>

            {(filter === '1' || filter === '2') && (
            <View>
            <View style={styles.Title}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                    Books Added
                </Text>
            </View>
            
            
             <View style={styles.horizontalList}>
            <FlatList
                horizontal = {true}
                data={books}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Book', { bookId: item.id })}
                        activeOpacity={0.7}
                        style={[
                            styles.column,
                            selectedBookId === item.id && { backgroundColor: '#eef6ff' }
                        ]}
                    >
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{item.title}</Text>
                        <Text style={{ fontSize: 16, fontStyle: 'italic', marginBottom: 8 }}>by {item.author}</Text>
                        <Text style={{ fontSize: 14, marginBottom: 8 }}>Published: {item.Date_published}</Text>
                    </TouchableOpacity>
                )}
            />
            </View>
            </View>
            )}

            {(filter === '1' || filter === '3') && (
            <View>
            <View style={styles.Title}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                    Your Reviews
                </Text>
            </View> 
            
            <FlatList
                contentContainerStyle={styles.verticalList}
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Book', { bookId: item.book?.id })}
                        activeOpacity={0.7}
                        style={[
                            styles.row,
                            selectedReviewId === item.id && { backgroundColor: '#eef6ff' }
                        ]}
                    >
                        <View style={styles.leftAlign}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{item.book?.title}{" "}

                                <Text style={{fontSize: 14,fontWeight: 'nomral', fontStyle: 'italic'}}>
                                    by {item.book?.author}
                                    </Text> 

                                </Text>
                                
                            <Text style={{ fontSize: 15, fontStyle: 'italic' ,marginBottom: 8 }}>
                                {new Date(item.date).toLocaleDateString()}{"   "}
                                {new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })} 
                            </Text>

                            <Text style={{ fontSize: 14 ,marginBottom: 8 }}>
                                {item.content} 
                            </Text>
                          
                        </View>

                        <View style={styles.rightAlignTop}>
                            <Text style={{ fontSize: 26, fontWeight:"bold"}}>
                                {item.rating}⭐
                            </Text>
                        
                        </View>


                    </TouchableOpacity>

                )}
            />
            </View>
            )}

             <View style={styles.Footer}>
                <Button 
                    title="Update"
                    onPress={() => {
                        setEditModalVisible(true);
                    }}
                />
                <Button 
                    title="Delete"
                    onPress={() => setDeleteModalVisible(true)}
                />
            </View>

            <Modal
                transparent={true}
                visible={deleteModalVisible}
                animationType='none'
                
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.deleteModal}> 
                    <View style={styles.deleteModalContent}>
                        <Text style={{fontSize: 20, fontWeight: 'bold', padding: 20, textAlign: 'center'}}>
                            Are you sure you want to delete your profile</Text>
                        <View style={[styles.userActions, {marginTop: 10, gap:100, }]}>
                            <Button title="Yes" onPress={() => {
                                deleteUser();
                                setDeleteModalVisible(false);
                            }} />
                            <Button title="No" onPress={() => setDeleteModalVisible(false)} />
                    </View>
                    </View>
                    
                    
                </View>
            </Modal>

            <Modal
            visible={editModalVisible}
            animationType = 'none'
            onRequestClose={() => setEditModalVisible(false)}
        >
            <View style={styles.UpdateContainer}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, marginTop: 16 }}>
                    Edit Profile
                </Text>

                 <View style ={styles.TextInput}>
                    <TextInput 
                        placeholder="Username" 
                        onChangeText={setUsername} 
                    />
                </View>
    
                <View style ={styles.TextInput}>
                    <TextInput 
                        placeholder="Password"
                        secureTextEntry
                        onChangeText={setPassword}
                    />
                </View>

                <View style={styles.Footer}>
                    <Button 
                        title="Update"
                        onPress={() => {
                            updateUser();
                            setEditModalVisible(false);
                        }}
                    />
                    <Button 
                        title="Cancel"
                        onPress={() => setEditModalVisible(false)}
                    />
                </View>




            </View>
                

                

        </Modal>
            

        </View>
    );


    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filter :{
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    Title: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    horizontalList:{
        flexGrow: 1,
        width: '100%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000000',
    },
    verticalList:{
        flexGrow: 1,
        width: '100%',
        paddingBottom: 60,
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
    column: {
        flexDirection: 'column',
        justifyContent: 'center',
        height: 100,
        alignItems: 'center',
        padding: 12,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#000000',
    },
    leftAlign: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    rightAlignTop: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10, 
    },
    Footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        padding: 16,
        backgroundColor: 'white',
    },

    TextInput: {
        fontSize: 18,
        marginBottom: 12,
        width: '100%',
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
    },
    userActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    deleteModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },

    deleteModalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,

    },
    UpdateContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
        padding: 10,
        paddingBottom: 100, // To avoid overlap with footer
    },
    
});
