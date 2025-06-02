import Schedule from '../models/Schedules.js';

// Get all schedules
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll();

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single schedule
export const getSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get schedules by train ID
export const getSchedulesByTrain = async (req, res) => {
  try {
    const { trainId } = req.params;
    const schedules = await Schedule.findByTrainId(trainId);

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get schedules by station ID
export const getSchedulesByStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const schedules = await Schedule.findByStationId(stationId);

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get schedules between two stations
export const getSchedulesBetweenStations = async (req, res) => {
  try {
    const { startId, endId } = req.params;

    if (!startId || !endId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both start and end station IDs'
      });
    }

    const schedules = await Schedule.findBetweenStations(startId, endId);

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    let scheduleData;

    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        scheduleData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      scheduleData = req.body;
    }

    const { start_stationID, end_stationID, departureTime, arrivalTime, scheduleStatus, trainID } = scheduleData;

    // Validate required fields
    if (!start_stationID || !end_stationID || !departureTime || !arrivalTime || !trainID) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start_stationID, end_stationID, departureTime, arrivalTime, and trainID'
      });
    }

    // Additional validation for same stations
    if (start_stationID === end_stationID) {
      return res.status(400).json({
        success: false,
        message: 'Start station and end station cannot be the same'
      });
    }

    const schedule = await Schedule.create({
      start_stationID,
      end_stationID,
      departureTime,
      arrivalTime,
      scheduleStatus: scheduleStatus || 'Active',
      trainID
    });

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    });
  } catch (error) {
    // Handle specific validation errors
    if (error.message.includes('cannot be the same')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    let scheduleData;

    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        scheduleData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      scheduleData = req.body;
    }

    const { start_stationID, end_stationID, departureTime, arrivalTime, scheduleStatus, trainID } = scheduleData;

    // Additional validation for same stations (if both are provided)
    if (start_stationID && end_stationID && start_stationID === end_stationID) {
      return res.status(400).json({
        success: false,
        message: 'Start station and end station cannot be the same'
      });
    }

    const updatedSchedule = await Schedule.update(id, {
      start_stationID,
      end_stationID,
      departureTime,
      arrivalTime,
      scheduleStatus,
      trainID
    });

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: updatedSchedule
    });
  } catch (error) {
    // Handle specific validation errors
    if (error.message.includes('cannot be the same')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const deleted = await Schedule.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Schedule deleted successfully'
      });
    } catch (error) {
      // If error is about associated journeys
      if (error.message.includes('associated journeys')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};