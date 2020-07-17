import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
import { setRelease } from 'features/releases';
import { toastError } from 'features/toast';

const trackSlice = createSlice({
  name: 'tracks',
  initialState: {
    audioUploadProgress: {},
    cancelAudioUpload: undefined,
    isDeleting: [],
    isTranscoding: []
  },
  reducers: {
    setDeletingComplete(state, action) {
      state.isDeleting = state.isDeleting.filter(id => id !== action.payload);
    },

    setDeletingStart(state, action) {
      state.isDeleting = [...state.isDeleting, action.payload];
    },

    setTranscodingComplete(state, action) {
      state.isTranscoding = state.isTranscoding.filter(id => id !== action.payload);
    },

    setTranscodingStart(state, action) {
      state.isTranscoding = [...state.isTranscoding, action.payload.trackId];
    },

    setUploadProgress(state, action) {
      const { trackId, percent } = action.payload;
      state.audioUploadProgress[trackId] = percent;
    }
  }
});

const addTrack = releaseId => async dispatch => {
  try {
    const res = await axios.put(`/api/${releaseId}/add`);
    dispatch(setRelease(res.data));
  } catch (error) {
    dispatch(toastError(error.response.data.error));
  }
};

const deleteTrack = (releaseId, trackId) => async dispatch => {
  try {
    dispatch(setDeletingStart(trackId));
    const res = await axios.delete(`/api/${releaseId}/${trackId}`);
    dispatch(setRelease(res.data));
    dispatch(setDeletingComplete(trackId));
  } catch (error) {
    dispatch(toastError(error.response.data.error));
  }
};

const moveTrack = (releaseId, fromIndex, toIndex) => async dispatch => {
  try {
    const res = await axios.patch(`/api/${releaseId}/${fromIndex}/${toIndex}`);
    dispatch(setRelease(res.data));
  } catch (error) {
    dispatch(toastError(error.response.data.error));
    return { error: error.response.data.error };
  }
};

const transcodeAudio = (releaseId, trackId, trackName) => async dispatch => {
  try {
    dispatch(setTranscodingStart({ releaseId, trackId, trackName }));
  } catch (error) {
    dispatch(toastError(error.response.data.error));
    dispatch(setTranscodingComplete(trackId));
  }
};

const uploadAudio = ({ releaseId, trackId, trackName, audioFile, type }) => async dispatch => {
  try {
    const data = new FormData();
    data.append('releaseId', releaseId);
    data.append('trackId', trackId);
    data.append('trackName', trackName);
    data.append('audio', audioFile);
    data.append('type', type);

    const config = {
      onUploadProgress: event => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        dispatch(setUploadProgress({ trackId, percent }));
      }
    };

    const res = await axios.post('/api/upload/audio', data, config);
    return res;
  } catch (error) {
    toastError(error.response.data.error);
    dispatch(setUploadProgress({ trackId, percent: 0 }));
  }
};

export const {
  setDeletingComplete,
  setDeletingStart,
  setTranscodingComplete,
  setTranscodingStart,
  setUploadProgress
} = trackSlice.actions;

export { addTrack, deleteTrack, moveTrack, transcodeAudio, uploadAudio };
export default trackSlice.reducer;
