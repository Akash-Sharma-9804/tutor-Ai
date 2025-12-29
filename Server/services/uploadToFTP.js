const ftp = require("basic-ftp");
const path = require("path");

/**
 * Upload any file buffer to FTP in a dynamic directory
 * Can be reused for different locations like /books/, /notes/, /schools/, etc
 */
async function uploadFileToFTP(fileBuffer, originalName, remoteDir = "/books/uploads") {
  const client = new ftp.Client();
  try {
    console.log("🔗 Connecting to FTP...");
    await client.access({ host: process.env.FTP_HOST, user: process.env.FTP_USER, password: process.env.FTP_PASS, port: Number(process.env.FTP_PORT), secure: false });

    console.log("🗂 Ensuring directory:", remoteDir);
    await client.ensureDir(remoteDir);

    const fileName = `${Date.now()}-${originalName}`;
    const remotePath = path.posix.join(remoteDir, fileName);
    console.log("📄 Upload path:", remotePath);


const { Readable, PassThrough } = require("stream");
const source = new PassThrough();
source.end(fileBuffer);

console.log("📤 Streaming file to FTP:", remotePath);
await client.uploadFrom(source, remotePath);
console.log("📤 Sent to FTP:", remotePath);



 

    return { success: true, fileName, remotePath, url: `${process.env.FTP_BASE_URL}${remoteDir}/${fileName}` };
  } finally {
    client.close();
    console.log("🔌 FTP Connection closed.");
  }
}


module.exports = { uploadFileToFTP };
