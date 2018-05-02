'use strict';
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const polly = new aws.Polly({region: 'eu-west-1'});
const md5 = require('md5');
const request = require('request');

var params = {
  OutputFormat: 'mp3',
  Text: 'Hello',
  VoiceId: 'Salli',
  TextType: 'text'
};

var exportBucket = 'tts-audios';

exports.handler = function(event, context, callback) {
  if(event.text)
    params.Text = event.text;
  if(event.voice)
    params.VoiceId = event.voice;

  const fileName = md5(params.VoiceId + params.Text);
  // Cache with S3 and checking cache availability with making a HTTP HEAD request (way faster than using S3 API)
  const potentialURL = 'https://s3-eu-west-1.amazonaws.com/' + exportBucket + '/' + fileName + '.mp3';
  request.head(potentialURL, function (error, response, body) {
    if(response.statusCode === 200)
      callback(null, {'voice': potentialURL})
    else {
      polly.synthesizeSpeech(params, function(err, data) {
        if (err) callback(err);
        else {
          var s3Params = {ACL: 'public-read', Bucket: exportBucket, Key: fileName + '.mp3', ContentType: 'audio/mpeg',  Body: data.AudioStream};
          s3.upload(s3Params, function(err, data) {
            if (err) callback(err);
            else callback(null, {'voice': data.Location});
          });
        }
      });
    }
  });
}
