import { 
  db, 
  collection, getDocs, deleteDoc, doc 
} from './firebase';

export const seedDatabase = async () => {
  // Database seeding disabled to use real registered professionals only.
  console.log('Seeding is now disabled.');
};

export const clearExampleData = async () => {
  try {
    const prosCol = collection(db, 'professionals');
    const snapshot = await getDocs(prosCol);
    for (const proDoc of snapshot.docs) {
      if (proDoc.id.startsWith('pro')) {
        await deleteDoc(doc(db, 'professionals', proDoc.id));
      }
    }
    console.log('Professionals cleared.');
  } catch (error) {
    console.error('Error clearing example data:', error);
  }
};
