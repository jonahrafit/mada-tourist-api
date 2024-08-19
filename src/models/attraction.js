import { Schema, model } from 'mongoose';

const AttractionSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    images: [String],
    videos: [String]
});

export default model('Attraction', AttractionSchema);