const mongoose = require('mongoose');
const nem = require('nem-sdk').default;
const jwt = require('jsonwebtoken');
const fetchIncomingTransactions = require('./fetchIncomingTransactions');
const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const Release = mongoose.model('releases');
const User = mongoose.model('users');

module.exports = app => {
  const getXemPrice = async () => {
    const xem = await nem.com.requests.market.xem();
    const xemPriceBtc = parseFloat(xem.BTC_XEM.last);
    const btc = await nem.com.requests.market.btc();
    const btcPriceUsd = btc.USD.last;
    const xemPriceUsd = btcPriceUsd * xemPriceBtc;
    return xemPriceUsd;
  };

  app.post('/api/nem/transactions', requireLogin, async (req, res) => {
    const { releaseId, paymentHash } = req.body;
    const release = await Release.findById(releaseId);
    const artist = await User.findById(release._user);
    const price = release.price;
    const paymentAddress = artist.nemAddress;
    const hasPreviouslyPurchased = req.user.purchases.some(
      purchase => releaseId === purchase.id
    );

    fetchIncomingTransactions(
      paymentAddress,
      paymentHash,
      async transactions => {
        if (transactions.paidToDate >= price || hasPreviouslyPurchased) {
          // Add purchase to user account, if not already added.
          if (!req.user.purchases.some(purchase => purchase.id)) {
            const user = await User.findById(req.user._id);
            user.purchases.push({
              purchaseDate: Date.now(),
              releaseId
            });
            user.save();

            // Increment sales.
            release.numSold += 1;
            release.save();
          }

          // Issue download token to user on successful payment.
          const token = jwt.sign(
            {
              releaseId,
              expiresIn: '10m'
            },
            keys.nemp3Secret
          );
          res.append('Authorization', `Bearer ${token}`);
          res.send(transactions);
        } else {
          res.send(transactions);
        }
      }
    );
  });

  app.get('/api/nem/price', async (req, res) => {
    const xemPriceUsd = await getXemPrice();
    res.send({ xemPriceUsd });
  });

  app.post('/api/nem/address', requireLogin, async (req, res) => {
    const { nemAddress } = req.body;
    const user = await User.findById(req.user.id);
    user.nemAddress = nemAddress.toUpperCase().replace(/-/g, '');
    user.save();
    res.send(user);
  });
};
