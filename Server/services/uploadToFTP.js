 

const ftp = require("basic-ftp");
const path = require("path");

/**
 * Upload any file buffer to FTP in a dynamic directory.
 * @param {Buffer} fileBuffer - The file contents
 * @param {string} originalName - File name to use on the server
 * @param {string} remoteDir - Remote directory, e.g. "/profile-pictures/42"
 * @param {boolean} useTimestamp - If true, prefix with timestamp (default: false)
 */
async function uploadFileToFTP(
  fileBuffer,
  originalName,
  remoteDir = "/books/uploads",
  useTimestamp = false
) {
  const client = new ftp.Client();
  client.ftp.timeout = 60000; // 60 second timeout per operation
remoteDir = path.posix.join("/public_html/quantumedu-tutor", remoteDir);
  try {
    console.log("🔗 Connecting to FTP...");
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      port: Number(process.env.FTP_PORT),
      secure: false,
    });

    console.log("🗂 Ensuring directory:", remoteDir);
    await client.ensureDir(remoteDir);

    const fileName = useTimestamp ? `${Date.now()}-${originalName}` : originalName;
    const remotePath = path.posix.join(remoteDir, fileName);
    console.log("📄 Upload path:", remotePath);

    const { PassThrough } = require("stream");
    const source = new PassThrough();
    source.end(fileBuffer);

    console.log("📤 Streaming file to FTP:", remotePath);
    await client.uploadFrom(source, remotePath);
    console.log("✅ Sent to FTP:", remotePath);
const publicPath = `${remoteDir}/${fileName}`.replace("/public_html", "");
const encodedPath = encodeURI(publicPath);
console.log("🌐 Public URL:", `${process.env.FTP_BASE_URL}${encodedPath}`);
return {
  success: true,
  fileName,
  remotePath: `${remoteDir}/${fileName}`,
  url: `${process.env.FTP_BASE_URL}${encodedPath}`,
};
  } catch (error) {
    console.error("❌ FTP Upload Error:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP Connection closed.");
  }
}

module.exports = { uploadFileToFTP };