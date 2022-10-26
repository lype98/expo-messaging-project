import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const getDocument = async (collection, id) => {
  const documentRef = doc(db, collection, id);
  const snapshot = await getDoc(documentRef);

  if (snapshot.exists()) return snapshot.data();
  else return Promise.reject(Error(`No such document: /${collection}/${id}`));
};
