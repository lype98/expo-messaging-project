import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useState } from 'react';

const UserSelection = (props) => {
  if (props.multiSelection) {
    const [toggleSelection, setToggleSelection] = useState(false);

    let containerStyle;
    if (toggleSelection) containerStyle = [styles.userContainer, styles.selected];
    else containerStyle = styles.userContainer;

    const longPressHandler = () => {
      setToggleSelection((prevSelection) => (prevSelection = !prevSelection));
      props.longPressHandler(props.id, props.name);
    };

    const unselectUser = () => {
      if (toggleSelection) {
        setToggleSelection(false);
        props.onPressHandler(props.id);
      }
    };

    return (
      <TouchableOpacity style={containerStyle} delayLongPress={250} onLongPress={longPressHandler} onPress={unselectUser}>
        <Text>{props.name}</Text>
      </TouchableOpacity>
    );
    // single, radio style selection
  } else {
    let containerStyle;
    if (props.selectedUser.id === props.id) containerStyle = [styles.userContainer, styles.selected];
    else containerStyle = styles.userContainer;

    const toggleSelectionOnClick = () => {
      props.onPress(props.id, props.name);
    };

    return (
      <TouchableOpacity style={containerStyle} delayLongPress={250} onPress={toggleSelectionOnClick}>
        <Text>{props.name}</Text>
      </TouchableOpacity>
    );
  }
};

export default UserSelection;

const styles = StyleSheet.create({
  userContainer: {
    marginTop: 10,
    paddingVertical: '10%',
    paddingHorizontal: '20%',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 10,
  },
  selected: {
    backgroundColor: 'paleturquoise',
  },
});
