import React, { useState } from 'react';
import {
    View,
    TextInput,
    Button,
    Alert
} from 'react-native';
import api from '../api';
import React from 'react';
import { Text } from 'react-native/types_generated/index';
import { StyleSheet } from 'react-native/types_generated/index';


export default function WelcomeScreen({ navigation }) {

    return (
        <View style={styles.container}>
            <Text style ={styles.Text}>
                Welcome to the App!
            </Text>

            <Button title="Login" style={styles.Button} 
            onPress={() => navigation.navigate('Login')} />
            
            <Button title="Sign Up" style={styles.Button} 
            onPress={() => navigation.navigate('SignUp')} />
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
        marginTop: 10,
    },
});