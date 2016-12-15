var s3 = require('s3')
var Dat = require('dat-node')
var urlDat = require('url-dat')

module.exports = function (dir, opts, cb) {
  var client = s3.createClient({
    s3Options: {
      accessKeyId: opts.key,
      secretAccessKey: opts.secret
    }
  })
  var pending = []
  var downloads = 0

  Dat(dir, function (err, dat) {
    if (err) return cb(err)
    var list = client.listObjects({
      s3Params: {
        Bucket: opts.bucket,
        Prefix: opts.prefix,
        MaxKeys: opts.maxKeys
      },
      maxAsyncS3: opts.maxAsyncS3
    })
    var listing = true

    list.on('data', function (data) {
      parseContents(data.Contents)
    })
    list.on('error', function (err) {
      return cb(err)
    })
    list.on('end', function () {
      listing = false
    })

    function parseContents (contents) {
      var urls = []

      contents.forEach(function (item) {
        var url = s3.getPublicUrlHttp(opts.bucket, item.Key)
        urls.push(url)
        // TODO:
        // dat.archive.get(item.Key, function (err, data) {
        //   if (err && err.message.indexOf('Could not find entry') > -1) {
        //     urls.push(url)
        //   }
        // })
      })
      if (urls.length) pending.push(urls)
      if (downloads < opts.maxDownloads) fetch()
    }

    function fetch () {
      var urls = pending.shift()
      downloads++
      urlDat(urls, dat.archive, function (err) {
        if (err) return cb(err)
        downloads--
        if (downloads < opts.maxDownloads && pending.length) fetch()
        else if (!pending.length && !listing) {
          console.log('done')
          process.exit(0)
        }
      })
    }
  })
}

