import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Entypo, AntDesign } from '@expo/vector-icons';

import { collection, query, getDocs, addDoc, serverTimestamp, setDoc, doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import UserSelection from '../../components/UserSelection';
import { chatActions } from '../../store/chatSlice';

const NewConvoScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const currUserID = useSelector((state) => state.auth.uid);
  const currUsername = useSelector((state) => state.auth.username);

  const selectOnPress = (id, name) => {
    setSelectedUser({ id, name });
  };

  const addGroupNavigation = () => {
    navigation.navigate('AddGroup');
  };

  const submitHandler = async () => {
    if (Object.keys(selectedUser).length === 0) {
      return Alert.alert(null, 'Please select at least 1 user.', [{ text: 'OK' }]);
    }
    // create a new document in directMessages with createdAt and users
    try {
      const DMsRef = collection(db, 'directMessages');

      const userSelectionPlusSelf = [{ id: currUserID, displayName: currUsername }, selectedUser];
      const jointSelectionIDs = userSelectionPlusSelf.map((user) => ({ id: user.id }));

      // go through directMessages, if current + selected user exist in a DM, stop
      const DMsQuery = query(DMsRef);
      const DMsSnapshot = await getDocs(DMsQuery);

      for (const dm of DMsSnapshot.docs) {
        const findUserID = (userID) => dm.data().users.find((obj) => obj.id === userID);
        if (findUserID(currUserID) && findUserID(selectedUser.id)) {
          return Alert.alert(null, 'You already have an active conversation with this user!', [{ text: 'OK' }]);
        } else continue;
      }

      const addedDmDoc = await addDoc(DMsRef, {
        createdAt: serverTimestamp(),
        users: jointSelectionIDs,
      });
      // create the messages collection inside that DM with a system message (collection can't be empty)
      // const addedDoc = await createDM;
      const sysMessageID = Math.random().toString(36).substring(2);

      const messageRef = doc(db, 'directMessages', addedDmDoc.id, 'messages', `sys-${sysMessageID}`);
      await setDoc(messageRef, {
        createdAt: serverTimestamp(),
        key: sysMessageID,
        message: 'The start of a private conversation',
        uid: 'system',
      });
      // for every user submitted, go to their respective ID in 'users/' and add the new DM ID in the DMs array as a string
      for (const user of jointSelectionIDs) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          dms: arrayUnion(addedDmDoc.id),
        });
      }
      // navigate to the newly created DM
      dispatch(
        chatActions.enterRoom({
          roomID: addedDmDoc.id,
          chatType: 'DM',
          users: userSelectionPlusSelf,
        })
      );
      navigation.navigate('Chat', { roomName: selectedUser.name });
    } catch (err) {
      console.error('NewConvoScreen.js submitHandler Error!', err);
    }
  };

  useEffect(async () => {
    // fetches all other users from firebase and sets users state
    try {
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef);
      const usersSnapshot = await getDocs(usersQuery);
      const mappedSnapshot = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        displayName: doc.data().displayName,
        avatar: doc.data().avatar,
      }));
      const otherUsers = mappedSnapshot.filter((user) => user.id !== currUserID && user.id !== 'system');
      setUsers(otherUsers);
    } catch (err) {
      console.error('NewConvoScreen.js useEffect Error!', err);
    }
  }, []);

  const renderUsers = (id, name) => <UserSelection id={id} name={name} selectedUser={selectedUser} onPress={selectOnPress} />;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addGroupContainer} onPress={addGroupNavigation}>
        <AntDesign name="addusergroup" size={30} color="green" />
        <Text style={styles.addGroupText}>Add Group</Text>
      </TouchableOpacity>
      <View style={styles.usersContainer}>
        <FlatList data={users} renderItem={({ item }) => renderUsers(item.id, item.displayName)} />
      </View>
      <TouchableOpacity style={styles.addButtonContainer} onPress={submitHandler}>
        <Entypo name="squared-plus" size={60} color="green" />
      </TouchableOpacity>
    </View>
  );
};

export default NewConvoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: '10%',
  },
  addGroupContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginLeft: '10%',
    padding: '2%',
    backgroundColor: 'palegreen',
    borderRadius: 10,
  },
  addGroupText: {
    fontSize: 25,
    color: 'green',
  },
  usersContainer: {
    marginTop: '5%',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: '5%',
    right: '5%',
  },
});
