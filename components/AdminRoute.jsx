// components/AdminRoute.jsx
import { View, Text } from 'react-native';
import { useUserRole } from '../hooks/useUserRole';

export function AdminRoute({ children }) {
  const { isAdmin, loading } = useUserRole();

  if (loading) return <Text>Loading...</Text>;
  if (!isAdmin) return <Text>Access Denied</Text>;

  return children;
}
