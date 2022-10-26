import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getDocument } from '../constants/queryHelpers';
import { db } from '../firebase';

import ChatComponent from '../components/ChatComponent';
import NewConvoComponent from '../components/NewConvoComponent';
import { chatActions } from '../store/chatSlice';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const currentUserID = useSelector((state) => state.auth.uid);
  const currentUsername = useSelector((state) => state.auth.username);
  const chatStateRefresh = useSelector((state) => state.chat.refreshing);
  const [activeChats, setActiveChats] = useState([]);

  const navigateOnClick = (roomID, roomName, chatType, users) => {
    dispatch(
      chatActions.enterRoom({
        roomID,
        chatType,
        users,
      })
    );
    navigation.navigate('Chat', { roomName });
  };

  const newConvoNavigation = () => {
    navigation.navigate('newConvo');
  };

  useEffect(async () => {
    try {
      const userDocument = await getDocument('users', currentUserID);

      const userDms = userDocument.dms;
      const userGroups = userDocument.groups;

      let activeChatsArr = [];

      for (const id of userDms) {
        if (!id) break;
        let otherUsersName;
        const dmDocument = await getDocument('directMessages', id);
        const users = dmDocument.users;

        // get display name through other user's id
        for (const user of users) {
          if (user.id !== currentUserID) {
            const userDoc = await getDocument('users', user.id);
            const displayName = userDoc.displayName;
            otherUsersName = displayName;
          }
        }
        // get last message sent in this room
        const messagesRef = collection(db, 'directMessages', id, 'messages');
        const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
        const messagesSnapshot = await getDocs(messagesQuery);

        const lastMsgSnapshot = messagesSnapshot.docs.pop();
        const lastMsg = lastMsgSnapshot.data();

        let lastSender;
        if (lastMsg.uid === currentUserID) lastSender = 'You';
        else lastSender = otherUsersName;

        const dmObj = {
          roomID: id,
          roomName: otherUsersName,
          chatType: 'DM',
          lastMessage: lastMsg,
          lastSender,
        };

        activeChatsArr.push(dmObj);
      }

      for (const id of userGroups) {
        if (!id) break;
        const groupDocument = await getDocument('groupMessages', id);
        const roomName = groupDocument.roomName;
        const users = groupDocument.users;

        let namedUsers = [{ id: currentUserID, displayName: currentUsername }];
        for (const user of users) {
          if (user.id !== currentUserID) {
            const userDoc = await getDocument('users', user.id);
            const displayName = userDoc.displayName;
            namedUsers.push({ id: user.id, displayName: displayName });
          }
        }

        const messagesRef = collection(db, 'groupMessages', id, 'messages');
        const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
        const messagesSnapshot = await getDocs(messagesQuery);

        const lastMsgSnapshot = messagesSnapshot.docs.pop();
        const lastMsg = lastMsgSnapshot.data();

        let lastSender;
        if (lastMsg.uid === currentUserID) lastSender = 'You';
        else {
          const senderDocument = await getDocument('users', lastMsg.uid);
          lastSender = senderDocument.displayName;
        }

        const groupObj = {
          roomID: id,
          roomName,
          chatType: 'Group',
          lastMessage: lastMsg,
          lastSender,
          users: namedUsers,
        };

        activeChatsArr.push(groupObj);
      }
      // sort by newest date and set state
      activeChatsArr.sort((a, b) => b.lastMessage.createdAt.seconds - a.lastMessage.createdAt.seconds);
      setActiveChats(activeChatsArr);
    } catch (err) {
      console.error('HomeScreen.js useEffect Error!', err);
    }
  }, [chatStateRefresh]);

  const renderChatComponent = (id, roomName, lastMsg, sender, chatType, users = roomName) => (
    <ChatComponent
      chatType={chatType}
      roomID={id}
      roomName={roomName}
      lastMessage={lastMsg}
      lastSender={sender}
      users={users}
      navigateOnClick={navigateOnClick}
    />
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.allChatsContainer}>
        <FlatList
          keyExtractor={(item) => item.roomID}
          data={activeChats}
          renderItem={({ item }) => renderChatComponent(item.roomID, item.roomName, item.lastMessage, item.lastSender, item.chatType, item.users)}
          ListFooterComponent={<NewConvoComponent newConvoNavigation={newConvoNavigation} />}
        />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
  },
  allChatsContainer: {
    flex: 15,
    backgroundColor: '#ffffff',
  },
});
