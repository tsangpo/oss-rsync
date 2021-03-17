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

if (args.length == 2) {
  const src = args[0];
  let options: Config;
  if (src.startsWith("oss://")) {
    const url = new URL(args[0]);
    // 'oss://accessKeyId:accessKeySecret@region/bucket'
    options = {
      region: url.host,
      accessKeyId: url.username,
      accessKeySecret: url.password,
      bucket: url.pathname.substr(1),
    };
  } else {
    options = JSON.parse(fs.readFileSync(src, "utf8"));
  }

  const dir = args[1];
  let client = new OSSClient(options);
  client.sync(dir);
} else {
  console.log(`oss-rsync - sync local files to oss
Usage: oss-rsync src(file|url) dir

src: json file path or a url like 'oss://accessKeyId:accessKeySecret@region/bucket'
dir: local dir will upload to oss

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
