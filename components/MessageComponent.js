import { StyleSheet, Text, View, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Video } from 'expo-av';

import avatar from '../assets/avatar1.jpg';

const MessageComponent = ({ messageObj, otherUser, chatType }) => {
  const currentUser = useSelector((state) => state.auth);
  const currentRoomUsers = useSelector((state) => state.chat.currentRoomUsers);
  const formattedTime = format(new Date(messageObj.createdAt.seconds * 1000), 'p');

  let senderName;
  let avatarJSX;
  let messageStyle = {};
  const isSystem = messageObj.uid === 'system';

  if (isSystem) {
    senderName = 'system';
    messageStyle = {
      container: 'sysContainer',
      title: '',
      message: 'sysMessage',
      msgText: 'sysMsgText',
      time: '',
    };
  } else if (messageObj.uid === currentUser.uid) {
    senderName = currentUser.username;
    messageStyle = {
      container: 'myContainer',
      title: 'myMsgTitle',
      message: 'myMessage',
      msgText: 'myMsgText',
      time: 'myTime',
    };
  } else {
    if (chatType === 'DM') senderName = otherUser;
    if (chatType === 'Group') {
      for (const user of currentRoomUsers) {
        if (user.id === messageObj.uid) senderName = user.displayName;
      }
    }
    messageStyle = {
      container: 'theirContainer',
      title: 'theirMsgTitle',
      message: 'theirMessage',
      msgText: 'theirMsgText',
      time: 'theirTime',
    };
  }

  if (messageStyle.message === 'theirMessage') {
    avatarJSX = <Image style={styles.avatar} source={avatar} />;
  }

  const DisplayMsgContent = () => {
    if (!messageObj.mediaType) {
      return <Text style={styles[`${messageStyle.msgText}`]}>{messageObj.message}</Text>;
    }
    if (messageObj.mediaType.substring(5, 0) === 'image') {
      return (
        <View style={{}}>
          <Image style={{}} source={{ uri: messageObj.src, width: 100, height: 100 }} />
        </View>
      );
    }
    if (messageObj.mediaType.substring(5, 0) === 'video') {
      return (
        <View style={{}}>
          <Video style={{ width: 200, height: 200 }} source={{ uri: messageObj.src }} useNativeControls isLooping resizeMode="contain" />
        </View>
      );
    } else {
      return <Text style={styles[`${messageStyle.msgText}`]}>File not supported</Text>;
    }
  };

  return (
    <View style={styles[`${messageStyle.container}`]}>
      {avatarJSX}
      <View>
        {!isSystem && (
          <Text testID="msgTitle" style={styles[`${messageStyle.title}`]}>
            {senderName}
          </Text>
        )}
        <View style={styles[`${messageStyle.message}`]}>
          <DisplayMsgContent />
          {!isSystem && <Text style={styles[`${messageStyle.time}`]}>{formattedTime}</Text>}
        </View>
      </View>
    </View>
  );
};

export default MessageComponent;

const styles = StyleSheet.create({
  myContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  theirContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMsgTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#153776',
    textAlign: 'right',
    paddingRight: '5%',
  },
  theirMsgTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#153776',
    textAlign: 'left',
    paddingLeft: '5%',
  },
  myMessage: {
    backgroundColor: '#67b2da',
    padding: '4%',
    margin: '2%',
    marginLeft: '20%',
    borderRadius: 10,
  },
  theirMessage: {
    justifyContent: 'space-between',
    backgroundColor: '#dcdcdc',
    marginLeft: '5%',
    padding: '4%',
    margin: '2%',
    marginRight: '20%',
    borderRadius: 10,
  },
  myMsgText: {
    fontSize: 16,
    color: 'white',
  },
  theirMsgText: {
    fontSize: 16,
    color: 'black',
  },
  myTime: {
    fontSize: 12,
    color: 'white',
    textAlign: 'right',
  },
  theirTime: {
    fontSize: 12,
    color: '#6a6a6a',
  },
  avatar: {
    borderRadius: 50,
    width: 60,
    height: 60,
    marginLeft: '1%',
  },
  // system messages
  sysContainer: {
    justifyContent: 'center',
    marginHorizontal: '15%',
  },
  sysMessage: {
    fontSize: 16,
    backgroundColor: 'aquamarine',
    padding: '4%',
    margin: '2%',
    borderRadius: 10,
  },
  sysMsgText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
