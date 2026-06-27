import mongoose from 'mongoose';
import config from './src/config/index';

mongoose.connect(config.database_url as string).then(async () => {
  try {
    await mongoose.connection.db!.collection('biblesettings').drop();
    console.log('BibleSettings collection dropped successfully.');
  } catch (err: any) {
    console.log('Collection might not exist or error:', err.message);
  }
  process.exit(0);
});
