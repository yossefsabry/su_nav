import { DataCollector } from '@/components/data-collector';
import { StyleSheet, View } from 'react-native';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <DataCollector />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
