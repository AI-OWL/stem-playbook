import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ViewStyle, Animated, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface LeaderboardPositionProps {
  rank: number;
  name: string;
  points: number;
  avatar?: string;
  isCurrentUser?: boolean;
  style?: ViewStyle;
}

const LeaderboardPosition: React.FC<LeaderboardPositionProps> = ({ 
  rank, 
  name, 
  points, 
  isCurrentUser = false,
  style = {} 
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Determine special styling based on rank
  const isTopThree = rank <= 3;
  const rankStyles = getRankStyles(rank);

  // Animation for top ranks
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isTopThree) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      pulseAnim.stopAnimation();
    };
  }, [isTopThree, pulseAnim]);

  // SIMPLIFIED COLOR APPROACH:
  // - Top 3 positions: Use rank-specific colors
  // - Other positions in light mode: Dark text on light background
  // - Other positions in dark mode: WHITE text on dark background

  return (
    <Animated.View 
      style={[
        styles.cardWrapper, 
        isCurrentUser && styles.currentUserWrapper,
        isTopThree && { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <View
        style={[
          styles.card, 
          style,
          isTopThree 
            ? { backgroundColor: rankStyles.backgroundColor }
            : { backgroundColor: isDarkMode ? '#374151' : '#E0E0E0' }
        ]}
      >
        {isTopThree ? (
          <View style={styles.rankBadge}>
            <Text style={[styles.rankBadgeText, {fontFamily: 'Poppins-Bold'}]}>{rank}</Text>
          </View>
        ) : (
          <Text style={[
            styles.rank,
            { fontFamily: 'Poppins-Bold', color: isDarkMode ? '#FFFFFF' : '#333333' }
          ]}>
            #{rank}
          </Text>
        )}

        <View style={styles.playerInfo}>
          <Text style={[
            styles.name, 
            { fontFamily: 'Poppins-Regular' },
            isTopThree 
              ? rankStyles.textStyle 
              : { color: isDarkMode ? '#FFFFFF' : '#333333', fontWeight: 'bold' }
          ]}>
            {name}
          </Text>
          <View style={styles.pointsContainer}>
            <Text style={[
              styles.pointsText,
              { fontFamily: 'Poppins-Medium' },
              isTopThree 
                ? rankStyles.textStyle 
                : { color: isDarkMode ? '#FFFFFF' : '#555555' }
            ]}>
              {points} 
            </Text>
            <Ionicons 
              name={isTopThree ? "star" : "star-outline"} 
              size={16} 
              color={isTopThree ? rankStyles.iconColor : (isDarkMode ? '#FFFFFF' : "#666666")} 
            />
          </View>
        </View>

        {isTopThree && (
          <View style={styles.trophyContainer}>
            <Ionicons 
              name="trophy" 
              size={24} 
              color={rankStyles.trophyColor} 
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// Helper function to get styling based on rank
const getRankStyles = (rank: number) => {
  switch(rank) {
    case 1:
      return {
        backgroundColor: '#FFD700', // Gold
        textStyle: { color: '#000000', fontWeight: 'bold', fontFamily: 'Poppins-Bold' },
        iconColor: '#000000',
        trophyColor: '#FFD700'
      };
    case 2:
      return {
        backgroundColor: '#C0C0C0', // Silver
        textStyle: { color: '#000000', fontWeight: 'bold', fontFamily: 'Poppins-Bold' },
        iconColor: '#000000',
        trophyColor: '#C0C0C0'
      };
    case 3:
      return {
        backgroundColor: '#CD7F32', // Bronze
        textStyle: { color: '#000000', fontWeight: 'bold', fontFamily: 'Poppins-Bold' },
        iconColor: '#000000',
        trophyColor: '#CD7F32'
      };
    default:
      return {
        backgroundColor: '#E0E0E0',
        textStyle: { color: '#000000', fontWeight: 'bold', fontFamily: 'Poppins-Bold' },
        iconColor: '#000000',
        trophyColor: '#000000'
      };
  }
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 12,
  },
  currentUserWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 40,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  rankBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  playerInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginRight: 5,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trophyContainer: {
    position: 'absolute',
    right: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LeaderboardPosition;