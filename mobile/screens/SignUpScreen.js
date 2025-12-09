import React, { useState } from 'react';
import {
    View,
    TextInput,
    Button,
    Alert
} from 'react-native';
import api from '../api';

export default function SignUpScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const signUp = async () => {
        try {
            await api.post('/signup', { username, password });
            Alert.alert('User Created');
            navigation.navigate('Login');
        } catch {
            Alert.alert('Sign Up Failed');
        }
    };

    return (
        <View>
            <TextInput styles ={styles.TextInput} 
                placeholder="Username" 
                onChangeText={setUsername} 
            />

            <TextInput styles ={styles.TextInput}
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
            />
            <Button styles ={styles.Button}
            title="Sign Up" onPress={signUp} />
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
    TextInput: {
        fontSize: 18,
        marginBottom: 12,
        width: '100%',
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
    },
    Button: {
        marginTop: 10,
    },
});