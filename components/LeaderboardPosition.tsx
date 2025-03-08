import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


interface LeaderboardPositionProps {
  rank: number;
  name: string;
  points: number;
}

const LeaderboardPosition: React.FC<LeaderboardPositionProps> = ({ rank, name, points }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.rank}>#{rank}</Text>
      <View style={styles.playerInfo}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>{points} </Text>
          <Ionicons name="star-outline" size={16} color="black" />
        </View>
      </View>
    </View>
  );
};

export default LeaderboardPosition;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E0E0E0',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  playerInfo: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
