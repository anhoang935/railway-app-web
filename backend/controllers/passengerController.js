import Passenger from '../models/Passengers.js';

// Get all passengers
export const getAllPassengers = async (req, res) => {
  try {
    const passengers = await Passenger.findAll();
    
    res.status(200).json({
      success: true,
      count: passengers.length,
      data: passengers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single passenger
export const getPassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const passenger = await Passenger.findById(id);
    
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: passenger
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new passenger
export const createPassenger = async (req, res) => {
  try {
    let passengerData;
    
    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        passengerData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      // Otherwise use the parsed body directly
      passengerData = req.body;
    }
    
    const { fullname, phone_number, email, status } = passengerData;
    
    if (!fullname || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least fullname and status'
      });
    }

    const passenger = await Passenger.create({ fullname, phone_number, email, status });

    res.status(201).json({
      success: true,
      message: 'Passenger created successfully',
      data: passenger
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a passenger
export const updatePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    let passengerData;
    
    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        passengerData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      // Otherwise use the parsed body directly
      passengerData = req.body;
    }
    
    const { fullname, phone_number, email, status } = passengerData;
    
    // Validate request
    if (!fullname || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least fullname and status'
      });
    }
    
    const updatedPassenger = await Passenger.update(id, { fullname, phone_number, email, status });
    
    if (!updatedPassenger) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Passenger updated successfully',
      data: updatedPassenger
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a passenger
export const deletePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Passenger.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Passenger deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get passenger bookings
export const getPassengerBookings = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if passenger exists
    const passenger = await Passenger.findById(id);
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    const bookings = await Passenger.getBookings(id);
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get passenger tickets
export const getPassengerTickets = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if passenger exists
    const passenger = await Passenger.findById(id);
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    const tickets = await Passenger.getTickets(id);
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};