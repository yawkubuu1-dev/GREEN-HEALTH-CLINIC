import { View, Text, Button } from 'react-native';
import { useUserRole } from '../hooks/useUserRole';

export default function HomeScreen({ navigation }) {
  const { isAdmin } = useUserRole();

  return (
    <View>
      <Text>Home</Text>
      {isAdmin && (
        <Button title="Go to Admin Panel" onPress={() => navigation.navigate('AdminDashboard')} />
      )}
    </View>
  );
}
