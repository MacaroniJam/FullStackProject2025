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

