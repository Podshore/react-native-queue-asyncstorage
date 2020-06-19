/**
 * Database implementation using AsyncStorage
 */
import _ from "lodash"

// Local
import storage from "./storage"

/*
=== SCHEMA ===
JobSchema = {
  name: 'Job',
  primaryKey: 'id',
  properties: {
    id:  'string', // UUID.
    name: 'string', // Job name to be matched with worker function.
    payload: 'string', // Job payload stored as JSON.
    data: 'string', // Store arbitrary data like "failed attempts" as JSON.
    priority: 'int', // -5 to 5 to indicate low to high priority.
    active: { type: 'bool', default: false}, // Whether or not job is currently being processed.
    timeout: 'int', // Job timeout in ms. 0 means no timeout.
    created: 'date', // Job creation timestamp.
    failed: 'date?' // Job failure timestamp (null until failure).
  }
}
=== ====== ===
*/

const BACKUP_TIME = 15000
const Job = "@queue:Job"

export default class Database {
  database = []

  /**
   * Initialize database and restore based on backup in storage.
   */
  init = async () => {
    await this._restore()
    await this._backup()
  }

  /**
   * Restore database by pulling saved jobs from storage.
   */
  _restore = async () => {
    const jobDB = await storage.get(Job)
    this.database = jobDB || []
  }

  /**
   * Backup database by saving storage.
   */
  _backup = async () => {
    await storage.save(Job, this.database.slice())

    setTimeout(await this._backup, BACKUP_TIME)
  }

  /**
   * Add job to database if it doesn't already exist.
   */
  addJob = async job => {
    let shouldSkip = false
    console.log("*** queue - Adding job to queue:", JSON.stringify(job))

    // Check if job is already in the database, skip if so.
    const found = _.find(this.database, item => item.id === job.id)
    if (found) {
      shouldSkip = true
    }

    console.log("*** queue - Job found in database:", JSON.stringify(found))

    // If the job doesn't already exist, add it to the database.
    if (!shouldSkip) {
      this.database.push(job)
      console.log("*** queue - job added:", JSON.stringify(this.database))
      await this._backup()
    }

    return true
  }

  /**
   * Return all jobs saved in the database.
   */
  objects = () => this.database

  /**
   * Update a job already existing in the database.
   */
  update = async job => {
    const index = _.findIndex(this.database, item => item.id === job.id)

    console.log("*** queue - trying to update:", job, "at index:", index)

    if (index !== -1) {
      this.database[index] = job
      console.log("*** queue - job updated:", job)
    }
    await this._backup()
    return true
  }

  /**
   * Update all jobs in the database.
   */
  updateAll = async jobs => {
    this.database = jobs
    await this._backup()
  }

  /**
   * Delete a job.
   */
  delete = async job => {
    this.database = _.filter(this.database, item => item.id !== job.id)

    console.log("*** queue - job deleted:", JSON.stringify(this.database))

    await this._backup()
  }

  /**
   * Delete all jobs.
   */
  deleteAll = async () => {
    this.database = []
    await this._backup()
  }
}
