Prompt 1:
does this work?
# GET user profile
@app.get("/profile", dependencies=[Depends(auth.verify_token)])
def get_user(user: schemas.UserOut = Depends(get_current_user), db: Session = Depends(get_db)):
    return user


