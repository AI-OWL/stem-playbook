import { StyleSheet, Text, View, FlatList } from 'react-native';
import React from 'react';
import Header from '@/components/Header';
import AchievementItem from '@/components/ui/AchievementItem';

const achievementsData = [
  { id: '1', title: 'Achievement 1', description: 'Achievement Description goes here', imageUrl: '' },
  { id: '2', title: 'Achievement 2', description: 'Complete 5 challenges!', imageUrl: '' },
  { id: '3', title: 'Achievement 3', description: 'Score 1000 points!', imageUrl: '' },
];

const Achievements = () => {
  return (
    <View style={styles.container}>
      <Header title="Achievements" onProfilePress={() => console.log('Profile icon pressed')} />
      <FlatList
        data={achievementsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AchievementItem
            title={item.title}
            description={item.description}
            imageUrl={item.imageUrl}
            onRedeem={() => console.log(`Redeemed ${item.title}`)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={<View style={{ height: 48 }} />}
      />
    </View>
  );
};

export default Achievements;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3E84',
  },
  listContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
