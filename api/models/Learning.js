import mongoose from 'mongoose';

const learningSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String, //store the URL from Cloudinary
  },
  date: {
    type: Date,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Learning = mongoose.model('Learning', learningSchema);
export default Learning;