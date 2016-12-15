var path = require('path')
var s3Dat = require('.')

var opts = {
  key: '<key>',
  secret: '<secret>',
  bucket: 'nasanex', // https://aws.amazon.com/nasa/nex/
  prefix: 'NEX-GDDP', // Check out the other datasets!
  maxKeys: 1, // number of keys to fetch together
  maxAsyncS3: 5,
  maxDownloads: 5 // max concurent download of key groups
}

s3Dat(path.join(__dirname, 'nasa'), opts, function (err) {
  if (err) throw err
})
