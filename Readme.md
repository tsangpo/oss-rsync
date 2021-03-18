# oss-rsync

## About
A command line tool/lib for sync local files to remote aliyun oss.

## Install
```bash
  npm i oss-rsync
```

## Usage
```bash
  oss-rsync $from_local_dir $remote_url_or_config_file
```

- $from_local_dir: local dir will upload to oss
- $remote_url_or_config_file: json file path or a url like 'http://accessKeyId:accessKeySecret@bucket.region.aliyuncs.com'

json file format:
```ts
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
```