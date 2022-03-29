import React, { Component } from 'react';
import PubNub from "pubnub";
import Swal from "sweetalert2";
import shortid  from 'shortid';
import initializeBoard from '../helper-functions/initializeBoard.js';
import Board from './board.js';
import MultiGame from './multiGame';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.userID = shortid.generate().substring(0,5);
    // REPLACE with your keys
    this.pubnub = new PubNub({
      publishKey: 'pub-c-b56ccf97-b96e-45c9-b6ec-77ef79823ab7',
      subscribeKey: 'sub-c-1c89cca8-ae3e-11ec-9ae2-de198fffb17e',
      uuid: this.userID
    });

    this.state = {
      player: null,
      isPlaying: false, // Set to true when 2 players are in a channel
      isRoomCreator: false,
      isDisabled: false,
      myTurn: false,
      squares: initializeBoard(1),
      whitePlayer: null
    };
  }

  // Create a room channel
  onPressCreate = (e) => {
    // Create a random name for the channel
    this.roomId = shortid.generate().substring(0,5);
    this.lobbyChannel = 'chesslobby--' + this.roomId; // Lobby channel name

    this.pubnub.subscribe({
        channels: [this.lobbyChannel],
        withPresence: true // Checks the number of people in the channel
    });

    // Modal
    Swal.fire({
        position: 'top',
        allowOutsideClick: false,
        title: 'Share this room ID with your friend',
        text: this.roomId,
        width: 275,
        padding: '0.7em',
        // Custom CSS to change the size of the modal
        customClass: {
            heightAuto: false,
            title: 'title-class',
            popup: 'popup-class',
            confirmButton: 'button-class'
        }
    })

    this.setState({
        player: 1,
        isRoomCreator: true,
        isDisabled: true, // Disable the 'Create' button
        myTurn: true, 
    });
  }

  // The 'Join' button was pressed
  onPressJoin = (e) => {
    Swal.fire({
      position: 'top',
      input: 'text',
      allowOutsideClick: false,
      inputPlaceholder: 'Enter the room id',
      showCancelButton: true,
      confirmButtonColor: 'rgb(208,33,41)',
      confirmButtonText: 'OK',
      width: 275,
      padding: '0.7em',
      customClass: {
        heightAuto: false,
        popup: 'popup-class',
        confirmButton: 'join-button-class',
        cancelButton: 'join-button-class'
      }
    }).then((result) => {
      // Check if the user typed a value in the input field
      if (result.value) {
        this.joinRoom(result.value);
      }
    })
  }

  // Join a room channel
  joinRoom = (value) => {
    this.roomId = value;
    this.lobbyChannel = 'chesslobby--' + this.roomId;

    // Check the number of people in the channel
    this.pubnub.hereNow({
        channels: [this.lobbyChannel],
    }).then((response) => {
        if (response.totalOccupancy < 2) {
            this.pubnub.subscribe({
                channels: [this.lobbyChannel],
                withPresence: true
            });
            var whitePlayer = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
            this.pubnub.publish({
                message: {
                    notRoomCreator: true,
                    whitePlayer: whitePlayer
                },
                channel: this.lobbyChannel
            });
            
            this.setState({
                player: 2
            });
        } else {
            // Game in progress
            Swal.fire({
                position: 'top',
                allowOutsideClick: false,
                title: 'Error',
                text: 'Game in progress. Try another room.',
                width: 275,
                padding: '0.7em',
                customClass: {
                    heightAuto: false,
                    title: 'title-class',
                    popup: 'popup-class',
                    confirmButton: 'button-class'
                }
            })
        }
    }).catch((error) => {
        console.log(error);
    });
  }

  addListener = async () => {
    let self = this;
    this.pubnub.addListener({
        message: function(m) {
            // handle message
            var msg = m.message; // The Payload
            if (self.lobbyChannel != null && msg.notRoomCreator) {
                // Create a different channel for the game
                self.setState({
                    isPlaying: true,
                    whitePlayer: msg.whitePlayer
                });
                // Close the modals if they are opened
                Swal.close();
            }
        },
        presence: function(p) {
            // handle presence
            var occupancy = p.occupancy; // Number of users subscribed to the channel
        },
        status: function(s) {
        },
    });
  }

  componentDidMount() {
    this.addListener();
  }

  render() {
    return (
        <div>
        {
            !this.state.isPlaying &&
            <div className="game">
            <div className="board">
                <Board
                    squares={this.state.squares}
                    onClick={index => null}
                />

                <div className="button-container">
                <button
                    className="create-button "
                    disabled={this.state.isDisabled}
                    onClick={(e) => this.onPressCreate()}
                    > Create
                </button>
                <button
                    className="join-button"
                    onClick={(e) => this.onPressJoin()}
                    > Join
                </button>
                </div>
            </div>
            <p>{this.lobbyChannel}</p>
            </div>
        }

        {
            this.state.isPlaying &&
            <MultiGame
                pubnub={this.pubnub}
                player={this.state.player}
                whitePlayer={this.state.whitePlayer}
                gameChannel={this.lobbyChannel}
                isRoomCreator={this.state.isRoomCreator}
                myTurn={this.state.myTurn}
                xUsername={this.state.xUsername}
                oUsername={this.state.oUsername}
                endGame={this.endGame}
            />
        }
        </div>
    );
    }
  }

  export default Lobby;