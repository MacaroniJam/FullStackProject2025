import React, { useState } from 'react';
import {
    View,
    TextInput,
    Button,
    Alert
} from 'react-native';
import api from '../api';


export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = async () => {
        try {
            const res = await api.post('/login', { username, password });
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert('Login Failed');
        }
    };

    return (
        <View>
            <TextInput styles ={styles.TextInput}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput styles ={styles.TextInput}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button title="Login" styles ={styles.Button}
            onPress={login} />
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
