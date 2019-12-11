import AsyncStorage from "./node_modules/@react-native-community/async-storage"

const deviceStorage = {
  /**
   * Get a one or more value for a key or array of keys from AsyncStorage
   * @param {string|array} key A key or array of keys
   * @return {promise}
   */
  get: async key => {
    if (!Array.isArray(key)) {
      return AsyncStorage.getItem(key).then(value => {
        return JSON.parse(value)
      })
    }
    return AsyncStorage.multiGet(key).then(values => {
      return values.map(value => {
        return JSON.parse(value[1])
      })
    })
  },

  /**
   * Save a key value pair or a series of key value pairs to AsyncStorage.
   * @param {string|array} key The key or an array of key/value pairs
   * @param {any} value The value to save
   * @return {promise}
   */
  save: async (key, value) => {
    if (!Array.isArray(key)) {
      return AsyncStorage.setItem(key, JSON.stringify(value))
    }
    const pairs = key.map(function(pair) {
      return [pair[0], JSON.stringify(pair[1])]
    })
    return AsyncStorage.multiSet(pairs)
  },

  /**
   * Delete the value for a given key in AsyncStorage.
   * @param {string|array} key The key or an array of keys to be deleted
   * @return {promise}
   */
  delete: async key => {
    if (Array.isArray(key)) {
      return AsyncStorage.multiRemove(key)
    }
    return AsyncStorage.removeItem(key)
  },

  /**
   * Push a value onto an array stored in AsyncStorage by key or create a new array in AsyncStorage for a key if it's not yet defined.
   * @param {string} key They key
   * @param {any} value The value to push onto the array
   * @return {promise}
   */
  push: async (key, value) => {
    return deviceStorage.get(key).then(currentValue => {
      if (currentValue === null) {
        // if there is no current value populate it with the new value
        return deviceStorage.save(key, [value])
      }
      if (Array.isArray(currentValue)) {
        return deviceStorage.save(key, [...currentValue, value])
      }
      throw new Error(
        `Existing value for key "${key}" must be of type null or Array, received ${typeof currentValue}.`,
      )
    })
  },
}

export default deviceStorage
