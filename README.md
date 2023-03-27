# BRC20 Indexer

# Project Setup Guide

This guide will walk you through setting up the environment for a Node.js project that connects to a MongoDB database, fetches data from the Ordinals Wallet API, and generates various statistics related to valid inscriptions of a specified brc-20 tick.

## Prerequisites

- Node.js and npm installed
- MongoDB instance (local or cloud-hosted)

## Setup

1. **Install dependencies**: Run `npm install` to install the required packages.

2. **Create a .env file**: Create a .env file in your project root directory. The code uses the dotenv package to load environment variables from this file.

3. **Set the DB_URI environment variable**: In the ``.env`` file, define the `DB_URI` environment variable. The value should be the connection string for your MongoDB instance.

   For a local MongoDB instance:
   ```
   DB_URI=mongodb://localhost:27017/your-db-name
   ```
   
   For MongoDB Atlas, obtain the connection string from the Atlas dashboard.
4. **Fetch and index inscriptions**: Run the following commands in order to fetch and index inscriptions from the Ordinals Wallet API:
bash
   ```
   node indexers/inscriptions.js
   node indexers/brc20.js
   ```
5. **Generate statistics**: Run the scripts/stats.js script to generate and display the desired information:

   ```
   node scripts/stats.js your-tick-value
   ```
6. **Export data**: Run the provided export script to export the data:

   ```
   node scripts/export.js your-tick-value
   ```
   Replace your-tick-value and your-export-script-file.js with the appropriate tick value and export script filename, respectively.

<br>**Note**: MongoDB creates collections automatically when you insert data, so you don't need to create any collections beforehand. Ensure your .env file contains the correct DB_URI for connecting to your MongoDB instance.
