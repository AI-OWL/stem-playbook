import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import LeaderboardPosition from '@/components/LeaderboardPosition';
import Header from '@/components/Header';

const LeaderBoard = () => {
  const userPoints = 400;
  const topPlayers = [
    { id: '1', name: 'John Doe', points: 1000 },
    { id: '2', name: 'Dwayne Johnson', points: 990 },
    { id: '3', name: 'Cas Maxwell', points: 750 },
  ];

  return (
    <View style={styles.container}>
      <Header title="Leaderboard" onProfilePress={() => console.log('Profile icon pressed')} />

      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerText}>Your Points:</ThemedText>
        <Text style={styles.points}>{userPoints}</Text>
      </View>

      <FlatList
        data={topPlayers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LeaderboardPosition rank={index + 1} name={item.name} points={item.points} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2D3E84',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  points: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default LeaderBoard;
