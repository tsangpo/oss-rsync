#!/usr/bin/env node
import fs from "fs";
import { OSSClient } from "./lib";

interface Config {
  /** access secret you create */
  accessKeyId: string;
  /** access secret you create */
  accessKeySecret: string;
  /** the default bucket you want to access If you don't have any bucket, please use putBucket() create one first. */
  bucket?: string;
  /** oss region domain. It takes priority over region. */
  endpoint?: string;
  /** the bucket data region location, please see Data Regions, default is oss-cn-hangzhou. */
  region?: string;
}

const args = process.argv.slice(2);

if (args.length == 2 || args.length == 3) {
  const [dir, remote, prefix] = args;
  let options: Config;
  if (remote.startsWith("http://") || remote.startsWith("https://")) {
    const url = new URL(remote);
    const [bucket, region] = url.host.split(".");
    options = {
      accessKeyId: url.username,
      accessKeySecret: url.password,
      bucket,
      region,
    };
  } else {
    options = JSON.parse(fs.readFileSync(remote, "utf8"));
  }

  let client = new OSSClient(options);
  client.sync(dir, prefix);
} else {
  console.log(`oss-rsync - sync local files to oss
Usage: oss-rsync $from_local_dir $remote_url_or_config_file [$remote_prefix]

$from_local_dir: local dir will upload to oss
$remote_url_or_config_file: json file path or a url like 'http://accessKeyId:accessKeySecret@bucket.region.aliyuncs.com'
$remote_prefix: prefix of bucket

json file format:
{
  /** access secret you create */
  accessKeyId: string;
  /** access secret you create */
  accessKeySecret: string;
  /** the default bucket you want to access If you don't have any bucket, please use putBucket() create one first. */
  bucket?: string;
  /** oss region domain. It takes priority over region. */
  endpoint?: string;
  /** the bucket data region location, please see Data Regions, default is oss-cn-hangzhou. */
  region?: string;
}
`);
}
