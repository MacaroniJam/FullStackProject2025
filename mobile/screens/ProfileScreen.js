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
import { FlatList } from 'react-native';
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


*/
export default function ProfileScreen({ navigation }) {
    const [books, setBooks] = useState([]); // Get books posted by user
    const [reviews, setReviews] = useState([]); // Get reviews posted by user
    const [filter, setFilter] = useState('1'); // Filter selectedId ('1' | '2' | '3')
    const [radioButtons, setRadioButtons] = useState([
        { id: '1', label: 'All', value: 'all', selected: true },
        { id: '2', label: 'Books', value: 'books' },
        { id: '3', label: 'Reviews', value: 'reviews' },
    ]);

   


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
                    <View style={styles.column}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{item.title}</Text>
                        <Text style={{ fontSize: 16, fontStyle: 'italic', marginBottom: 8 }}>by {item.author}</Text>
                        <Text style={{ fontSize: 14, marginBottom: 8 }}>Published: {item.Date_published}</Text>
                    </View>
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
                    <View style={styles.row}>
                        <View style={styles.leftAlign}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{item.book?.title}{" "}

                                <Text style={{fontSize: 14,fontWeight: 'nomral', fontStyle: 'italic'}}>
                                    by {item.book?.author}
                                    </Text> 

                                </Text>
                                
                            <Text style={{ fontSize: 15, fontStyle: 'italic' ,marginBottom: 8 }}>
                                {item.date} {item.time} 
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


                    </View>

                )}
            />
            </View>
            )}

        </View>
    );


    
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
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
    
});
