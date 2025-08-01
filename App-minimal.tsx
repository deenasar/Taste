import React from 'react';
import { View, Text } from 'react-native';

function App() {
  console.log('🚀 Minimal App starting');
  console.log('📄 Creating View component');
  
  try {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>Minimal App Works!</Text>
      </View>
    );
  } catch (error) {
    console.log('❌ Minimal app render failed:', error);
    return null;
  }
}

export default App;