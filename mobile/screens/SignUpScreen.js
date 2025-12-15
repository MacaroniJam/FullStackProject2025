import React, { useState } from 'react';
import {
    View,
    TextInput,
    Button,
    Alert,
    StyleSheet
} from 'react-native';
import api from '../api';

export default function SignUpScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const signUp = async () => {
        try {
            await api.post('/signup', { username, password });
            Alert.alert('User Created');
            navigation.replace('Login');
        } catch {
            Alert.alert('Sign Up Failed');
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

            <View style ={styles.Button} >
                <Button 
                title="Sign Up" onPress={signUp} />
            </View>
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