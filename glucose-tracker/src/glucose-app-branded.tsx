import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, X, Check, AlertTriangle } from 'lucide-react';

const GlucoseApp = () => {
  // App state
  const [currentGlucose, setCurrentGlucose] = useState(142);
  const [lastMeal, setLastMeal] = useState("Sandwich and apple");
  const [prediction, setPrediction] = useState(187);
  const [showAlert, setShowAlert] = useState(false);
  
  // UI state
  const [showGlucoseModal, setShowGlucoseModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  // Form values
  const [newGlucoseValue, setNewGlucoseValue] = useState('');
  const [newMealValue, setNewMealValue] = useState('');
  const [newMealType, setNewMealType] = useState('balanced');
  const [activityType, setActivityType] = useState('light');
  const [activityDuration, setActivityDuration] = useState('15');
  
  // Initial data for the past 24 hours
  const [glucoseData, setGlucoseData] = useState([
    { time: '12 AM', glucose: 110 },
    { time: '3 AM', glucose: 95 },
    { time: '6 AM', glucose: 130 },
    { time: '9 AM', glucose: 158 },
    { time: '12 PM', glucose: 140 },
    { time: '3 PM', glucose: 122 },
    { time: '6 PM', glucose: 142 },
    { time: 'Now', glucose: currentGlucose },
    { time: '+1h', glucose: 165, isPrediction: true },
    { time: '+2h', glucose: prediction, isPrediction: true },
    { time: '+3h', glucose: 160, isPrediction: true },
  ]);

  // Mock prediction function
  const predictGlucose = (currentLevel, mealType, activityLevel) => {
    // Predetermined patterns based on common diabetes responses
    const basePrediction = currentLevel;
    
    // Mock meal impact (high-carb meals increase, protein/fat less so)
    const mealImpact = {
      'high-carb': 60,
      'balanced': 30,
      'low-carb': 10
    };
    
    // Mock activity impact (exercise lowers glucose)
    const activityImpact = {
      'none': 0,
      'light': -15,
      'moderate': -25,
      'intense': -40
    };
    
    // Calculate predicted level with some randomness for realism
    const randomFactor = Math.floor(Math.random() * 20) - 10;
    const predictedLevel = Math.max(70, Math.min(300, 
      basePrediction + 
      mealImpact[mealType] + 
      activityImpact[activityLevel] + 
      randomFactor
    ));
    
    return predictedLevel;
  };

  // Update predictions when data changes
  useEffect(() => {
    updatePredictions();
  }, [currentGlucose, lastMeal]);

  const updatePredictions = () => {
    // Calculate new predictions
    const newPrediction = predictGlucose(currentGlucose, newMealType || 'balanced', activityType || 'none');
    setPrediction(newPrediction);
    
    // Update chart data
    const updatedData = [...glucoseData];
    // Find and update the current value
    const nowIndex = updatedData.findIndex(item => item.time === 'Now');
    if (nowIndex !== -1) {
      updatedData[nowIndex].glucose = currentGlucose;
    }
    
    // Update predictions
    for (let i = nowIndex + 1; i < updatedData.length; i++) {
      // Create a gradient of predictions
      const hoursPast = i - nowIndex;
      if (hoursPast === 2) {
        updatedData[i].glucose = newPrediction;
      } else if (hoursPast === 1) {
        updatedData[i].glucose = Math.round((currentGlucose + newPrediction) / 2);
      } else if (hoursPast === 3) {
        updatedData[i].glucose = Math.round((newPrediction + currentGlucose) / 2);
      }
    }
    
    setGlucoseData(updatedData);
    
    // Show alert if prediction is high
    if (newPrediction > 180) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  };

  // Handle log glucose submission
  const handleGlucoseSubmit = () => {
    if (newGlucoseValue && !isNaN(newGlucoseValue)) {
      const glucoseNum = parseInt(newGlucoseValue, 10);
      setCurrentGlucose(glucoseNum);
      setShowGlucoseModal(false);
      setNewGlucoseValue('');
    }
  };

  // Handle log meal submission
  const handleMealSubmit = () => {
    if (newMealValue) {
      setLastMeal(newMealValue);
      setShowMealModal(false);
      setNewMealValue('');
      
      // Update predictions based on meal type
      const newPredictedValue = predictGlucose(currentGlucose, newMealType, 'none');
      setPrediction(newPredictedValue);
      updatePredictions();
    }
  };

  // Handle log activity submission
  const handleActivitySubmit = () => {
    setShowActivityModal(false);
    
    // Update predictions based on activity
    const newPredictedValue = predictGlucose(currentGlucose, 'balanced', activityType);
    setPrediction(newPredictedValue);
    updatePredictions();
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md relative">
      {/* Company Logo/Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-blue-600 text-white font-bold rounded-lg px-2 py-1 mr-2">
            SugarSense
          </div>
          <span className="text-blue-600 font-semibold">AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Type 2</span>
        </div>
      </div>
      
      {/* Current glucose */}
      <div className="flex justify-between mb-6">
        <div>
          <p className="text-gray-500 text-sm">Current Glucose</p>
          <p className="text-3xl font-bold text-blue-900">{currentGlucose} <span className="text-sm">mg/dL</span></p>
          <p className="text-xs text-gray-500">Last updated: Just now</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Predicted (2h)</p>
          <p className={`text-2xl font-bold ${prediction > 180 ? 'text-red-500' : 'text-green-600'}`}>
            {prediction} <span className="text-sm">mg/dL</span>
          </p>
          <p className="text-xs text-gray-500">Last meal: {lastMeal}</p>
        </div>
      </div>
      
      {/* Alert */}
      {showAlert && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                Glucose spike predicted in 2 hours
              </p>
              <p className="text-xs text-red-700 mt-1">
                Try a 15-minute walk now to avoid reaching {prediction} mg/dL
              </p>
              <div className="mt-2">
                <button 
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-2 rounded" 
                  onClick={() => setShowAlert(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={glucoseData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis domain={[70, 250]} tick={{ fontSize: 10 }} />
            <Tooltip 
              formatter={(value) => [`${value} mg/dL`, 'Glucose']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="glucose" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Glucose"
            />
            {/* Dashed line for predictions */}
            <Line 
              type="monotone" 
              dataKey={(entry) => entry.isPrediction ? entry.glucose : null}
              stroke="#ef4444" 
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Predicted"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-center text-xs text-gray-500">
          <span className="inline-block mx-2">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            Measured
          </span>
          <span className="inline-block mx-2">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            SugarSense AI Prediction
          </span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button 
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded text-sm font-medium"
          onClick={() => setShowMealModal(true)}
        >
          Log Meal
        </button>
        <button 
          className="bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded text-sm font-medium"
          onClick={() => setShowActivityModal(true)}
        >
          Log Activity
        </button>
        <button 
          className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-4 rounded text-sm font-medium"
          onClick={() => setShowGlucoseModal(true)}
        >
          Log Glucose
        </button>
      </div>
      
      {/* Recommendations */}
      <div className="border-t pt-4">
        <h2 className="text-sm font-medium text-gray-700 mb-2">SugarSense AI Recommendations</h2>
        <ul className="text-xs text-gray-600 space-y-2">
          <li className="flex items-start">
            <span className="inline-block bg-blue-100 rounded-full p-1 mr-2">
              <Check className="h-3 w-3 text-blue-500" />
            </span>
            Take a 15-minute walk to stabilize your glucose levels
          </li>
          <li className="flex items-start">
            <span className="inline-block bg-blue-100 rounded-full p-1 mr-2">
              <Check className="h-3 w-3 text-blue-500" />
            </span>
            Drink a glass of water before your next meal
          </li>
          <li className="flex items-start">
            <span className="inline-block bg-blue-100 rounded-full p-1 mr-2">
              <Check className="h-3 w-3 text-blue-500" />
            </span>
            Consider lower-carb options for dinner tonight
          </li>
        </ul>
      </div>
      
      {/* Footer with branding */}
      <div className="mt-6 pt-4 border-t text-xs text-center text-gray-500">
        Powered by SugarSense AI © 2025
      </div>
      
      {/* Log Glucose Modal */}
      {showGlucoseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Log Glucose Level</h3>
              <button onClick={() => setShowGlucoseModal(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Glucose Level (mg/dL)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter glucose level"
                value={newGlucoseValue}
                onChange={(e) => setNewGlucoseValue(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                onClick={() => setShowGlucoseModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={handleGlucoseSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Log Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Log Meal</h3>
              <button onClick={() => setShowMealModal(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What did you eat?
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                placeholder="Describe your meal"
                value={newMealValue}
                onChange={(e) => setNewMealValue(e.target.value)}
              />
              
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newMealType}
                onChange={(e) => setNewMealType(e.target.value)}
              >
                <option value="low-carb">Low Carb</option>
                <option value="balanced">Balanced</option>
                <option value="high-carb">High Carb</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                onClick={() => setShowMealModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={handleMealSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Log Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Log Activity</h3>
              <button onClick={() => setShowActivityModal(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <option value="light">Walking</option>
                <option value="moderate">Jogging</option>
                <option value="intense">Running</option>
              </select>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Duration in minutes"
                value={activityDuration}
                onChange={(e) => setActivityDuration(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                onClick={() => setShowActivityModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={handleActivitySubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlucoseApp;
