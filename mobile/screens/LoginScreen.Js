import React, { useState } from 'react';
import {
    View,
    TextInput,
    Button,
    Alert,
    StyleSheet
} from 'react-native';
import api from '../api';


export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = async () => {
        try {
            const res = await api.post('/login', { username, password });
            const accessToken = res?.data?.access_token;
            if (!accessToken) {
                throw new Error('No access_token in response');
            }
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            navigation.replace('Home');
        } catch (error) {
            Alert.alert('Login Failed');
        }
    };

    return (
        <View>
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
