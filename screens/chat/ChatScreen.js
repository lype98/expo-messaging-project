import { StyleSheet, View, TextInput, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Entypo } from '@expo/vector-icons';

import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

import MessageComponent from '../../components/MessageComponent';
// when in group chat use the users array in the chat redux state to pull the display name of the corresponding sender
const ChatScreen = ({ route }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [uploading, setUploading] = useState({ status: false, message: '' });
  const [key] = useState(Math.random().toString(36).substring(2));
  const chatState = useSelector((state) => state.chat);
  const currentUserID = useSelector((state) => state.auth.uid);

  let chatTypeCollName;
  if (chatState.currentRoomType === 'DM') chatTypeCollName = 'directMessages';
  if (chatState.currentRoomType === 'Group') chatTypeCollName = 'groupMessages';

  const messagesRef = collection(db, chatTypeCollName, chatState.currentRoomID, 'messages');

  const messageHandler = (text) => setMessage(text);

  const submitMessageHandler = async (contentType, payload) => {
    if (contentType === 'text') {
      await addDoc(messagesRef, {
        key: payload.key,
        createdAt: serverTimestamp(),
        message,
        uid: currentUserID,
      });
      setMessage('');
      console.log('message sent: ', message);
    }
    if (contentType === 'file') {
      await addDoc(messagesRef, {
        key: payload.key,
        createdAt: serverTimestamp(),
        mediaType: payload.mediaType,
        message: `<${payload.mediaType}>`,
        src: payload.src,
        uid: currentUserID,
      });
      setMessage('');
      console.log('message sent: ', message);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });
      if (!result.cancelled) {
        uploadFile(result.uri, key);
      }
    } catch (error) {
      console.error('pickImage error!', error);
    }
  };

  const uploadFile = async (uri, fileName) => {
    try {
      const uriResponse = await fetch(uri);
      const fileBlob = await uriResponse.blob();
      // Upload file and metadata to the object
      const storageRef = ref(storage, `${chatState.currentRoomID}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, fileBlob, { contentType: fileBlob._data.type });
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploading({ status: true, message: 'Upload is ' + progress + '% done' });
        },
        (error) => {
          setUploading({ status: false, message: '' });
          throw new Error(error);
        },
        () => {
          // Upload completed successfully, get Download URL and submit message
          setUploading({ status: false, message: '' });
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            submitMessageHandler('file', { key: key, mediaType: fileBlob._data.type, src: downloadURL });
          });
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(async () => {
    // ask for permissions
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('This app needs Media permissions to send files');
      }
    } catch (error) {
      Alert.alert(null, error.message, ['Okay']);
    }
  }, []);

  useEffect(() => {
    // connect to firebase and load messages
    const messagesQuery = query(messagesRef, orderBy('createdAt'), limit(50));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setChatMessages(
        snapshot.docs.map((doc) => {
          // estimate timestamp as it's null when message is sent initially
          const dataWithKey = { ...doc.data({ serverTimestamps: 'estimate' }), key: doc.id };
          return dataWithKey;
        })
      );
    });
    // onSnapshot function returns an unsubscribe function
    return () => {
      unsubscribe();
    };
  }, []);

  const UploadStatus = () => (
    <View style={styles.uploadStatusContainer}>
      <Text>{uploading.message}</Text>
    </View>
  );

  const renderMessageComponent = (messageObj) => (
    <MessageComponent messageObj={messageObj} otherUser={route.params.roomName} chatType={chatState.currentRoomType} />
  );

  // return <View style={styles.container}>{uploading.status && <UploadStatus />}</View>;
  return (
    <View style={styles.container}>
      <View style={styles.flatListContainer}>
        <FlatList contentContainerStyle={styles.flatList} data={chatMessages} renderItem={({ item }) => renderMessageComponent(item)} />
      </View>
      <View style={styles.footer}>
        {uploading.status && <UploadStatus />}
        <TouchableOpacity style={styles.iconContainer} onPress={pickImage}>
          <Entypo name="image" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message"
          onChangeText={messageHandler}
          value={message}
          multiline={true}
          blurOnSubmit={true}
          style={styles.msgBar}
          onSubmitEditing={() => submitMessageHandler('text', { key: key })}
        />
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContainer: {
    flex: 15,
  },
  flatList: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    paddingTop: '3%',
    paddingBottom: '5%',
    borderWidth: 1,
    borderColor: '#757575',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
  },
  msgBar: {
    width: '80%',
  },
  myMessage: {
    backgroundColor: '#0084ff',
    padding: '2%',
    marginLeft: '20%',
    marginRight: '2%',
    marginBottom: '2%',
    borderRadius: 10,
  },
  theirMessage: {
    backgroundColor: '#3e4042',
    padding: '2%',
    marginRight: '20%',
    marginLeft: '2%',
    marginBottom: '2%',
    borderRadius: 10,
  },
  iconContainer: {
    marginRight: '5%',
    marginLeft: '2%',
  },
  uploadStatusContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#757575',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'palegreen',
    bottom: 0,
  },
});
