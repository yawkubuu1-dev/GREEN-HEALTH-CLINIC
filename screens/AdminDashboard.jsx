// screens/AdminDashboard.jsx
import { View, Text } from 'react-native';
import { AdminRoute } from '../components/AdminRoute';

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <View>
        <Text>Welcome, Admin!</Text>
      </View>
    </AdminRoute>
  );
}
