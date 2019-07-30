import React, { useState } from 'react';
import {
  checkFormatMp3,
  fetchDownloadToken,
  toastInfo
} from '../../../actions';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from '../../../style/Payments.module.css';

const Download = props => {
  const { artistName, hasPurchased, releaseId, releaseTitle } = props;
  const [isPreparingDownload, setPreparingDownload] = useState(false);
  const [formatExists, setFormatExists] = useState(false);

  const handleDownload = () => {
    setPreparingDownload(true);

    props.fetchDownloadToken(releaseId, downloadToken => {
      if (downloadToken) {
        props.toastInfo(`Fetching download: ${artistName} - '${releaseTitle}'`);
        props.checkFormatMp3(downloadToken, () => {
          setFormatExists(true);
          setPreparingDownload(false);
          window.location = `/api/download/${downloadToken}`;
        });
      } else {
        setPreparingDownload(false);
      }
    });
  };

  const renderButtonText = () => {
    if (isPreparingDownload) {
      return (
        <>
          <FontAwesome name="cog" spin className="mr-2" />
          Preparing download…
        </>
      );
    }

    return (
      <>
        <FontAwesome name="download" className="download mr-2" />
        Download <span className="ibm-type-italic">{releaseTitle}</span>
      </>
    );
  };

  const renderNote = () => {
    if (isPreparingDownload && !formatExists) {
      return (
        <>
          <p className="mt-3 mb-2">
            <FontAwesome name="info-circle" className="cyan mr-2" />
            This can take a little while if we don&rsquo;t have your chosen
            format cached, as we&rsquo;ll freshly transcode the release from
            source, before building your archive.
          </p>
          <p>
            A download prompt will pop up when it&rsquo;s ready. You&rsquo;re
            free to continue browsing around the site while you wait.
          </p>
        </>
      );
    }
  };

  if (hasPurchased) {
    return (
      <>
        <h3 className="text-center mt-5">Thank you!</h3>
        <p className="text-center">
          <span className="ibm-type-italic">{releaseTitle}</span> has been added
          to <Link to={'/dashboard/collection'}>your collection</Link>.
        </p>
        <div className="d-flex justify-content-center">
          <button
            className={`${styles.download} btn btn-outline-primary btn-lg`}
            disabled={isPreparingDownload === true}
            download
            onClick={handleDownload}
          >
            {renderButtonText()}
          </button>
        </div>
        {renderNote()}
      </>
    );
  }

  return null;
};

export default connect(
  null,
  {
    checkFormatMp3,
    fetchDownloadToken,
    toastInfo
  }
)(Download);