import {
  init,
  track,
  identify,
  Identify,
  Revenue,
} from "@amplitude/analytics-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AMPLITUDE_API_KEY = "5e1773f70602db5eabb266dc70375b62";
const SESSION_START_TIME = "amplitude_session_start_time";
const DEBUG_AMPLITUDE = true; // Enable logging

const logAmplitude = (message: string, data?: any) => {
  if (DEBUG_AMPLITUDE) {
    if (data) {
      console.log(`🔊 AMPLITUDE: ${message}`, JSON.stringify(data));
    } else {
      console.log(`🔊 AMPLITUDE: ${message}`);
    }
  }
};

// Initialize amplitude directly with the provided API key
// This ensures we're using the same init method as in the documentation
export const initializeAmplitudeDirectly = () => {
  try {
    console.log("🔊 AMPLITUDE: Initializing directly with API key");
    // Use the direct approach from the documentation
    init(AMPLITUDE_API_KEY);
    console.log("🔊 AMPLITUDE: Successfully initialized");
    return true;
  } catch (error) {
    console.error("🔊 AMPLITUDE ERROR: Failed to initialize directly", error);
    return false;
  }
};

// Initialize amplitude with the API key
export const initializeAnalytics = async (userId?: string) => {
  try {
    logAmplitude(
      `Initializing with API key: ${AMPLITUDE_API_KEY}, userId: ${
        userId || "none"
      }`
    );

    // First try direct initialization
    const directInitSuccess = initializeAmplitudeDirectly();
    if (!directInitSuccess) {
      // If direct init fails, try the async approach
      await init(AMPLITUDE_API_KEY, userId);
    }

    // Start session tracking
    const sessionStartTime = Date.now();
    await AsyncStorage.setItem(SESSION_START_TIME, sessionStartTime.toString());
    logAmplitude(
      `Session started at ${new Date(sessionStartTime).toISOString()}`
    );

    if (userId) {
      // Identify the user if we have a user ID
      const identifyObj = new Identify();
      identifyObj.set("user_id", userId);
      await identify(identifyObj);
      logAmplitude(`User identified with ID: ${userId}`);
    }

    // Track session start
    await track("Session Started");
    logAmplitude("Session Start event tracked");

    return true;
  } catch (error) {
    console.error("🔊 AMPLITUDE ERROR: Failed to initialize analytics", error);
    return false;
  }
};

// Track when a card is clicked in the wallet
export const trackCardClicked = async (
  cardId: string,
  cardName: string,
  cardCategory: string
) => {
  try {
    const eventProperties = {
      card_id: cardId,
      card_name: cardName,
      card_category: cardCategory,
    };

    logAmplitude("Tracking Card Clicked event", eventProperties);
    await track("Card Clicked", eventProperties);
    logAmplitude("Card Clicked event tracked successfully");
    return true;
  } catch (error) {
    console.error("🔊 AMPLITUDE ERROR: Failed to track Card Clicked", error);
    return false;
  }
};

// Track when a video starts playing
export const trackVideoStarted = async (
  cardId: string,
  cardName: string,
  videoUrl: string
) => {
  try {
    const eventProperties = {
      card_id: cardId,
      card_name: cardName,
      video_url: videoUrl,
    };

    logAmplitude("Tracking Video Started event", eventProperties);
    await track("Video Started", eventProperties);
    logAmplitude("Video Started event tracked successfully");
    return true;
  } catch (error) {
    console.error("🔊 AMPLITUDE ERROR: Failed to track Video Started", error);
    return false;
  }
};

// Track when a video is completed
export const trackVideoCompleted = async (
  cardId: string,
  cardName: string,
  videoUrl: string,
  watchTimeSeconds: number
) => {
  try {
    const eventProperties = {
      card_id: cardId,
      card_name: cardName,
      video_url: videoUrl,
      watch_time_seconds: watchTimeSeconds,
    };

    logAmplitude("Tracking Video Completed event", eventProperties);
    await track("Video Completed", eventProperties);
    logAmplitude("Video Completed event tracked successfully");
    return true;
  } catch (error) {
    console.error("🔊 AMPLITUDE ERROR: Failed to track Video Completed", error);
    return false;
  }
};

// Track video progress (e.g., 25%, 50%, 75%)
export const trackVideoProgress = async (
  cardId: string,
  cardName: string,
  progressPercentage: number,
  watchTimeSeconds: number
) => {
  try {
    const eventProperties = {
      card_id: cardId,
      card_name: cardName,
      progress_percentage: progressPercentage,
      watch_time_seconds: watchTimeSeconds,
    };

    logAmplitude(
      `Tracking Video Progress (${progressPercentage}%) event`,
      eventProperties
    );
    await track("Video Progress", eventProperties);
    logAmplitude(
      `Video Progress (${progressPercentage}%) event tracked successfully`
    );
    return true;
  } catch (error) {
    console.error("🔊 AMPLITUDE ERROR: Failed to track Video Progress", error);
    return false;
  }
};

// Track when points are redeemed
export const trackPointsRedeemed = async (
  cardId: string,
  cardName: string,
  pointsAmount: number
) => {
  try {
    const eventProperties = {
      card_id: cardId,
      card_name: cardName,
      points_amount: pointsAmount,
    };

    logAmplitude("Tracking Points Redeemed event", eventProperties);
    await track("Points Redeemed", eventProperties);
    logAmplitude("Points Redeemed event tracked successfully");
    return true;
  } catch (error) {
    console.error("🔊 AMPLITUDE ERROR: Failed to track Points Redeemed", error);
    return false;
  }
};

// Track session end (call this when app goes to background)
export const trackSessionEnd = async () => {
  try {
    const sessionStartTimeStr = await AsyncStorage.getItem(SESSION_START_TIME);
    if (sessionStartTimeStr) {
      const sessionStartTime = parseInt(sessionStartTimeStr, 10);
      const sessionDurationSeconds = Math.floor(
        (Date.now() - sessionStartTime) / 1000
      );

      const eventProperties = {
        session_duration_seconds: sessionDurationSeconds,
      };

      logAmplitude("Tracking Session Ended event", eventProperties);
      await track("Session Ended", eventProperties);
      logAmplitude(
        `Session Ended event tracked successfully. Duration: ${sessionDurationSeconds}s`
      );

      await AsyncStorage.removeItem(SESSION_START_TIME);
      return true;
    }
    return false;
  } catch (error) {
    console.error("🔊 AMPLITUDE ERROR: Failed to track Session End", error);
    return false;
  }
};

// Simple test function to confirm Amplitude is working
export const testAmplitudeTracking = async () => {
  try {
    logAmplitude("Running Amplitude test event");
    await track("Test Event", { test_property: "test_value" });
    logAmplitude("Test event sent successfully");
    return true;
  } catch (error) {
    console.error("🔊 AMPLITUDE ERROR: Test event failed", error);
    return false;
  }
};
