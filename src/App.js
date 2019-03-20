import React, {Component} from 'react';
import './App.css';
import LeafletMap from './LeafletMap';
import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import gql from 'graphql-tag'
import {split} from 'apollo-link';
import {WebSocketLink} from 'apollo-link-ws';
import {getMainDefinition} from 'apollo-utilities';

const SERVER_HOST_PORT = process.env.REACT_APP_RADAR_SERVER_HOST + ':' + process.env.REACT_APP_RADAR_SERVER_PORT;

const wsLink = new WebSocketLink({
    uri: 'ws://' + SERVER_HOST_PORT + '/subscriptions',
    options: {
        reconnect: true
    }
});

const httpLink = new HttpLink({
    uri: 'http://' + SERVER_HOST_PORT + '/graphql',
});

const link = split(
    ({query}) => {
        const {kind, operation} = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
);

const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
});

const query = gql`
    { markers {key, position, content} }
`;

const updatedSubscription = gql`
  subscription updated {
    updated {
      key
      position
      content
    }
  }
`;

const removedSubscription = gql`
    subscription updated {
        removed {
            key
        }
    }
`;

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            longitude: 52.509419,
            latitude: 13.3892353,
            zoom: 13,
            markers: [],
        };
    };

    componentDidMount() {
        client.query({query: query}).then(
            (data) => {
                this.setState({markers: data.data.markers});
            }
        );

        client.subscribe({
            query: updatedSubscription,
        }).subscribe({
            next: (data) => {
                this.updateMarker(data.data.updated);
            },
            error(value) {
                console.log(value);
            }
        });

        client.subscribe({
            query: removedSubscription,
        }).subscribe({
            next: (data) => {
                this.removeMarker(data.data.removed);
            },
            error(value) {
                console.log(value);
            }
        });
    }

    updateMarker({key, position, content}) {
        let markers = this.state.markers;
        for (let i = 0; i < markers.length; i++) {
            if (markers[i].key === key) {
                markers[i].position = [position[0], position[1]];
                markers[i].content = content;

                this.setState({markers: markers});

                return;
            }
        }

        markers.push({key, position, content});
        this.setState({markers: markers});
    };

    removeMarker({key}) {
        let markers = this.state.markers;
        for (let i = 0; i < markers.length; i++) {
            if (markers[i].key === key) {
                markers.splice(i, 1);
                this.setState({markers: markers});

                return;
            }
        }
    }

    render() {
        return (
            <LeafletMap
                longitude={this.state.longitude}
                latitude={this.state.latitude}
                zoom={this.state.zoom}
                markers={this.state.markers}
            />
        );
    }
}

export default App;
