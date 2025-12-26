const ftp = require("basic-ftp");
const path = require("path");

/**
 * Upload any file buffer to FTP in a dynamic directory
 * Can be reused for different locations like /books/, /notes/, /schools/, etc
 */
async function uploadFileToFTP(fileBuffer, originalName, remoteDir = "/books/uploads") {
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      port: Number(process.env.FTP_PORT),
      secure: false,
    });

    await client.ensureDir(remoteDir);
    const fileName = `${Date.now()}-${originalName}`;
    const remotePath = path.posix.join(remoteDir, fileName);

    await client.uploadFrom(Buffer.from(fileBuffer), remotePath);

    return {
      success: true,
      fileName,
      remotePath,
      url: `${process.env.FTP_BASE_URL}${remoteDir}/${fileName}`, // Base URL you can change later
    };
  } finally {
    client.close();
  }
}

module.exports = { uploadFileToFTP };
