Prompt 1:
does this work?
# GET user profile
@app.get("/profile", dependencies=[Depends(auth.verify_token)])
def get_user(user: schemas.UserOut = Depends(get_current_user), db: Session = Depends(get_db)):
    return user

Prompt 2: 
How would I use this to get data for Books from fastapi?
const GetData = async () => {
        try {
            const res = await api.get('/data');
            Alert.alert('Data Retrieved');
        } catch (error) {
            Alert.alert('Failed to Retrieve Data');
        }
    };

Prompt 3:
backend-1  | INFO:     172.18.0.1:41978 - "POST /books/undefined/reviews HTTP/1.1" 422 Unprocessable Entity

Prompt 4:
{item.Average_rating != null ? ( <Text>Average Rating: {item.Average_rating}</Text> <Text>⭐</Text> ) : ( <Text>No ratings yet</Text> )} </View> </View> why does this throw an error

Prompt 5: How would i write a checkbox for a filter based on this description:
-checkbox for each star rating (1-5)
            - When checked, only show books with that rating.
              for example, if 4 is checked, only show books with average rating >=4 and <5
              if 4 and 5 are checked, show books with average rating >=4 and <=5
              if all is checked, show all books

Prompt 6: How do i change which books are shown based on checkbox selected

Prompt 7: How do i get the item book name and author if im using:
 <FlatList
                contentContainerStyle={styles.List}
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={styles.leftAlign}>
                            
                            <Text style={{ fontSize: 15, fontStyle: 'italic' ,marginBottom: 8 }}>
                                {item.date} {item.time} {item.Average_rating}⭐
                            </Text>

                            <Text style={{ fontSize: 15 ,marginBottom: 8 }}>
                                {item.content} 
                            </Text>

            
                            
                        </View>
                    </View>

                )}
            />

        </View>

Prompt 8: radiobuttons.map not a function

