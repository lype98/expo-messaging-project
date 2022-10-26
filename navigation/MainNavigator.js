import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const MainNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth.email && auth.username && auth.uid) {
      setIsLoggedIn(true);
      console.log('User logged in: ', auth);
    } else {
      console.log('Main Navigator: User is signed off.');
      setIsLoggedIn(false);
    }
  }, [auth]);

  return <NavigationContainer>{isLoggedIn ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
};

export default MainNavigator;
