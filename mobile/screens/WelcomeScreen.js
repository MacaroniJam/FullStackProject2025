import React, { useState } from 'react';
import {
    View,
    TextInput,
    Button,
    Alert,
    StyleSheet
} from 'react-native';
import api from '../api';
import { Text } from 'react-native';



export default function WelcomeScreen({ navigation }) {

    return (
        <View style={styles.container}>
            <Text style ={styles.Text}>
                Welcome to the App!
            </Text>

            <Button title="Login" 
            onPress={() => navigation.navigate('Login')} />
            
            <View style ={styles.Button}>
                <Button title="Sign Up"
                onPress={() => navigation.navigate('SignUp')} />
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
    Text: {
        fontSize: 24,
        marginBottom: 20,
        fontweight: 'bold',
    },
    Button: {
        marginTop: 20,
    },
});