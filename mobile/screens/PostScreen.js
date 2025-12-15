import React, { useState } from 'react';
import {
    View,
    TextInput,
    Button,
    Alert,
    StyleSheet,
    ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import api from '../api';
import StarRating from 'react-native-star-rating-widget';
import { Text } from 'react-native-gesture-handler';



/* DESIGN IDEA FOR POSTSCREEN
- Book Dropdown:
    - Dropdown to select book from list of books fetched from backend
    - Have option that has "Add New Book"

- New Book Input (if "Add New Book" selected):
    - Text input for book title
    - Text input for book author
    - Text input for publication date

- Review Input:
    - Text input area for writing review
    - Star rating input (1-5 stars)
*/

export default function PostScreen({ route, navigation }) {
    const initialSelected = route?.params?.bookId ?? null;
    const [books, setBooks] = useState([]); // List of books from backend
    const [selectedBook, setSelectedBook] = useState(initialSelected); // Selected book from dropdown
    const [newBookTitle, setNewBookTitle] = useState(''); // New book title input
    const [newBookAuthor, setNewBookAuthor] = useState(''); // New book author input
    const [newBookDate, setNewBookDate] = useState(''); // New book publication date input
    const [newBookDescription, setNewBookDescription] = useState(''); // New book description input
    const [reviewText, setReviewText] = useState(''); // Review text input
    const [starRating, setStarRating] = useState(0); // Star rating input

    const [userReviews, setUserReviews] = useState([]); // User's existing reviews

    // Fetch books from backend when component mounts
    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            const list = Array.isArray(res.data) ? res.data : [];
            setBooks(list);
        } catch (error) {
            console.log('Fetch books error:', error.response?.status, error.response?.data);
            setBooks([]);
        }
    };

    const fetchUserReviews = async () => {
        try {
            const res = await api.get('/profile/reviews');
            const list = Array.isArray(res.data) ? res.data : [];
            setUserReviews(list);
        } catch (error) {
            console.log('Fetch user reviews error:', error.response?.status, error.response?.data);
            setUserReviews([]);
        }
    };

    React.useEffect(() => {
        fetchBooks();
        fetchUserReviews();
    }, []);

    // If we arrived with a bookId param, ensure it's selected once books load
    React.useEffect(() => {
        if (route?.params?.bookId) {
            setSelectedBook(route.params.bookId);
        }
    }, [route?.params?.bookId, books.length]);

    // Post Book function for new book
    const postBook = async (title, author, date, description) => {
        try {
            const res = await api.post('/books', {
                title,
                author,
                Date_published: date,
                Description: description ?? ''
            });
            
            return res.data; // Return the newly created book
        } catch (error) {
            console.log('Post book error:', error.response?.status, error.response?.data);
            Alert.alert('Failed to post new book');
            fetchBooks(); // Refresh book list
            return null;
        }
    }

    const CheckNewBookInputs = () => {
        if (!newBookTitle || !newBookAuthor || !newBookDate) {
            Alert.alert('Please fill in all new book fields');
            return false;
        }
        return true;
    };

    const CheckReviewInputs = () => {
        if (!reviewText || starRating <= 0) {
            Alert.alert('Please write a review and select a star rating');
            return false;
        }
        return true;
    };

    const CheckIfUserReviewedBook = (bookId) => {
        return userReviews.some(review => review?.book?.id  === bookId);
    }

    // Post Review function
    const postReview = async (bookId, content, rating) => {
 
        // If adding new book, post the new book first
        if (bookId === 'new') {
            if (!CheckNewBookInputs()) {
                return;
            }
            const newBook = await postBook(newBookTitle, newBookAuthor, newBookDate, newBookDescription);
            if (!newBook) {
                return;
            }
            
            bookId = newBook.id;
            setSelectedBook(bookId);
        }
       

        if (!CheckReviewInputs()) {
            return;
        }

        if (CheckIfUserReviewedBook(bookId)) {
            Alert.alert('You have already reviewed this book');
            return;
        }


        try {
            const res = await api.post(`/books/${bookId}/reviews`, {
                content,
                rating,
            });
            Alert.alert('Review posted successfully');
            navigation.replace('Home');
            return res.data;
        } catch (error) {
            Alert.alert('Failed to post review');
            return null;
        }
    };

    return (
        <View>
        <ScrollView contentContainerStyle={styles.container}>
            {/* Book Dropdown */}
            <Picker style={styles.Picker}
                placeholder='Select a Book'
                selectedValue={selectedBook}
                onValueChange={(itemValue, itemIndex) =>
                    setSelectedBook(itemValue)
                }>
                {(Array.isArray(books) ? books : []).map((book, idx) => (
                    <Picker.Item label={book?.title} value={book?.id} key={book?.id} />
                ))}
                <Picker.Item label="-- Select a Book --" value={null} key="default" enabled={false} />
                <Picker.Item label="Add New Book" value="new" key="new" />
            </Picker>
            

            {/* New Book Input (if "Add New Book" selected) */}
            {selectedBook === 'new' && (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Book Title"
                        value={newBookTitle}
                        onChangeText={setNewBookTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Book Author"
                        value={newBookAuthor}
                        onChangeText={setNewBookAuthor}
                    />

                    <Text>Publication Date:</Text>
                    <Calendar
                    style={styles.Calendar}
                        onDayPress={(day) => setNewBookDate(day.dateString)}
                        markedDates={{
                            [newBookDate]: { selected: true, selectedColor: 'blue' }
                        }}
                    />
                    <TextInput
                        style={styles.largeText}
                        placeholder="Book Description"
                        value={newBookDescription}
                        onChangeText={setNewBookDescription}
                    />
                </View>
            )}

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
            
            </View>

            
            
        </ScrollView>
        <View style={styles.Footer}>
            <Button 
                title="Post Review"
                onPress={() => {
                    if (!selectedBook) {
                        Alert.alert('Please select a book');
                        return;
                    }
                    postReview(selectedBook, reviewText, starRating);
                }}
            />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 100, // To avoid overlap with footer
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
        marginBottom: 12,
    },

    Calendar: {
        width: 300,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'gray',
        height: 350
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
    },

    Picker: {
        height: 50,
        width: 300,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'gray',
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
});
