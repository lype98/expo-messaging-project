import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';

import { AntDesign } from '@expo/vector-icons';

const NewConvoComponent = (props) => {
  return (
    <TouchableOpacity style={styles.container} onPress={props.newConvoNavigation}>
      <View>
        <AntDesign name="pluscircleo" size={40} color="gray" />
      </View>
      <View>
        <Text style={styles.text}>Start new conversation</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  text: {
    fontSize: 20,
    color: 'gray',
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default NewConvoComponent;
