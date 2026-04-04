// API Service for database operations
const API_BASE_URL = 'http://localhost:3001/api';

export interface PredictionData {
  student: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  academicDetails: {
    attendance: number;
    internalMarks: number;
    assignmentScores: number;
    projectMarks: number;
    previousGPA: number;
  };
  prediction: {
    level: string;
    score: number;
    suggestions: any[];
    modelUsed: string;
    status?: string;
  };
}

// Store prediction in database
export async function storePrediction(data: PredictionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Database save result:', result);
    return result;
  } catch (error) {
    console.error('Error storing prediction:', error);
    throw error;
  }
}

// Get all predictions (Faculty/Admin view)
export async function getAllPredictions() {
  try {
    const response = await fetch(`${API_BASE_URL}/predictions`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw error;
  }
}

// Get predictions for specific student
export async function getStudentPredictions(studentId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/predictions/student/${studentId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching student predictions:', error);
    throw error;
  }
}

// Get analytics (Admin dashboard)
export async function getAnalytics() {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

// Delete prediction
export async function deletePrediction(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/predictions/${id}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting prediction:', error);
    throw error;
  }
}

// Verify prediction
export async function verifyPrediction(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/predictions/${id}/verify`, {
      method: 'PUT',
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error verifying prediction:', error);
    throw error;
  }
}

// Mark notification as read
export async function markNotificationAsRead(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/predictions/${id}/read`, {
      method: 'PUT',
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Check server health
export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Server is not running:', error);
    return { status: 'ERROR', message: 'Server is not running' };
  }
}

// Register user
export async function registerUser(userData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Login user
export async function loginUser(credentials: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}
