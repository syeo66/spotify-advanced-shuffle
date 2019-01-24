import React, { Component } from 'react';
import { connect } from 'react-redux';
import { retrievePlaylists } from '../actions';
import db from '../database';

class ShuffleButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            shuffleIsLoading: false,
        };
    }

    componentDidMount() {
        this.startShuffle = this.startShuffle.bind(this);
    }

    startShuffle(event) {
        event.preventDefault();
        this.setState({...this.state, shuffleIsLoading: true});
        const existingPlaylist = this.props.playlists.reduce((accumulator, currentValue) => {
            return accumulator || (currentValue.name == this.props.config.randomListName ? currentValue : null);
        }, null);
        if (!existingPlaylist) {
            this.createRandomPlaylist(this.props.authenticated).then(playlist => {
                this.fillRandomPlaylist(playlist)
            });
            return;
        }
        this.purgeRandomPlaylist(existingPlaylist).then(playlist => {
            this.fillRandomPlaylist(playlist);
        });
    }

    purgeRandomPlaylist(playlist) {
        return new Promise((resolve, reject) => {
            if (!this.props.config.purgeOnShuffle) {
                resolve(playlist);
                return;
            }
            const authenticated = this.props.authenticated;
            const preparePurge = (url, uris = []) => {
                return new Promise((resolve, reject) => {
                    if (!url) {
                        resolve(uris);
                        return;
                    }
                    fetch(url, {
                        method: 'get',
                        headers: new Headers({
                            'Authorization': 'Bearer '+authenticated
                        })
                    })
                    .then(response => response.json())
                    .then(async response => {
                        const responseUris = response.items.map(element => {
                            return {uri:element.track.uri};
                        });
                        const trackUris = await preparePurge(response.next, [...uris, ...responseUris]);
                        resolve(trackUris);
                    });
                });
            }
            preparePurge(playlist.tracks.href).then(trackUris => {
                const chunks = this.chunkArray(trackUris, 100);
                const removeChunk = chunks => {
                    return new Promise((resolve, reject) => {
                        const chunk = chunks.slice(0,1)[0];
                        const chunksLeft = chunks.slice(1,chunks.length);
                        if (!chunks || chunks.length == 0) {
                            resolve();
                            return;
                        }
                        this.purgePlaylistTracks(playlist, chunk)
                            .then(_ => {
                                removeChunk(chunksLeft).then(_ => resolve());
                            });
                    });
                };
                removeChunk(chunks).then(_ => resolve(playlist));
            });
        });
    }

    purgePlaylistTracks(playlist, trackUris) {
        return new Promise((resolve, reject) => {
            const authenticated = this.props.authenticated;
            const playlistId = playlist.id;
            const url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks";
            if (!trackUris || trackUris.length == 0) {
                resolve();
                return;
            }
            fetch(url, {
                method: 'delete',
                headers: new Headers({
                    'Authorization': 'Bearer '+authenticated
                }),
                body: JSON.stringify({
                    tracks: trackUris,
                })
            })
            .then(response => response.json())
            .then(response => {
                resolve();
            });
        });
    }

    createRandomPlaylist(authenticated) {
        return new Promise((resolve, reject) => {
            const url = "https://api.spotify.com/v1/me/playlists";
            fetch(url, { 
                method: 'post', 
                headers: new Headers({
                    'Authorization': 'Bearer '+authenticated
                }),
                body: JSON.stringify({
                    name: this.props.config.randomListName, 
                    description: 'Spotify Advanced Shuffle Helper Playlist',
                    public: false,
                })
            })
            .then(response => response.json())
            .then(response => {
                resolve(response);
            });
        });
    }

    fillRandomPlaylist(playlist) {
        const trackCount = this.props.config.amountType == 'minutes' 
            ? Math.round(this.props.config.trackMinutes / 2)
            : this.props.config.trackCount;
        const count = Math.min(Math.round(trackCount * 1.1), 1024);
        fetch('https://qrng.anu.edu.au/API/jsonI.php?length='+count+'&type=uint16')
            .then(response => response.json())
            .then(numbers => {
                db.tracks.toArray(library => {
                    let minutes = 0;
                    const normaled = numbers.data.map(number => {
                        return number % library.length;
                    });
                    const slices = this.chunkArray([...new Set(normaled)].slice(0, trackCount), 100);
                    slices.forEach(chunk => {
                        if (this.props.config.amountType == 'minutes'
                            && minutes >= this.props.config.trackMinutes) {
                            return;
                        }
                        let tracks = chunk.map(number => {
                            if (this.props.config.amountType == 'minutes'
                                && minutes >= this.props.config.trackMinutes) {
                                return;
                            }
                            minutes += library[number].duration_ms / 60000;
                            return library[number].uri;
                        }).filter(el => el != null);
                        this.addRandomTracks(playlist, tracks);
                    });
                });
            });
    }

    chunkArray(myArray, chunk_size){
        var results = [];
        
        while (myArray.length) {
            results.push(myArray.splice(0, chunk_size));
        }
        
        return results;
    }

    addRandomTracks(playlist, trackUris) {
        const authenticated = this.props.authenticated;
        const playlistId = playlist.id;
        const url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks";
        fetch(url, {
            method: 'post', 
            headers: new Headers({
                'Authorization': 'Bearer '+authenticated
            }),
            body: JSON.stringify({
                uris: trackUris,
                position: 0,
            })
        })
        .then(response => response.json())
        .then(response => {
            this.startPlayback(playlist);
        });
    }

    startPlayback(playlist) {
        const authenticated = this.props.authenticated;
        const url = "https://api.spotify.com/v1/me/player/play";
        fetch(url, {
            method: 'put', 
            headers: new Headers({
                'Authorization': 'Bearer '+authenticated
            }),
            body: JSON.stringify({
                context_uri: playlist.uri,
            })
        })
        .then(response => this.setState({...this.state, shuffleIsLoading: false}));
    }

    render() {
        const enabled = !this.state.shuffleIsLoading && this.props.library && this.props.dbSize >= this.props.librarySize * .9;
        const icon = this.state.shuffleIsLoading ? "fas fa-compact-disc fa-spin" : "fas fa-random";
        return (
            <button className="btn btn-primary" disabled={!enabled} onClick={this.startShuffle}><i className={icon} />&nbsp;Shuffle</button>
        );
    }
} 

function mapStateToProps(state) {
    return {
        ...state.data,
        authenticated: state.auth,
    }
}

export default connect(mapStateToProps, { retrievePlaylists })(ShuffleButton);
