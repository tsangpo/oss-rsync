import fs from "fs";
import path from "path";
import crypto from "crypto";
import OSS from "ali-oss";

interface IObjectInfo {
  name: string; // 'recipes/10057/1565134467879-WyXDwI.jpg',
  url: string; //'http://xxxxxxxxx.oss-cn-shenzhen.aliyuncs.com/recipes/10057/1565134467879-WyXDwI.jpg',
  lastModified: string; //'2019-08-06T23:34:27.000Z',
  etag: string; //'"3673FA15DA8423796E789400C1D55DC1"',
  type: string; //'Normal',
  size: number; //17831,
  storageClass: string; //'Standard',
  owner?: string; //null
  lastModifiedTime: Date;
}
interface IFileInfo {
  name: string;
  size: number;
  mtime: Date;
}

export class OSSClient {
  private oss: OSS;
  constructor(options: OSS.Options) {
    this.oss = new OSS(options);
  }

  async list(prefix = "") {
    let continuationToken = null;
    const maxKeys = 1000;
    let files: IObjectInfo[] = [];
    do {
      //@ts-ignore
      const result = await this.oss.listV2({
        prefix,
        "continuation-token": continuationToken,
        "max-keys": maxKeys,
      });
      continuationToken = result.nextContinuationToken;
      if (result.objects) {
        files = files.concat(result.objects);
        console.log("get files:", files.length);
      }
    } while (continuationToken);
    return files;
  }

  async put(key: string, file: string) {
    try {
      let result = await this.oss.put(key, file);
      //   console.log(result);
    } catch (e) {
      console.log(e);
    }
  }

  // TODO: add delete option
  async sync(rootDir: string, prefix = "") {
    while (prefix.startsWith("/")) {
      prefix = prefix.substr(1);
    }
    if (prefix.length > 0 && !prefix.endsWith("/")) {
      prefix += "/";
    }

    // remote file list
    const rfilesL = await this.list(prefix);
    //   console.log(rfilesL);

    const rfiles = {} as { [key: string]: IObjectInfo };
    for (const f of rfilesL) {
      f.lastModifiedTime = new Date(f.lastModified);
      rfiles[f.name] = f;
    }

    const lfiles = loadFolder(rootDir);
    //   console.log(lfiles);

    for (const f of lfiles) {
      const localPath = path.join(rootDir, f.name);
      const remotePath = prefix + f.name;

      const r = rfiles[remotePath];
      if (r && r.size == f.size) {
        if (r.lastModifiedTime >= f.mtime) {
          // skip, size and mtime match
          console.log("skip:", remotePath);
          continue;
        }
        // check md5
        const fmd5 = md5(fs.readFileSync(localPath)).toUpperCase();
        if (r.etag.indexOf(fmd5) > -1) {
          // skip, md5 match
          console.log("skip:", remotePath);
          continue;
        }
      }
      // upload
      console.log("update:", remotePath);
      await this.oss.put(remotePath, localPath);
    }
  }
}

function loadFolder(root: string, prefix = "", result?: IFileInfo[]) {
  if (!result) {
    result = [];
  }
  const dir = path.join(root, prefix);
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for (let ent of ents) {
    const name = path.join(prefix, ent.name);
    if (ent.isDirectory()) {
      loadFolder(root, name, result);
    } else if (ent.isFile()) {
      const stat = fs.lstatSync(path.join(root, name));
      result.push({
        name,
        size: stat.size,
        mtime: new Date(stat.mtime),
      });
    } else if (ent.isSymbolicLink()) {
      loadFolder(root, name, result);
    }
  }
  return result;
}

function md5(
  content: crypto.BinaryLike,
  encoding: crypto.BinaryToTextEncoding = "hex"
) {
  var md5 = crypto.createHash("md5");
  md5.update(content);
  return md5.digest(encoding);
}
