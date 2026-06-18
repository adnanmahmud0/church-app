const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const Event = mongoose.model('Event', new mongoose.Schema({ categoryId: mongoose.Schema.Types.ObjectId, title: String, date: Date, isDraft: Boolean }, { strict: false }));
  const EventCategory = mongoose.model('EventCategory', new mongoose.Schema({ label: String }, { strict: false }));
  
  const categories = await EventCategory.find();
  console.log('Categories:');
  for (const cat of categories) {
    const count = await Event.countDocuments({ categoryId: cat._id });
    console.log(`- ${cat.label} (ID: ${cat._id}): ${count} events`);
    if (count > 0) {
      const events = await Event.find({ categoryId: cat._id });
      for (const e of events) {
        console.log(`   - Event: ${e.title} (ID: ${e._id}, date: ${e.date}, isDraft: ${e.isDraft})`);
      }
    }
  }
  process.exit(0);
}).catch(console.error);
