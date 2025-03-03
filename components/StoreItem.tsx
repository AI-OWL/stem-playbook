import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StoreItemProps {
  title: string;
  body: string;
  points: number;
  imageUrl?: string; // Optional image prop
}

const StoreItem: React.FC<StoreItemProps> = ({ title, body, points, imageUrl }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{points}</Text>
          <Ionicons name="star-outline" size={16} color="black" />
        </View>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  placeholder: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#E0E0E0', // Grey placeholder
  },
  content: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  body: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});

export default StoreItem;
