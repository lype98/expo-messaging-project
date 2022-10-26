import { Button } from 'react-native';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDocument } from 'react-firebase-hooks/firestore';

import { doc } from 'firebase/firestore';
import { db } from '../firebase';

import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import CreateGroupScreen from '../screens/chat/CreateGroupScreen';
import NewConvoScreen from '../screens/chat/NewConvoScreen';

import { chatActions } from '../store/chatSlice';
import { authActions } from '../store/authSlice';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth);

  const logOut = () => dispatch(authActions.logOut());
  // if user logged out, look for dummy path to avoid error
  const [snapshot, loading, error] = useDocument(doc(db, 'users', currentUser.uid || 'void'));

  useEffect(async () => {
    try {
      if (error) throw new Error(error.message);
      if (!loading) dispatch(chatActions.refresh());
    } catch (err) {
      console.error('Error in AppNavigation.js', err);
    }
  }, [snapshot]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <Button onPress={() => logOut()} title="Log out" />,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.roomName })} />
      <Stack.Screen name="AddGroup" component={CreateGroupScreen} options={{ title: 'Create Group' }} />
      <Stack.Screen name="newConvo" component={NewConvoScreen} options={{ title: 'Start a conversation' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
