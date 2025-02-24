import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import Header from '@/components/Header';
import StoreItem from '@/components/StoreItem'; // Import the StoreItem component

const testItems = [
  {
    id: '1',
    title: 'Cool Avatar',
    body: 'A stylish avatar for your profile.',
    points: 500,
    imageUrl: 'https://example.com/avatar.png',
  },
  {
    id: '2',
    title: 'Background Theme',
    body: 'A custom theme to personalize your app experience.',
    points: 750,
    imageUrl: 'https://example.com/theme.jpg',
  },
  {
    id: '3',
    title: 'Exclusive Badge',
    body: 'Show off your achievements with this rare badge.',
    points: 300,
    imageUrl: 'https://example.com/badge.png',
  },
];

const Shop = () => {
  return (
    <View style={styles.container}>
      <Header title="Store" />

      <FlatList
        data={testItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StoreItem
            title={item.title}
            body={item.body}
            points={item.points}
            imageUrl={item.imageUrl}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={<View style={{ height: 64 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3E84',
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
  subHeader: {
    color: 'white',
    fontSize: 14,
    fontStyle: 'italic',
  },
  listContainer: {
    padding: 10,
  },
});

export default Shop;
