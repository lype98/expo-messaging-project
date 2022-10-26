import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Entypo } from '@expo/vector-icons';

import { collection, query, getDocs, addDoc, serverTimestamp, setDoc, doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import UserSelection from '../../components/UserSelection';
import { chatActions } from '../../store/chatSlice';

const CreateGroupScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const currUserID = useSelector((state) => state.auth.uid);
  const currUsername = useSelector((state) => state.auth.username);

  const groupNameHandler = (text) => setGroupName(text);

  const unselectUser = (id) => {
    setSelectedUsers((prevSelection) => prevSelection.filter((item) => item.id !== id));
  };

  const longPressHandler = (id, name) => {
    if (selectedUsers.find((item) => item.id === id)) return unselectUser(id);
    setSelectedUsers((prevUsers) => [...prevUsers, { id, name }]);
  };

  const submitHandler = async () => {
    if (selectedUsers.length === 0) {
      return Alert.alert(null, 'Please select at least 1 user.', [{ text: 'OK' }]);
    }
    if (groupName.trim().length === 0) {
      return Alert.alert(null, 'Please enter a group name.', [{ text: 'OK' }]);
    }
    // create a new document in groupMessages with createdAt, roomName and users
    try {
      const groupsRef = collection(db, 'groupMessages');

      const userSelectionPlusSelf = [{ id: currUserID, displayName: currUsername }, ...selectedUsers];
      const jointSelectionIDs = userSelectionPlusSelf.map((user) => ({ id: user.id }));

      const createGroup = await addDoc(groupsRef, {
        createdAt: serverTimestamp(),
        roomName: groupName,
        users: jointSelectionIDs,
      });
      // create the messages collection inside that group with a system message (collection can't be empty)
      const addedDoc = await createGroup;
      const sysMessageID = Math.random().toString(36).substring(2);

      const messageRef = doc(db, 'groupMessages', addedDoc.id, 'messages', `sys-${sysMessageID}`);
      await setDoc(messageRef, {
        createdAt: serverTimestamp(),
        key: sysMessageID,
        message: 'Group was created',
        uid: 'system',
      });
      // for every user submitted, go to their respective ID in 'users/' and add the new group ID in the groups array as a string
      for (const user of userSelectionPlusSelf) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          groups: arrayUnion(addedDoc.id),
        });
      }
      // navigate to the newly created group
      dispatch(
        chatActions.enterRoom({
          roomID: addedDoc.id,
          chatType: 'Group',
          users: userSelectionPlusSelf,
        })
      );
      navigation.navigate('Chat', { roomName: groupName });
    } catch (err) {
      console.error('CreateGroupScreen.js submitHandler Error!', err);
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
      console.error('CreateGroupScreen.js useEffect Error!', err);
    }
  }, []);

  const SelectionAmount = () => {
    if (selectedUsers.length === 1) return <Text>{`${selectedUsers.length} user selected.`}</Text>;
    if (selectedUsers.length > 1) return <Text>{`${selectedUsers.length} users selected.`}</Text>;
    else return null;
  };
  const renderUsers = (id, name) => <UserSelection multiSelection id={id} name={name} longPressHandler={longPressHandler} onPressHandler={unselectUser} />;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput placeholder="Group Name" value={groupName} onChangeText={(text) => groupNameHandler(text)} />
      </View>
      <SelectionAmount />
      <View>
        <FlatList data={users} renderItem={({ item }) => renderUsers(item.id, item.displayName)} />
      </View>
      <TouchableOpacity style={styles.addButtonContainer} onPress={submitHandler}>
        <Entypo name="squared-plus" size={60} color="green" />
      </TouchableOpacity>
    </View>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: '33%',
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: '5%',
    right: '5%',
  },
});
