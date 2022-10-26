import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { format, isToday, isYesterday, isThisWeek, isPast } from 'date-fns';

import { query, collection, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import avatar from '../assets/avatar1.jpg';
import { chatActions } from '../store/chatSlice';

const ChatComponent = (props) => {
  const dispatch = useDispatch();
  const [lastMessage, setLastMessage] = useState(props.lastMessage);

  const processDate = () => {
    const msgDate = new Date(lastMessage.createdAt.seconds * 1000);

    if (isToday(msgDate)) return format(msgDate, 'p');
    if (isYesterday(msgDate)) return 'Yesterday';
    // if this week and in the past, return weekday e.g. Monday
    if (isThisWeek(msgDate) && isPast(msgDate)) return format(msgDate, 'EEEE');
    else return msgDate.toLocaleDateString();
  };

  let chatTypeCollName = props.chatType === 'DM' ? 'directMessages' : props.chatType === 'Group' ? 'groupMessages' : null;
  const messagesRef = collection(db, chatTypeCollName, props.roomID, 'messages');

  useEffect(() => {
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      snapshot.docs.map((doc) => {
        setLastMessage(doc.data({ serverTimestamps: 'estimate' }));
      });
      dispatch(chatActions.refresh());
    });
    console.log(`${props.roomName} subscribed`);
    // onSnapshot function returns an unsubscribe function
    return () => {
      unsubscribe();
      console.log(`${props.roomName} unsubscribed`);
    };
  }, []);

  let lastMsgMaxSize = lastMessage.message;
  if (lastMessage.message.length > 80) lastMsgMaxSize = `${lastMessage.message.substring(0, 80)}...`;

  return (
    <TouchableOpacity style={styles.messageContainer} onPress={() => props.navigateOnClick(props.roomID, props.roomName, props.chatType, props.users)}>
      <Image style={styles.avatar} source={avatar} />

      <View style={styles.innerMessage}>
        <View style={styles.innerMessage_title}>
          <Text style={styles.title}>{props.roomName}</Text>
          <Text style={styles.timestamp}>{processDate()}</Text>
        </View>

        <Text style={styles.lastMessage}>{`${props.lastSender}: ${lastMsgMaxSize}`}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    paddingHorizontal: '5%',
    paddingTop: '5%',
  },
  avatar: {
    borderRadius: 50,
  },
  innerMessage: {
    flex: 1,
    paddingLeft: '2%',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  innerMessage_title: {
    flex: 2,
    flexDirection: 'row',
  },
  title: {
    flex: 1,
    fontSize: 22,
    textAlignVertical: 'bottom',
  },
  timestamp: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    textAlignVertical: 'bottom',
  },
  lastMessage: {
    flex: 3,
    fontSize: 16,
    textAlignVertical: 'center',
  },
});

export default ChatComponent;
