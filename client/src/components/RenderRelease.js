import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

const CLOUD_URL = 'https://d2gjz4j3cdttft.cloudfront.net';

const RenderRelease = props => {
  const { release, variation } = props;
  const { _id, artist, artistName, artwork, releaseTitle, trackList } = release;
  const releaseId = _id;

  return (
    <div className="cover-artwork" key={releaseId} onTouchStart={() => {}}>
      <img
        alt={`${artistName} - ${releaseTitle}`}
        className="lazyload artwork"
        data-sizes="auto"
        data-src={artwork ? `${CLOUD_URL}/${releaseId}.jpg` : null}
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
      />
      <div
        className="cover-artwork-overlay"
        title={`${artistName} - ${releaseTitle}`}
      >
        <div className="artist-name">
          <Link to={`/artist/${artist}`}>{artistName}</Link>
        </div>
        <div className="buttons">
          <FontAwesome
            className="play"
            name="play"
            onClick={() => {
              props.playTrack(
                releaseId,
                trackList[0]._id,
                artistName,
                trackList[0].trackTitle
              );
              props.fetchRelease(releaseId);
              props.toastInfo(
                `Loading ${artistName} - '${trackList[0].trackTitle}'`
              );
            }}
            title={`Play '${releaseTitle}', by ${artistName}`}
          />
          <Link to={`/release/${releaseId}`}>
            <FontAwesome
              className="info"
              name="info-circle"
              title={`More information on '${releaseTitle}', by ${artistName}`}
            />
          </Link>
        </div>
        {variation === 'collection' && (
          <div className="buttons">
            <FontAwesome
              className="download"
              name="download"
              onClick={() => {
                props.fetchDownloadToken(releaseId, downloadToken => {
                  if (downloadToken) {
                    props.toastInfo(
                      `Fetching download: ${artistName} - '${releaseTitle}'`
                    );
                    window.location = `/api/download/${downloadToken}`;
                  }
                });
              }}
              title={`Download '${releaseTitle}', by ${artistName}`}
            />
          </div>
        )}
        <div className="release-title">
          <Link to={`/release/${releaseId}`}>{releaseTitle}</Link>
        </div>
      </div>
    </div>
  );
};

export default RenderRelease;
