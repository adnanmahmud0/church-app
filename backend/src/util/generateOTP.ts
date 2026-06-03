import crypto from 'crypto';

const generateOTP = () => {
  return crypto.randomInt(1000, 10000);
};

export default generateOTP;
