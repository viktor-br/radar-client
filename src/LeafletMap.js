import React, {Component, Fragment} from 'react';
import {Map, Marker, Popup, TileLayer} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const MovingMarkersList = (props) => {
    const items = props.markers.map(
        ({key, position, content}) => (
            <Marker key={key} position={position}>
                <Popup>{content}</Popup>
            </Marker>
        )
    );

    return <Fragment>{items}</Fragment>
};

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// export const pointerIcon = new L.Icon({
//     iconUrl: require('./assets/marker-icon.png'),
//     iconRetinaUrl: require('./assets/marker-icon.png'),
//     iconAnchor: [5, 55],
//     popupAnchor: [10, -44],
//     iconSize: [25, 55],
//     shadowUrl: '../assets/marker-shadow.png',
//     shadowSize: [68, 95],
//     shadowAnchor: [20, 92],
// });

class LeafletMap extends Component {
    constructor(props) {
        super(props);

        this.state = {
            longitude: props.longitude,
            latitude: props.latitude,
            zoom: props.zoom,
            markers: [],
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({markers: nextProps.markers});
    }

    render() {
        const position = [this.state.longitude, this.state.latitude];
        const attr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        return (
            <Map
                center={position}
                zoom={this.state.zoom}
                style={{width: '100%', height: '600px'}}
                onClick={this.addMarker}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution={attr}
                    id="mapbox.streets"
                />
                <MovingMarkersList markers={this.state.markers}/>
            </Map>
        )
    }
}

export default LeafletMap;
