import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios, { AxiosError } from 'axios';
import Select from 'react-select';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart as MinimalPieChart } from 'react-minimal-pie-chart';
import { styled } from '@mui/material/styles';

// Styled components
const VitalzScoreCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[12],
  },
  borderRadius: '15px',
  background: 'linear-gradient(135deg, #2A2A40, #1A1A2E)',
  color: '#E0E0E0',
  height: '70vh',
  width: '30vw',
  margin: '0 auto',
}));

const SleepDataCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[12],
  },
  borderRadius: '15px',
  background: 'linear-gradient(135deg, #2A2A40, #1A1A2E)',
  color: '#E0E0E0',
  height: '70vh',
  width: '60vw',
  margin: '0 auto',
}));

const HeartRateStatisticsCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[12],
  },
  borderRadius: '15px',
  background: 'linear-gradient(135deg, #2A2A40, #1A1A2E)',
  color: '#E0E0E0',
  height: '85vh',
  width: '92.43vw',
  margin: '0 auto',
}));

// Interfaces
interface User {
  ID: string;
  LoginEmail: string;
  UserName: string;
  DeviceCompany: string;
  DeviceUserID: string;
}

interface SleepData {
  LoginEmail: string;
  DeviceUserID: string;
  Date: string;
  SleepOnset: string;
  WakeUpTime: string;
  Awake: string;
  Deep: string;
  Light: string;
  TotalTimeAsleep: string;
}

interface ScoreData {
  LoginEmail: string;
  DeviceUserID: string;
  Date: string;
  VitalzScore: number;
  ScoreType: string;
}

interface StatisticsData {
  LoginEmail: string;
  DeviceUserID: string;
  Date: string;
  Time: string;
  HR: number;
  HRV: number;
  OxygenSaturation: number;
}

// API client
const apiClient = axios.create({
  baseURL: 'https://exam-vitalz-backend-8267f8929b82.herokuapp.com/api',
});

const fetchUserList = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/getUserList');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching user list:', error);
    return [];
  }
};

const fetchUserSleepData = async (email: string, deviceUserID: string): Promise<SleepData[]> => {
  try {
    const response = await apiClient.get('/getUserSleepData', {
      params: { LoginEmail: email, DeviceUserID: deviceUserID },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    return [];
  }
};

const fetchUserScore = async (email: string, deviceUserID: string): Promise<ScoreData[]> => {
  try {
    const response = await apiClient.get('/getUserScore', {
      params: { LoginEmail: email, DeviceUserID: deviceUserID },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching score data:', error);
    return [];
  }
};

const fetchUserStatistics = async (email: string, deviceUserID: string, date: string): Promise<StatisticsData[]> => {
  try {
    const response = await apiClient.get('/getUserStatics', {
      params: { LoginEmail: email, DeviceUserID: deviceUserID, Date: date },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return [];
  }
};

// Main Dashboard component
const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const [statisticsData, setStatisticsData] = useState<StatisticsData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const userOptions = users.map((user) => ({
    value: user.LoginEmail,
    label: `${user.UserName} (${user.LoginEmail})`,
  }));

  const handleUserSelect = (selectedOption: { value: string; label: string } | null) => {
    if (selectedOption) {
      setSelectedUser(selectedOption.value);
      setSleepData([]);
      setScoreData([]);
      setStatisticsData([]);
    } else {
      setSelectedUser('');
      setSleepData([]);
      setScoreData([]);
      setStatisticsData([]);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      const userList = await fetchUserList();
      console.log('Fetched users:', userList);
      if (userList.length === 0) setError('No users found or API error occurred.');
      setUsers(userList);
      setLoading(false);
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const user = users.find((u) => u.LoginEmail === selectedUser);
      console.log('Selected user:', user);
      if (user) {
        setLoading(true);
        setError(null);
        Promise.all([
          fetchUserSleepData(user.LoginEmail, user.DeviceUserID),
          fetchUserScore(user.LoginEmail, user.DeviceUserID),
          fetchUserStatistics(user.LoginEmail, user.DeviceUserID, '2023-12-17'),
        ])
          .then(([sleep, score, stats]) => {
            console.log('Fetched sleep data:', sleep, 'score data:', score, 'stats data:', stats);
            setSleepData(sleep);
            setScoreData(score);
            setStatisticsData(stats);
            if (sleep.length === 0 && score.length === 0 && stats.length === 0)
              setError('No data available for this user.');
          })
          .catch((error: AxiosError) => {
            console.error('API error:', error);
            setError(`Failed to fetch user data: ${error.message}`);
          })
          .finally(() => setLoading(false));
      }
    }
  }, [selectedUser, users]);

  const getFirstSleepData = () => sleepData[0] || { TotalTimeAsleep: '0', Deep: '0', Light: '0', Awake: '0', SleepOnset: '', WakeUpTime: '' };
  const getFirstScoreData = () => scoreData[0] || { VitalzScore: 0, ScoreType: '', Date: '' };

  const sleepPieData = [
    { name: 'Deep', value: parseInt(getFirstSleepData().Deep) || 0, color: '#00D4FF' },
    { name: 'Light', value: parseInt(getFirstSleepData().Light) || 0, color: '#A100F2' },
    { name: 'Awake', value: parseInt(getFirstSleepData().Awake) || 0, color: '#FF6666' },
  ].filter((item) => !isNaN(item.value));

  return (
    <Container maxWidth={false} disableGutters sx={{ padding: '20px', background: 'linear-gradient(135deg, #1A1A2E, #2A2A40)', minHeight: '100vh', borderRadius: '0' }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#00D4FF', fontWeight: 'bold', textAlign: 'center', textShadow: '2px 2px 6px rgba(0, 212, 255, 0.6)', mb: 2 }}>
        User Health Dashboard
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={6}>
          <CircularProgress sx={{ color: '#00D4FF' }} size={60} />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ marginBottom: '20px', backgroundColor: 'rgba(255, 0, 0, 0.1)', color: '#FF6666', fontSize: '1.1rem' }}>{error}</Alert>}

      <Grid container spacing={5}>
        {/* First Row: Vitalz Score and Sleep Data */}
        <Grid container item xs={12} spacing={5}>
          <Grid item xs={6}>
            <VitalzScoreCard>
              <CardContent sx={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ color: '#A100F2', fontWeight: 'bold', mb: 3 }}>
                  Vitalz Score
                </Typography>
                <Box sx={{ width: '100%', mb: 3 }}>
                  <Select
                    options={userOptions}
                    onChange={handleUserSelect}
                    placeholder="Select User"
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid #A100F2',
                        color: '#E0E0E0',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#E0E0E0',
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: '#2A2A40',
                        color: '#E0E0E0',
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? '#00D4FF' : '#2A2A40',
                        color: state.isFocused ? '#FFFFFF' : '#E0E0E0',
                        '&:hover': {
                          backgroundColor: '#00D4FF',
                          color: '#FFFFFF',
                        },
                      }),
                    }}
                  />
                </Box>
                {selectedUser && scoreData.length > 0 ? (
                  <>
                    <Box sx={{ width: '100%', mb: 4 }}>
                      <Typography variant="h6" sx={{ color: '#00D4FF', mb: 1 }}>
                        Score: {getFirstScoreData().VitalzScore}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getFirstScoreData().VitalzScore}
                        sx={{
                          height: '10px',
                          borderRadius: '5px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': { backgroundColor: '#00D4FF' },
                        }}
                      />
                    </Box>
                    <Box display="flex" flexDirection="column" alignItems="center" width="100%" gap={2}>
                      <Box
                        sx={{
                          perspective: '1000px',
                          transformStyle: 'preserve-3d',
                          transform: 'rotateX(20deg)',
                          backgroundColor: 'rgba(161, 0, 242, 0.1)',
                          color: '#A100F2',
                          padding: '10px',
                          borderRadius: '10px',
                          boxShadow: '0px 4px 10px rgba(161, 0, 242, 0.5)',
                          fontSize: '1rem',
                          textAlign: 'center',
                          width: '80%',
                        }}
                      >
                        Type: {getFirstScoreData().ScoreType || 'N/A'}
                      </Box>
                      <Box
                        sx={{
                          perspective: '1000px',
                          transformStyle: 'preserve-3d',
                          transform: 'rotateX(20deg)',
                          backgroundColor: 'rgba(0, 212, 255, 0.1)',
                          color: '#00D4FF',
                          padding: '10px',
                          borderRadius: '10px',
                          boxShadow: '0px 4px 10px rgba(0, 212, 255, 0.5)',
                          fontSize: '1rem',
                          textAlign: 'center',
                          width: '80%',
                        }}
                      >
                        Date: {getFirstScoreData().Date}
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Alert severity="info" sx={{ backgroundColor: 'rgba(161, 0, 242, 0.1)', color: '#A100F2', fontSize: '1.1rem' }}>
                    {selectedUser ? 'No score data available for this user.' : 'Please select a user to view their Vitalz Score.'}
                  </Alert>
                )}
              </CardContent>
            </VitalzScoreCard>
          </Grid>
          <Grid item xs={6}>
            <SleepDataCard>
              <CardContent sx={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" sx={{ color: '#00D4FF', mb: 3, fontWeight: 'bold' }}>
                  Sleep Data
                </Typography>
                {selectedUser && sleepData.length > 0 ? (
                  <Box display="flex" flexDirection="row" alignItems="center">
                    <Box width="70%" height="400px">
                      <MinimalPieChart
                        data={sleepPieData.map((item) => {
                          const total = sleepPieData.reduce((sum, data) => sum + data.value, 0);
                          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00';
                          return {
                            title: `${item.name}: ${percentage}%`,
                            value: item.value,
                            color: item.color,
                          };
                        })}
                        animate
                        radius={40}
                        lineWidth={20}
                        label={({ dataEntry }) => dataEntry.title}
                        labelStyle={{
                          fontSize: '3.8px',
                          fontWeight: 'bold',
                          fill: '#E0E0E0',
                        }}
                        labelPosition={112}
                      />
                    </Box>
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="flex-start" width="30%" pl={4}>
                      <Chip
                        label={`Total Sleep: ${Math.round(parseInt(getFirstSleepData().TotalTimeAsleep) / 3600) || 0} hours`}
                        variant="outlined"
                        sx={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', color: '#00D4FF', fontSize: '1rem', padding: '10px', mb: 2 }}
                      />
                      <Chip
                        label={`Sleep Onset: ${getFirstSleepData().SleepOnset ? new Date(getFirstSleepData().SleepOnset).toLocaleTimeString() : 'N/A'}`}
                        variant="outlined"
                        sx={{ backgroundColor: 'rgba(161, 0, 242, 0.1)', color: '#A100F2', fontSize: '1rem', padding: '10px', mb: 2 }}
                      />
                      <Chip
                        label={`Wake Up: ${getFirstSleepData().WakeUpTime ? new Date(getFirstSleepData().WakeUpTime).toLocaleTimeString() : 'N/A'}`}
                        variant="outlined"
                        sx={{ backgroundColor: 'rgba(255, 102, 102, 0.1)', color: '#FF6666', fontSize: '1rem', padding: '10px' }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', color: '#00D4FF', fontSize: '1.1rem' }}>
                    {selectedUser ? 'No sleep data available for this user.' : 'Please select a user to view their sleep data.'}
                  </Alert>
                )}
              </CardContent>
            </SleepDataCard>
          </Grid>
        </Grid>

        {/* Second Row: Heart Rate Statistics */}
        <Grid item xs={12}>
          <HeartRateStatisticsCard>
            <CardContent sx={{ padding: '30px' }}>
              <Typography variant="h4" sx={{ color: '#00D4FF', mb: 3, fontWeight: 'bold' }}>
                Heart Rate Statistics
              </Typography>
              {selectedUser && statisticsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart data={statisticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="Time" stroke="#E0E0E0" fontSize="1.2rem" />
                    <YAxis stroke="#E0E0E0" fontSize="1.2rem" />
                    <Tooltip contentStyle={{ backgroundColor: '#2A2A40', border: 'none', color: '#E0E0E0', fontSize: '1.1rem' }} />
                    <Legend wrapperStyle={{ color: '#E0E0E0', fontSize: '1.2rem' }} />
                    <Line type="monotone" dataKey="HR" stroke="#00D4FF" strokeWidth={3} name="Heart Rate" />
                    <Line type="monotone" dataKey="HRV" stroke="#A100F2" strokeWidth={3} name="HRV" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Alert severity="info" sx={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', color: '#00D4FF', fontSize: '1.1rem' }}>
                  <>{selectedUser ? 'No statistics data available for this user.' : 'Please select a user to view their heart rate statistics.'}</>
                </Alert>
              )}
            </CardContent>
          </HeartRateStatisticsCard>
        </Grid>
      </Grid>
    </Container>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Dashboard />);