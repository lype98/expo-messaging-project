import { LogBox } from 'react-native';
import { Provider } from 'react-redux';
import MainNavigator from './navigation/MainNavigator';

import store from './store/store-index';

export default function App() {
  LogBox.ignoreLogs(['Setting a timer for a long period of time']);
  LogBox.ignoreLogs(['AsyncStorage has been']);

  return (
    <Provider store={store}>
      <MainNavigator />
    </Provider>
  );
}
