import { Alert, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

import { authActions } from '../../store/authSlice';
import AuthenticationInput from '../../components/AuthenticationInput';

const LoginScreen = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const changeEmailHandler = (text) => {
    setEmail(text);
  };
  const changePasswordHandler = (text) => {
    setPassword(text);
  };
  const changeUsernameHandler = (text) => {
    setUsername(text);
  };

  const loginOnPress = async () => {
    try {
      const authentication = await signInWithEmailAndPassword(auth, email, password); // login
      const userID = authentication.user.uid;
      const fetchedUsername = authentication.user.displayName;

      dispatch(
        authActions.login({
          uid: userID,
          email,
          username: fetchedUsername,
        })
      );
    } catch (err) {
      Alert.alert('Error while registering!', `${err.message}`, ['Okay']);
    }
  };

  const registerOnPress = async () => {
    try {
      const authentication = await createUserWithEmailAndPassword(auth, email, password); // create user
      await updateProfile(auth.currentUser, { displayName: username }); // set username
      const userID = authentication.user.uid;

      await setDoc(doc(db, 'users', userID), {
        createdAt: serverTimestamp(),
        displayName: username,
        dms: [],
        groups: [],
      });

      dispatch(
        authActions.login({
          uid: userID,
          email,
          username,
        })
      );
    } catch (err) {
      Alert.alert('Error while registering!', `${err.message}`, ['Okay']);
    }
  };

  const registerModeSwap = () => {
    setIsRegistering((currState) => !currState);
  };

  return (
    <View style={styles.container}>
      <AuthenticationInput
        email={email}
        password={password}
        username={username}
        changeEmailHandler={changeEmailHandler}
        changePasswordHandler={changePasswordHandler}
        changeUsernameHandler={changeUsernameHandler}
        isRegistering={isRegistering}
        registerModeSwap={registerModeSwap}
        loginOnPress={loginOnPress}
        registerOnPress={registerOnPress}
      />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
