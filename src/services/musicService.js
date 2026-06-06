import { logger } from '../utils/logger.js';

/**
 * Music Service - Manages music playback and queue for Discord voice channels
 * Supports YouTube, Spotify, and SoundCloud sources
 */

export class MusicPlayer {
  constructor(guildId) {
    this.guildId = guildId;
    this.queue = [];
    this.currentTrack = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.volume = 80;
    this.connection = null;
    this.audioPlayer = null;
    this.inactivityTimer = null;
  }

  /**
   * Add a track to the queue
   * @param {Object} track - Track object with title, url, duration, author
   * @returns {boolean} - Success status
   */
  addToQueue(track) {
    try {
      if (!track || !track.url || !track.title) {
        throw new Error('Invalid track object');
      }

      this.queue.push({
        ...track,
        addedAt: new Date(),
        id: `${track.url}-${Date.now()}`
      });

      logger.info(`[Guild: ${this.guildId}] Added track to queue: ${track.title}`);
      return true;
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error adding track to queue:`, error.message);
      return false;
    }
  }

  /**
   * Play the next track in queue
   * @returns {Object} - Current track being played or null
   */
  playNext() {
    try {
      if (this.queue.length === 0) {
        this.currentTrack = null;
        this.isPlaying = false;
        logger.info(`[Guild: ${this.guildId}] Queue empty, stopping playback`);
        return null;
      }

      this.currentTrack = this.queue.shift();
      this.isPlaying = true;
      this.isPaused = false;
      
      logger.info(`[Guild: ${this.guildId}] Now playing: ${this.currentTrack.title}`);
      return this.currentTrack;
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error playing next track:`, error.message);
      return null;
    }
  }

  /**
   * Pause the current track
   * @returns {boolean} - Success status
   */
  pause() {
    try {
      if (!this.isPlaying || this.isPaused) {
        return false;
      }

      this.isPaused = true;
      logger.info(`[Guild: ${this.guildId}] Playback paused`);
      return true;
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error pausing playback:`, error.message);
      return false;
    }
  }

  /**
   * Resume the current track
   * @returns {boolean} - Success status
   */
  resume() {
    try {
      if (!this.isPlaying || !this.isPaused) {
        return false;
      }

      this.isPaused = false;
      logger.info(`[Guild: ${this.guildId}] Playback resumed`);
      return true;
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error resuming playback:`, error.message);
      return false;
    }
  }

  /**
   * Stop playback and clear queue
   * @returns {boolean} - Success status
   */
  stop() {
    try {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentTrack = null;
      this.queue = [];
      
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = null;
      }

      logger.info(`[Guild: ${this.guildId}] Playback stopped`);
      return true;
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error stopping playback:`, error.message);
      return false;
    }
  }

  /**
   * Skip to the next track
   * @returns {Object} - Next track or null
   */
  skip() {
    try {
      logger.info(`[Guild: ${this.guildId}] Skipping current track`);
      return this.playNext();
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error skipping track:`, error.message);
      return null;
    }
  }

  /**
   * Remove a track from queue by index
   * @param {number} index - Queue index
   * @returns {Object} - Removed track or null
   */
  removeFromQueue(index) {
    try {
      if (index < 0 || index >= this.queue.length) {
        throw new Error('Invalid queue index');
      }

      const removed = this.queue.splice(index, 1);
      logger.info(`[Guild: ${this.guildId}] Removed track from queue at index ${index}`);
      return removed[0];
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error removing track:`, error.message);
      return null;
    }
  }

  /**
   * Set volume (0-100)
   * @param {number} volume - Volume level
   * @returns {boolean} - Success status
   */
  setVolume(volume) {
    try {
      if (volume < 0 || volume > 100) {
        throw new Error('Volume must be between 0 and 100');
      }

      this.volume = volume;
      logger.info(`[Guild: ${this.guildId}] Volume set to ${volume}%`);
      return true;
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error setting volume:`, error.message);
      return false;
    }
  }

  /**
   * Get queue information
   * @returns {Object} - Queue details
   */
  getQueueInfo() {
    return {
      currentTrack: this.currentTrack,
      queueLength: this.queue.length,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      volume: this.volume,
      upNext: this.queue.length > 0 ? this.queue[0] : null,
      queue: this.queue
    };
  }

  /**
   * Shuffle the queue
   * @returns {boolean} - Success status
   */
  shuffle() {
    try {
      for (let i = this.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
      }

      logger.info(`[Guild: ${this.guildId}] Queue shuffled`);
      return true;
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error shuffling queue:`, error.message);
      return false;
    }
  }

  /**
   * Clear the queue
   * @returns {boolean} - Success status
   */
  clearQueue() {
    try {
      this.queue = [];
      logger.info(`[Guild: ${this.guildId}] Queue cleared`);
      return true;
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error clearing queue:`, error.message);
      return false;
    }
  }

  /**
   * Set inactivity timeout
   * @param {number} timeout - Timeout in milliseconds
   * @param {Function} callback - Callback when timeout triggers
   */
  setInactivityTimeout(timeout, callback) {
    try {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }

      this.inactivityTimer = setTimeout(() => {
        logger.info(`[Guild: ${this.guildId}] Inactivity timeout triggered`);
        callback();
      }, timeout);

      logger.info(`[Guild: ${this.guildId}] Inactivity timeout set to ${timeout}ms`);
    } catch (error) {
      logger.error(`[Guild: ${this.guildId}] Error setting inactivity timeout:`, error.message);
    }
  }

  /**
   * Reset inactivity timer
   */
  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}

/**
 * Music Service - Main service for managing music players across guilds
 */
export class MusicService {
  constructor() {
    this.players = new Map();
  }

  /**
   * Get or create a music player for a guild
   * @param {string} guildId - Discord guild ID
   * @returns {MusicPlayer} - Music player instance
   */
  getPlayer(guildId) {
    if (!this.players.has(guildId)) {
      this.players.set(guildId, new MusicPlayer(guildId));
    }
    return this.players.get(guildId);
  }

  /**
   * Delete a music player
   * @param {string} guildId - Discord guild ID
   * @returns {boolean} - Success status
   */
  deletePlayer(guildId) {
    if (this.players.has(guildId)) {
      const player = this.players.get(guildId);
      player.stop();
      return this.players.delete(guildId);
    }
    return false;
  }

  /**
   * Check if a guild has an active player
   * @param {string} guildId - Discord guild ID
   * @returns {boolean} - Has player
   */
  hasPlayer(guildId) {
    return this.players.has(guildId);
  }

  /**
   * Get all active players
   * @returns {Map} - All players
   */
  getAllPlayers() {
    return this.players;
  }
}

export default new MusicService();
