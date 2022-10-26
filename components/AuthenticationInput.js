import { StyleSheet, TextInput, Button, View } from 'react-native';
import React from 'react';

const AuthenticationInput = (props) => {
  return (
    <View>
      <TextInput placeholder="Email" value={props.email} onChangeText={props.changeEmailHandler} />
      {props.isRegistering ? <TextInput placeholder="Username" value={props.username} onChangeText={props.changeUsernameHandler} /> : null}
      <TextInput placeholder="Password" value={props.password} secureTextEntry={true} onChangeText={props.changePasswordHandler} />
      {props.isRegistering ? <Button title="Register" onPress={props.registerOnPress} /> : <Button title="Login" onPress={props.loginOnPress} />}
      <Button title={props.isRegistering ? 'Login' : 'Register'} onPress={props.registerModeSwap} />
    </View>
  );
};

export default AuthenticationInput;

const styles = StyleSheet.create({});
