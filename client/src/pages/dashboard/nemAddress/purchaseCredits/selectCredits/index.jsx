import Button from 'components/button';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'components/spinner';
import classnames from 'classnames';
import styles from './selectCredits.module.css';

const SelectCredits = ({ productData = [], isLoading, sku, setSku, setStage, setShowPaymentModal }) => {
  const selectedProduct = productData.find(product => product.sku === sku) || {};
  const { label, priceUsd, priceXem } = selectedProduct;

  const handleClick = e => setSku(e.target.dataset.sku);

  return (
    <>
      <p>Help us cover our infrastructure costs by purchasing utility tokens called &lsquo;credits&rsquo; (NPC).</p>
      <p>
        Please select how many credits you wish to purchase. You receive a discount for buying more than one credit at a
        time.
      </p>
      {isLoading ? (
        <Spinner wrapperClassName={styles.spinner} />
      ) : (
        <>
          <div className={styles.buttons}>
            {productData?.map(product => (
              <Button
                className={classnames(styles.button, { [styles.selected]: product.sku === sku })}
                data-sku={product.sku}
                disabled={isLoading}
                key={product.label}
                type="button"
                onClick={handleClick}
                tabIndex="0"
              >
                {`${product.label} ~$${product.priceUsd} USD`}
                {product.unitPrice.toString() !== product.priceUsd ? (
                  <div className={styles.unit}>${product.unitPrice} each</div>
                ) : null}
              </Button>
            ))}
          </div>
          <h3 className={styles.price}>
            {label} = <span className="yellow">~{priceXem?.toFixed(2)} XEM</span> (~$ {priceUsd} USD){' '}
          </h3>
        </>
      )}
      <p>
        After your payment has been confirmed, you will receive your selected number of nemp3 credits to the same
        address. Each token buys your the right to use nemp3 to sell your own music, and is freely transferable at any
        point.
      </p>
      <div className={styles.confirm}>
        <Button
          disabled={isLoading}
          onClick={() => setShowPaymentModal(false)}
          size="large"
          tabIndex="0"
          textLink
          type="button"
        >
          Cancel
        </Button>
        <Button
          disabled={isLoading}
          icon="chevron-right"
          iconRight
          onClick={() => setStage(2)}
          size="large"
          tabIndex="0"
          type="button"
        >
          Pay
        </Button>
      </div>
    </>
  );
};

SelectCredits.propTypes = {
  isLoading: PropTypes.bool,
  productData: PropTypes.array,
  sku: PropTypes.string,
  setSku: PropTypes.func,
  setStage: PropTypes.func,
  setShowPaymentModal: PropTypes.func
};

export default SelectCredits;
