import CoachType from '../models/CoachTypes.js';

// Get all coach types
export const getAllCoachTypes = async (req, res) => {
  try {
    const coachTypes = await CoachType.findAll();
    
    res.status(200).json({
      success: true,
      count: coachTypes.length,
      data: coachTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single coach type
export const getCoachType = async (req, res) => {
  try {
    const { id } = req.params;
    const coachType = await CoachType.findById(id);
    
    if (!coachType) {
      return res.status(404).json({
        success: false,
        message: 'Coach type not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: coachType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new coach type
export const createCoachType = async (req, res) => {
  try {
    let coachTypeData;
    
    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        coachTypeData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      // Otherwise use the parsed body directly
      coachTypeData = req.body;
    }
    
    const { coach_typeID, type, price, capacity } = coachTypeData;
    
    if (!coach_typeID || !type || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coach_typeID, type, and price'
      });
    }

    const coachType = await CoachType.create({ 
      coach_typeID, 
      type, 
      price, 
      capacity: capacity || null
    });

    res.status(201).json({
      success: true,
      message: 'Coach type created successfully',
      data: coachType
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a coach type
export const updateCoachType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, price, capacity } = req.body;
    
    // Validate request
    if (!type || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type and price'
      });
    }
    
    const updatedCoachType = await CoachType.update(id, { 
      type, 
      price, 
      capacity: capacity || null
    });
    
    if (!updatedCoachType) {
      return res.status(404).json({
        success: false,
        message: 'Coach type not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coach type updated successfully',
      data: updatedCoachType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a coach type
export const deleteCoachType = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CoachType.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Coach type not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coach type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};