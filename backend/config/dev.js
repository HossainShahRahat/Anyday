module.exports = {
  dbURL: process.env.DB_URL || process.env.MONGO_URI || 'mongodb+srv://harelnatan:harelnatan7@cluster0.fmxlsbf.mongodb.net/?retryWrites=true&w=majority',
  dbName: process.env.DB_NAME || 'anyday_db'
}
