import Station from '../models/Stations.js';

// Get all stations
export const getAllStations = async (req, res) => {
  try {
    const stations = await Station.findAll();
    
    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single station
export const getStation = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await Station.findById(id);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: station
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new station
export const createStation = async (req, res) => {
  try {
    let stationData;
    
    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        stationData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      // Otherwise use the parsed body directly
      stationData = req.body;
    }
    
    const { stationName } = stationData;
    
    if (!stationName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stationName'
      });
    }

    const station = await Station.create({ stationName });

    res.status(201).json({
      success: true,
      message: 'Station created successfully',
      data: station
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
  
  
  

// Update a station
export const updateStation = async (req, res) => {
  try {
    const { id } = req.params;
    const { stationName } = req.body;
    
    // Validate request
    if (!stationName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stationName'
      });
    }
    
    const updatedStation = await Station.update(id, { stationName });
    
    if (!updatedStation) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Station updated successfully',
      data: updatedStation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a station
export const deleteStation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Station.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Station deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};