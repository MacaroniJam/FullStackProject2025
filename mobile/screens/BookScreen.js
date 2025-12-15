import React, { useState, useEffect} from 'react';
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
import StarRating from 'react-native-star-rating-widget';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { FlatList, Modal } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

/* DESIGN IDEA FOR BOOKSCREEN
- Top Section:
    - When user selects a book from HomeScreen or ProfileScreen, navigate to BookScreen with bookId as parameter
    - Book title, author, publication date, description and rating in column format
    - If the user is the one who added the book, show an Edit and delete button for the book

- Middle Section:
    - List of reviews for the book in scrollable view
    - Each review item shows username, date and time published, review text, star rating
    - If the user has already reviewed the book, show an Edit and delete button for their review 
    
- Modal Popup:
    - When user clicks on Delete button for book or review, show a confirmation modal popup
    - "Are you sure you want to delete this book/review?" with Yes and No buttons
    - If Yes, call API to delete the book navigate back to previous screen
    - If Yes for review, call API to delete the review and refresh the reviews list
    - If No, close the modal

    -When user clicks on Edit button for book or review, show an edit modal popup
    - Book: Text inputs for title, author, publication date (with calendar picker), description
    - Review: Text input for review text, star rating input (1-5 stars)
    - Update and Cancel buttons
    - If Update, call API to update the book/review and refresh the details/reviews list
    - If Cancel, close the modal

*/

export default function BookScreen({ route, navigation }) {
    const { bookId } = route.params;

    const [book, setBook] = useState(null); // Book details
    const [reviews, setReviews] = useState([]); // Reviews for the book
    const [userReview, setUserReview] = useState(null); // User's review for the book
    const [user, setUser] = useState(null); // Current user info
    const [userCreated, setUserCreated] = useState(false); // Whether the user created the book
    
    const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Popup modal visibility
    const [deleteTarget, setDeleteTarget] = useState(null); // 'book' or 'review' for deletion

    const [editModalVisible, setEditModalVisible] = useState(false); // Edit modal visibility  
    const [editTarget, setEditTarget] = useState(null); // 'book' or 'review' for editing

    const [newBookTitle, setNewBookTitle] = useState(''); // New book title input
    const [newBookAuthor, setNewBookAuthor] = useState(''); // New book author input
    const [newBookDate, setNewBookDate] = useState(''); // New book publication date input
    const [newBookDescription, setNewBookDescription] = useState(''); // New book description input
    const [reviewText, setReviewText] = useState(''); // Review text input
    const [starRating, setStarRating] = useState(0); // Star rating input
    

    const fetchUser = async () => {
        try {
            const res = await api.get('/profile');
            setUser(res.data);
        } catch (error) {
            console.log('Profile error:', error.response?.status, error.response?.data);
        }
    };

    const fetchBookDetails = async () => {
        try {
            const res = await api.get(`/books/${bookId}`);
            setBook(res.data);
            setNewBookDate(new Date(res.data.Date_published).toISOString().split('T')[0]);
        } catch (error) {
            console.log('Fetch book details error:', error.response?.status, error.response?.data);
        }
    };

    const fetchBookReviews = async () => {

        try {
            const res = await api.get(`/books/${bookId}/reviews`);
            let list = Array.isArray(res.data) ? res.data : [];
            const userId = user?.id;
            const userRev = list.find(review => review.user_id === user?.id) || null;

            list = list.filter(review => review.user_id !== userId);

            
            if (user.id === book.creator_id) {
                setUserCreated(true);
            }
            setReviews(list);
            setUserReview(userRev || null);

        } catch (error) {
            console.log('Fetch book reviews error:', error.response?.status, error.response?.data);
        }
    };

    // Load user and book first
    useEffect(() => {
        fetchUser();
        fetchBookDetails();
    }, [bookId]);

    // Once user is available, fetch reviews
    useEffect(() => {
        if (user) {
            fetchBookReviews();
        }
    }, [user, bookId]);

    useFocusEffect(
        React.useCallback(() => {
            fetchUser();
            fetchBookDetails();
            fetchBookReviews();
        }, [])
    );

    const deleteTargetItem = () => {
        if (deleteTarget === 'book') {
            try {
                api.delete(`/profile/books/${bookId}`);
                navigation.goBack();
            }
            catch (error) {
                console.log('Delete book error:', error.response?.status, error.response?.data);
                return;
            }
        }
        else if (deleteTarget === 'review') {
            try {
                api.delete(`/reviews/${userReview.id}`);
                setUserReview(null);
                fetchBookReviews();
            }
            catch (error) {
                console.log('Delete review error:', error.response?.status, error.response?.data);
                return;
            }
        }
    };


    const updateBook = async (bookId, title, author, date, description) => {
        try {
            const res = await api.put(`/profile/books/${bookId}`, {
                title,
                author,
                Date_published: date,
                Description: description ?? ''
            });
            // Merge server response into existing book while persisting id and stable fields
            setBook(prev => ({
                ...(prev ?? {}),
                ...(res?.data ?? {}),
                id: prev?.id,
                creator_id: prev?.creator_id,
            }));
            
            // Optionally refetch to ensure we have freshest data from server
            fetchBookDetails();
        } catch (error) {
            console.log('Update book error:', error.response?.status, error.response?.data);
            Alert.alert('Failed to update book');
        }
    };

    const updateReview = async (content, rating) => {
        try {
            const res = await api.put(`/reviews/${userReview.id}`, {
                content,
                rating
            });
            // Merge server response while persisting existing identifiers
            setUserReview(prev => ({
                ...(prev ?? {}),
                ...(res?.data ?? {}),
                id: prev?.id,
                user_id: prev?.user_id,
                book_id: prev?.book_id,
            }));

            fetchBookReviews();
        } catch (error) {
            console.log('Update review error:', error.response?.status, error.response?.data);
            Alert.alert('Failed to update review');
        }
    };



    return (
        <View style={{flex: 1}}>
        <FlatList contentContainerStyle={styles.container}  
            
            ListHeaderComponent={
                <View >
                <View style={styles.bookDetails}> 

                    <Text style={{fontSize: 50, fontWeight:'bold'}}> 
                        {book?.title}
                    </Text>


                    <Text style={{fontSize: 24}}>by
                        <Text style={{fontStyle: 'italic', fontWeight:'bold'}}> {book?.author}</Text>
                        </Text> 

                    <Text style={{fontSize: 18, fontStyle: 'italic', marginTop: 10}}>
                        Published: {new Date(book?.Date_published).toLocaleDateString()}
                        </Text>

                    <Text style={{fontSize: 18, marginTop: 10}}>{book?.Description}</Text>

                    {book?.Average_rating != null ? (
                        <Text style={{fontSize: 40, marginTop: 10, fontWeight:'bold'}}>{book?.Average_rating}⭐</Text>
                    ) : (
                        <Text style={{fontSize: 20, marginTop: 10}}>No ratings yet</Text>
                    )

                    }
                    
                    <View>
                    {userCreated && (
                        <View style={[styles.userActions, {marginTop: 20}]} >
                            <Button title="Edit" onPress={() => {
                                setEditTarget('book');
                                setEditModalVisible(true);
                            }} />
                            <Button title="Delete" onPress={() => {
                                setDeleteTarget('book');
                                setDeleteModalVisible(true);
                            }} /> 
                        </View>
                    )}


                </View>
                </View>

                
                </View>
            }

            data={userReview ? [userReview, ...reviews] : reviews}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.row}> 

                    <View style={styles.leftAlign}>

                        <Text style={{fontSize: 30, fontWeight:'bold'}}>
                            {item.user?.username}
                        </Text>

                        <Text style={{fontSize: 16, fontStyle: 'italic'}}>{new Date(`${item.date}T${item.time}Z`).toLocaleDateString()}{"   "}
                                {new Date(`${item.date}T${item.time}Z`).toLocaleTimeString([], {
                                timeZone: 'America/New_York',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })} 
                        </Text>
                        <Text style={{fontSize: 20, marginTop: 4}}>{item.content}</Text>
                    </View>

                    <View style={styles.rightAlignTop}>
                        <Text style={{fontSize: 25, fontWeight:'bold'}} >{item.rating}⭐</Text>
                        {(user.id === item.user_id) && (
                            <View style={styles.userActions}>
                                <Button title="Edit " onPress={() => {
                                    setEditTarget('review');
                                    setEditModalVisible(true);
                                }} />
                                <Button title="Delete" onPress={() => {
                                    setDeleteTarget('review');
                                    setDeleteModalVisible(true);
                                }} />
                            </View>
                        )}

                        
                    </View>
                    
                    
                    </View>
            )}
             
            

        />

        <View>
            {(userReview == null) && (


                <View style = {styles.PostReviewButton }>
                    <Button title="Post Review" onPress={() => navigation.navigate('Post', { bookId })} />

                </View>
            )}
                
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
                        Are you sure you want to delete this?</Text>
                    <View style={[styles.userActions, {marginTop: 10, gap:100, }]}>
                        <Button title="Yes" onPress={() => {
                            deleteTargetItem();
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
            <View style={styles.container}>
                {editTarget === 'book' && (
                    <View style={styles.BookUpdateContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder= {book?.title}
                        value={newBookTitle}
                        onChangeText={setNewBookTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder= {book?.author}
                        value={newBookAuthor}
                        onChangeText={setNewBookAuthor}
                    />

                    <Text>Publication Date:</Text>
                    <Calendar
                    style={styles.Calendar}
                    current={newBookDate}
                        onDayPress={(day) => setNewBookDate(day.dateString)}
                        markedDates={{
                            [newBookDate]: { selected: true, selectedColor: 'blue' }
                        }}
                    />
                    <TextInput
                        style={styles.largeText}
                        placeholder= {book?.Description}
                        value={newBookDescription}
                        onChangeText={setNewBookDescription}
                    />

                    <View style={styles.Footer}>
                        <Button 
                            title="Update"
                            onPress={() => {
                                updateBook(bookId, newBookTitle, newBookAuthor, newBookDate, newBookDescription);
                                setEditModalVisible(false);
                            }}
                        />
                        <Button 
                            title="Cancel"
                            onPress={() => setEditModalVisible(false)}
                        />
                    </View>
                </View>
                    
                    
                )}

                {editTarget === 'review' && (
                    <View style={styles.ReviewContainer}>

                    {/* Review Input */}
                    <TextInput
                        style={styles.largeText}
                        placeholder="Write your review"
                        value={reviewText}
                        onChangeText={setReviewText}
                        multiline
                    />

                    <View style={styles.StarRating}>

                    <Text
                        style={{ fontSize: 16, marginBottom: 8 }}
                    > Star Rating: </Text>

                    <StarRating 
                        rating={starRating}
                        onChange={setStarRating}
                        starSize={50}
                        step='full'
                    />

                    </View>

                    <View style={styles.Footer}>
                        <Button 
                            title="Update"
                            onPress={() => {
                                updateReview(reviewText, starRating);
                                setEditModalVisible(false);
                            }}
                        />
                        <Button 
                            title="Cancel"
                            onPress={() => setEditModalVisible(false)}
                        />
                    </View>

            
            </View>
                )}



            </View>

        </Modal>
        </View>

        
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    bookDetails: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 16,
    },
    userActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
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
    rightAlignTop: {
        alignSelf: 'flex-start',    
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
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
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        width: 300,
    },

    largeText: {
        height: 150,
        width: 300,
        borderColor: 'gray',
        borderWidth: 1,
    },
    Calendar: {
        width: 300,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'gray',
        height: 350
    },
    BookUpdateContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
        padding: 10,
        paddingBottom: 100, // To avoid overlap with footer
    },
    ReviewContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        width: '100%',
        padding: 10,
    },
    StarRating: {
        alignItems: 'center',
        marginTop: 20,
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
    PostReviewButton: {
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: 10, 
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#000000',
    },
});

