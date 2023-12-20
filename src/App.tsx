import React, {useEffect, useState} from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { CENTER, LIBRARIES } from "./utils/constants";
import {addMark, changeMark, deleteAllMarks, deleteMark, getMarks} from './fireBase/fireBase'
import './App.scss';
import { MarkerType } from "./types/MarkerType";

const App = () => {
	const [markers, setMarkers] = useState<MarkerType[]>([])
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await getMarks()
				setMarkers(response)
			} catch (err) {
				throw err
			}
		}

		fetchData()
	}, []);

	const nextNumber = markers.length > 0 ? Math.max(...markers.map(marker => marker.no)) + 1 : 1;

	if (!process.env.REACT_APP_API_KEY) {
		throw new Error('Unable to get env variables')
	}

	const {isLoaded, loadError} = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_API_KEY,
		libraries: LIBRARIES,
	});


	if (loadError) {
		return <h1>Error loading maps</h1>;
	}

	if (!isLoaded) {
		return <h1>Loading maps</h1>;
	}

	const handleAddMarker = async (event: google.maps.MapMouseEvent) => {
		if (!event.latLng) {
			throw new Error('No coordinates after click')
		}

		const marker = {
			no: nextNumber,
			location: {
				lat: event.latLng.lat(),
				lng: event.latLng.lng(),
			}
		}

		try {
			await addMark(marker)
			setMarkers((prevState) => ([
				...prevState,
				marker,
			]))
		} catch (err) {
			throw err;
		}
	}

	const handleDeleteMarker = async (no: number) => {
		try {
			await deleteMark(no)
			setMarkers((prevState) => {
				const filteredMarkers = prevState.filter(marker => marker.no !== no)

				return filteredMarkers
			})
		} catch (err) {
			throw err
		}
	}

	const handleDragEnd = async (event: google.maps.MapMouseEvent, number: number) => {
		const newLocation = {
			lat: event.latLng?.lat() || 0,
			lng: event.latLng?.lng() || 0,
		}

		try {
			await changeMark({ no: number, location: newLocation})
			setMarkers((prevMarkers) =>
				prevMarkers.map((marker) =>
					marker.no === number
						? { ...marker, location: newLocation }
						: marker
				)
			);
		} catch (err) {
			throw err
		}
	}

	const handleDeleteAll = async () => {
		try {
			await deleteAllMarks()
			setMarkers([])
		} catch (err) {
			throw err;
		}
	}

	return (
		<>
			<header className={'header'}>
				<h1>Map</h1>
			</header>
			<main className={'main'}>
				<div className={'container'} >
					<GoogleMap
						mapContainerStyle={{width: '100%', height: '100%'}}
						zoom={10}
						center={CENTER}
						onClick={handleAddMarker}
					>
						{markers.map(({location, no}) => (
							<Marker
								key={no}
				        position={location}
								label={String(no)}
								onClick={() => handleDeleteMarker(no)}
								draggable
								onDragEnd={event => handleDragEnd(event, no)}
							/>
						))}
					</GoogleMap>
					<button onClick={handleDeleteAll}>Delete All</button>
				</div>
			</main>
			<footer className={'footer'}>
				<p>
					Developed by
					<a href={'https://github.com/kaavka'}>
						Bohdan Kava
					</a>
				</p>
			</footer>
		</>
	);
};

export default App;
