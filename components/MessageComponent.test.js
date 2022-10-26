import React from 'react';
import renderer from 'react-test-renderer';
import MessageComponent from './MessageComponent';
import { Provider } from 'react-redux';
import store from '../__mocks__/store/store-index';

const messageObj = {
  createdAt: {
    nanoseconds: 566000000,
    seconds: 1643977071,
  },
  key: 'zloV06XqRujF1RvmvvEx',
  message: 'C señoooooor',
  uid: 'kBp1Bvh2jIdPpnO8TfSiV59ZqtB2',
};

const dmTree = renderer.create(
  <Provider store={store}>
    <MessageComponent messageObj={messageObj} otherUser={'C señor'} chatType={'DM'} />
  </Provider>
);

const groupTree = renderer.create(
  <Provider store={store}>
    <MessageComponent messageObj={messageObj} otherUser={'Group Chat!'} chatType={'Group'} />
  </Provider>
);

it('renders with props', () => {
  expect(dmTree.toJSON()).toMatchSnapshot();
});

it('expects senderName to be C señor', () => {
  const msgTitle = dmTree.root.findByProps({ testID: 'msgTitle' }).props.children;
  expect(msgTitle).toBe('C señor');
});

it('expects group message sender to be C señor', () => {
  const msgTitle = groupTree.root.findByProps({ testID: 'msgTitle' }).props.children;
  expect(msgTitle).toBe('C señor');
});
