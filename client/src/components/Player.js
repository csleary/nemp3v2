import axios from 'axios';
import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import classNames from 'classnames';
import {
  playTrack,
  playerHide,
  playerPause,
  playerPlay,
  playerStop
} from '../actions';
import '../style/player.css';

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autoStartDisabled: false,
      bufferEnd: false,
      elapsedTime: '',
      expandSeekBar: false,
      isBuffering: false,
      isSeeking: false,
      shouldUpdateBuffer: false,
      shouldSetDuration: false,
      showRemaining: false
    };

    this.newTrack = false;
    this.seekPercent = null;
    this.queue = [];
  }

  componentDidMount() {
    this.mediaSource = new MediaSource();
    const audioPlayer = document.getElementById('player');
    audioPlayer.src = URL.createObjectURL(this.mediaSource);
    this.mediaSource.addEventListener('sourceopen', () => {
      URL.revokeObjectURL(audioPlayer.src);
      const mime = 'audio/mp4; codecs="mp4a.40.2"';
      this.sourceBuffer = this.mediaSource.addSourceBuffer(mime);

      this.sourceBuffer.addEventListener('update', () => {});

      this.sourceBuffer.addEventListener('updatestart', () => {
        this.setState({ updating: true });
      });

      this.sourceBuffer.addEventListener('updateend', () => {
        if (this.state.shouldUpdateBuffer) {
          this.handleUpdateBuffer();
        }

        if (this.state.shouldSetDuration) {
          this.handleUpdateDuration();
        }

        if (this.queue.length) {
          this.sourceBuffer.appendBuffer(this.queue.shift());
        }

        this.setState({
          isSeeking: false,
          isBuffering: false,
          updating: false
        });
      });

      this.sourceBuffer.addEventListener('updateerror', () => {
        this.setState({ updating: false });
      });
    });

    audioPlayer.addEventListener('timeupdate', () => {
      const mins = Math.floor(audioPlayer.currentTime / 60);
      const secs = Math.floor(audioPlayer.currentTime % 60);
      const percentComplete =
        (audioPlayer.currentTime / this.mediaSource.duration) * 100;
      const remainingTime =
        this.mediaSource.duration - audioPlayer.currentTime || 0;
      const minsLeft = Math.floor(remainingTime / 60);
      const secsLeft = Math.floor(remainingTime % 60);

      if (
        this.state.bufferEnd &&
        this.state.percentComplete === percentComplete
      ) {
        this.handleTrackEnded();
        return;
      }

      let needsBuffer = false;
      for (let i = 0; i < this.sourceBuffer.buffered.length; i++) {
        if (
          audioPlayer.currentTime > this.sourceBuffer.buffered.start(i) &&
          audioPlayer.currentTime < this.sourceBuffer.buffered.end(i) &&
          audioPlayer.currentTime > this.sourceBuffer.buffered.end(i) - 5 &&
          !this.state.bufferEnd &&
          !this.state.isBuffering &&
          !this.state.isSeeking
        ) {
          needsBuffer = true;
          break;
        }
      }

      if (needsBuffer) {
        this.setState({ isBuffering: true }, () => {
          this.fetchAudioRange(buffer => {
            this.handleAppendBuffer(buffer);
          });
        });
      }

      this.setState({
        elapsedTime: `${mins}:${secs.toString(10).padStart(2, '0')}`,
        remainingTime: `-${minsLeft}:${secsLeft.toString(10).padStart(2, '0')}`,
        percentComplete
      });
    });

    audioPlayer.addEventListener('loadstart', () => {
      this.setState({ ready: false });
    });

    audioPlayer.addEventListener('canplay', () => {
      this.setState({ ready: true });
    });

    audioPlayer.addEventListener('play', () => {
      this.handlePlay();
    });

    audioPlayer.addEventListener('seeking', () => {
      let isBuffered;
      for (let i = 0; i < this.sourceBuffer.buffered.length; i++) {
        if (
          audioPlayer.currentTime >= this.sourceBuffer.buffered.start(i) &&
          audioPlayer.currentTime < this.sourceBuffer.buffered.end(i)
        ) {
          isBuffered = true;
          break;
        }
        isBuffered = false;
      }

      if (!isBuffered && !this.newTrack) {
        this.setState({ bufferEnd: false });
        this.currentSegment = Math.floor(audioPlayer.currentTime / 15);
        this.setState(
          { ready: false, isSeeking: true, isBuffering: true },
          () => {
            this.fetchAudioRange(buffer => {
              this.handleAppendBuffer(buffer);
            });
          }
        );
      }
    });

    audioPlayer.addEventListener('ended', () => this.handleTrackEnded());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.player.trackId !== this.props.player.trackId) {
      const audioPlayer = document.getElementById('player');
      audioPlayer.pause();
      this.queue.length = 0;
      this.newTrack = true;
      this.emptySourceBuffer();
      this.handleUpdateBuffer();
      this.setPlayerReady();
      this.fetchAudioRange(buffer => {
        this.handleAppendBuffer(buffer);
        audioPlayer.currentTime = 0;
        this.handlePlay();
      });
    }
  }

  componentWillUnmount() {
    if (!this.sourceBuffer.updating && this.mediaSource.readyState === 'open') {
      this.mediaSource.endOfStream();
    }
  }

  setPlayerReady() {
    this.setState({ bufferEnd: false, percentComplete: 0, ready: false });
  }

  emptySourceBuffer() {
    if (this.mediaSource.duration && !this.sourceBuffer.updating) {
      this.sourceBuffer.remove(0, this.mediaSource.duration);
    }
  }

  handleUpdateBuffer() {
    if (this.sourceBuffer.updating) {
      this.setState({ shouldUpdateBuffer: true });
      return;
    }

    const oldDuration = Number.isFinite(this.mediaSource.duration)
      ? this.mediaSource.duration
      : 0;

    const currentTrack = this.props.release.trackList.filter(
      track => track._id === this.props.player.trackId
    );

    const newDuration = currentTrack.length && currentTrack[0].duration;

    if (newDuration < oldDuration) {
      this.sourceBuffer.remove(newDuration, oldDuration);
      this.setState({ shouldUpdateBuffer: false, shouldSetDuration: true });
    } else {
      this.mediaSource.duration = newDuration;
      this.setState({ shouldUpdateBuffer: false, shouldSetDuration: false });
    }
  }

  handleUpdateDuration() {
    if (this.sourceBuffer.updating) {
      return;
    }

    const currentTrack = this.props.release.trackList.filter(
      track => track._id === this.props.player.trackId
    );

    const newDuration = currentTrack.length && currentTrack[0].duration;

    this.mediaSource.duration = newDuration;
    this.setState({ shouldSetDuration: false });
  }

  handleAppendBuffer(buffer) {
    if (!this.sourceBuffer.updating) {
      this.sourceBuffer.appendBuffer(buffer);
    } else {
      this.queue.push(buffer);
    }
  }

  handleTrackEnded() {
    const trackIndex = this.props.release.trackList.findIndex(
      track => track.trackTitle === this.props.player.trackTitle
    );
    if (trackIndex + 1 < this.props.release.trackList.length) {
      this.nextTrack(trackIndex + 1);
    } else {
      this.stopAudio();
    }
  }

  fetchAudioRange = async callback => {
    if (this.newTrack) {
      this.fetchInitSegment().then(() => {
        this.handleSegmentRanges(buffer => callback(buffer));
      });
    } else {
      this.handleSegmentRanges(buffer => callback(buffer));
    }
  };

  fetchInitSegment = () =>
    new Promise(async resolve => {
      const { releaseId, trackId } = this.props.player;
      const res = await axios.get(`/api/${releaseId}/${trackId}/init`);
      this.segmentList = res.data.segmentList;
      const range = res.data.initRange;

      const initConfig = {
        headers: { Range: `bytes=${range}` },
        responseType: 'arraybuffer'
      };
      const init = await axios.get(res.data.url, initConfig);
      this.initSegment = new Uint8Array(init.data);
      this.currentSegment = 0;
      this.newTrack = false;
      resolve();
    });

  handleSegmentRanges = async callback => {
    const { releaseId, trackId } = this.props.player;
    const resUrl = await axios.get(`/api/${releaseId}/${trackId}/segment`);
    const segmentUrl = resUrl.data;
    const range = this.segmentList[this.currentSegment];

    const segmentConfig = {
      headers: { Range: `bytes=${range}` },
      responseType: 'arraybuffer'
    };

    const res = await axios.get(segmentUrl, segmentConfig);
    const segment = new Uint8Array(res.data);
    const buffer = new Uint8Array([...this.initSegment, ...segment]);

    if (this.currentSegment < this.segmentList.length - 1) {
      this.currentSegment++;
    } else {
      this.setState({ bufferEnd: true });
    }
    callback(buffer);
  };

  handlePause = () => {
    const audioPlayer = document.getElementById('player');
    audioPlayer.pause();
    this.props.playerPause();
  };

  handlePlay = () => {
    const audioPlayer = document.getElementById('player');
    const promisePlay = audioPlayer.play();

    if (promisePlay !== undefined) {
      promisePlay
        .catch(() => {
          this.setState({ autoStartDisabled: true });
        })
        .then(() => {
          if (!this.state.autoStartDisabled) {
            audioPlayer.play();
            this.props.playerPlay();
          }
        });
    }
  };

  handleSeek = event => {
    const audioPlayer = document.getElementById('player');
    const seekBar = document.getElementById('seek-bar');
    const x = event.clientX;
    const width = seekBar.clientWidth;
    this.seekPercent = x / width;
    audioPlayer.currentTime = this.mediaSource.duration * this.seekPercent;
  };

  hidePlayer = () => {
    this.props.playerHide();
    this.stopAudio();
  };

  nextTrack = index => {
    this.props.playTrack(
      this.props.release._id,
      this.props.release.trackList[index]._id,
      this.props.release.artistName,
      this.props.release.trackList[index].trackTitle
    );
  };

  playAudio = async () => {
    this.setState({ autoStartDisabled: false });
    if (this.props.player.isPlaying) {
      this.handlePause();
    } else {
      this.handlePlay();
    }
  };

  stopAudio = () => {
    this.setState({ bufferEnd: false });
    const audioPlayer = document.getElementById('player');
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    this.currentSegment = 0;
    this.props.playerStop();
  };

  renderPlayButton = () => {
    if (!this.state.ready) {
      return <FontAwesome name="cog" spin className="player-button waiting" />;
    } else if (this.props.player.isPlaying) {
      return (
        <FontAwesome
          name="pause"
          className="player-button"
          onClick={this.playAudio}
        />
      );
    }
    return (
      <FontAwesome
        name="play"
        className="player-button"
        onClick={this.playAudio}
      />
    );
  };

  renderTrackInfo = () => {
    const { releaseId, artistName, trackTitle } = this.props.player;
    if (this.props.history.location.pathname !== `/release/${releaseId}`) {
      return (
        <Link to={`/release/${releaseId}`}>
          {artistName} &bull; <em>{trackTitle}</em>
        </Link>
      );
    }
    return (
      <span className="no-link">
        {artistName} &bull; <em>{trackTitle}</em>
      </span>
    );
  };

  render() {
    const { showPlayer } = this.props.player;
    const playerClassNames = classNames('player', {
      show: showPlayer
    });

    return (
      <div className={playerClassNames}>
        <audio id="player" />
        <div
          className="seek-bar"
          id="seek-bar"
          onClick={this.handleSeek}
          role="button"
          tabIndex="-1"
        >
          <div
            id="player-progress"
            style={{ width: `${this.state.percentComplete}%` }}
          />
        </div>
        <div className="container-fluid">
          <div className="row no-gutters interface">
            <div className="col-sm controls">
              {this.renderPlayButton()}
              <FontAwesome
                name="stop"
                className="player-button"
                onClick={this.stopAudio}
              />
              <div
                className="player-current-time align-middle"
                onClick={() =>
                  this.setState({
                    showRemaining: !this.state.showRemaining
                  })
                }
                role="button"
                tabIndex="-1"
              >
                {this.state.showRemaining
                  ? this.state.remainingTime
                  : this.state.elapsedTime}
              </div>
            </div>
            <div className="col-sm track-info">
              {!this.state.ready ? (
                <span>Loading&hellip;</span>
              ) : (
                this.renderTrackInfo()
              )}
              <FontAwesome
                name="chevron-circle-down"
                className="player-button hide-player"
                onClick={this.hidePlayer}
                title="Hide player (will stop audio)"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    player: state.player,
    release: state.releases.selectedRelease
  };
}

export default connect(
  mapStateToProps,
  {
    playTrack,
    playerHide,
    playerPause,
    playerPlay,
    playerStop
  }
)(withRouter(Player));
