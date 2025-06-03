import Timetable from '../models/Timetables.js';

// Get all stations
export const getAllStations = async (req, res) => {
  try {
    const stations = await Timetable.getAllStations();
    
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

// Get all tracks
export const getAllTracks = async (req, res) => {
  try {
    const tracks = await Timetable.getAllTracks();
    
    res.status(200).json({
      success: true,
      count: tracks.length,
      data: tracks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all coach types
export const getAllCoachTypes = async (req, res) => {
  try {
    const coachTypes = await Timetable.getAllCoachTypes();
    
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

// Get coaches for a specific train
export const getTrainCoaches = async (req, res) => {
  try {
    const { trainId } = req.params;
    const coaches = await Timetable.getTrainCoaches(trainId);
    
    res.status(200).json({
      success: true,
      count: coaches.length,
      data: coaches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search trains between stations
export const searchTrains = async (req, res) => {
  try {
    const { departureStation, arrivalStation, departureDate } = req.query;
    
    if (!departureStation || !arrivalStation || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide departureStation, arrivalStation, and departureDate'
      });
    }

    const trains = await Timetable.searchTrains(departureStation, arrivalStation, departureDate);
    
    res.status(200).json({
      success: true,
      count: trains.length,
      data: trains
    });
  } catch (error) {
    console.error('Search trains error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get journey details for a specific schedule
export const getJourneysBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a schedule ID'
      });
    }

    const journeys = await Timetable.getJourneysBySchedule(scheduleId);
    
    res.status(200).json({
      success: true,
      count: journeys.length,
      data: journeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a schedule ID'
      });
    }

    const schedule = await Timetable.getScheduleById(id);
    
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

// Get schedules between stations
export const getSchedulesBetweenStations = async (req, res) => {
  try {
    const { fromStationId, toStationId } = req.params;
    
    if (!fromStationId || !toStationId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both fromStationId and toStationId'
      });
    }

    const schedules = await Timetable.getSchedulesBetweenStations(fromStationId, toStationId);
    
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