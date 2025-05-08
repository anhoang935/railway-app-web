import Trains from '../models/Trains.js';  // <-- Note the 's' here

// Get all trains
export const getAllTrains = async (req, res) => {
  try {
    const trains = await Trains.findAll();
    
    res.status(200).json({
      success: true,
      count: trains.length,
      data: trains
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single train
export const getTrain = async (req, res) => {
  try {
    const { id } = req.params;
    const train = await Trains.findById(id);
    
    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Train not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: train
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new train
export const createTrain = async (req, res) => {
  try {
    let trainData;
    
    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        trainData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      // Otherwise use the parsed body directly
      trainData = req.body;
    }
    
    const { trainID, trainName, trainType, coachTotal } = trainData;
    
    if (!trainID || !trainName || !trainType || !coachTotal) {
      return res.status(400).json({
        success: false,
        message: 'Please provide trainID, trainName, trainType, and coachTotal'
      });
    }

    const train = await Trains.create({ trainID, trainName, trainType, coachTotal });

    res.status(201).json({
      success: true,
      message: 'Train created successfully',
      data: train
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a train
export const updateTrain = async (req, res) => {
  try {
    const { id } = req.params;
    const { trainName, trainType, coachTotal } = req.body;
    
    // Validate request
    if (!trainName || !trainType || !coachTotal) {
      return res.status(400).json({
        success: false,
        message: 'Please provide trainName, trainType, and coachTotal'
      });
    }
    
    const updatedTrain = await Trains.update(id, { trainName, trainType, coachTotal });
    
    if (!updatedTrain) {
      return res.status(404).json({
        success: false,
        message: 'Train not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Train updated successfully',
      data: updatedTrain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a train
export const deleteTrain = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Trains.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Train not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Train deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};