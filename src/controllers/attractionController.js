import Attraction from '../models/attraction.js';

export async function getAllAttractions(req, res) {
    try {
        const attractions = await Attraction.find();
        res.status(200).json(attractions);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function getAttractionById(req, res) {
    try {
        const { id } = req.params; // Extract the ID from request parameters
        const attraction = await Attraction.findById(id); // Find attraction by ID
        if (!attraction) {
            return res.status(404).json({ error: 'Attraction not found' });
        }
        res.status(200).json(attraction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function saveAttraction(req, res) {
    try {
        const newAttraction = new Attraction(req.body);
        await newAttraction.save();
        res.status(201).json(newAttraction);
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
}
