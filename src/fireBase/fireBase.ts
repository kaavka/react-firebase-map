import {
	setDoc,
	writeBatch,
	updateDoc,
	deleteDoc,
	getDocs,
	doc,
	collection,
	serverTimestamp,
	getFirestore
} from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import {MarkerType} from "../types/MarkerType";

const firebaseConfig = {
	apiKey: "AIzaSyD-fXCSq8iVUJHgUjRjC_hVHwEi_JhXHSo",
	authDomain: "education-ad361.firebaseapp.com",
	projectId: "education-ad361",
	storageBucket: "education-ad361.appspot.com",
	messagingSenderId: "1056939489910",
	appId: "1:1056939489910:web:50d0cb0b3473b78fc1fd57",
	measurementId: "G-H1B6BV2ST8"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const marks = collection(firestore, 'marks')

export const getMarks = async () => {
	try {
		const querySnapshot = await getDocs(marks);
		const marksData: MarkerType[] = [];
		querySnapshot.forEach((doc) => {
			const { Location: location } = doc.data()
			const number = Number(doc.id.replace('Quest ', ''))
			marksData.push({ no: number, location });
		});
		return marksData;
	} catch (err) {
		throw err;
	}
};
export const addMark = async (mark: MarkerType) => {
	try {
		const markDoc = doc(marks, `Quest ${mark.no}`)
		const markFormatted = {
			Location: mark.location,
			Timestamp: serverTimestamp(),
		}
		await setDoc(markDoc, markFormatted)
	} catch (err) {
		throw err;
	}
}

export const deleteMark = async (number: number) => {
	try {
		const markDoc = doc(marks, `Quest ${number}`);
		await deleteDoc(markDoc);
	} catch (err) {
		throw err;
	}
};

export const changeMark = async (mark: MarkerType) => {
	try {
		const markDocId = `Quest ${mark.no}`;

		const markRef = doc(firestore, 'marks', markDocId);

		await updateDoc(markRef, {
			Location: mark.location,
			Timestamp: new Date(),
		});

	} catch (error) {
		console.error('Error updating marker:', error);
		throw error;
	}
};

export const deleteAllMarks = async () => {
	const firestore = getFirestore();
	const marksCollection = collection(firestore, 'marks');

	try {
		const marksSnapshot = await getDocs(marksCollection);

		const batch = writeBatch(firestore);

		marksSnapshot.forEach((document) => {
			const markDoc = doc(marksCollection, document.id);
			batch.delete(markDoc);
		});

		await batch.commit();
	} catch (error) {
		throw error;
	}
};

