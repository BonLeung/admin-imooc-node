const UPLOAD_PATH = process.env.NODE_ENV === 'development' ? '/Users/liangweibang/upload/admin-upload-ebook' : '/root/upload/admin-upload-ebook'
const UPLOAD_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:9000/admin-upload-ebook' : 'http://localhost:9000/admin-upload-ebook'

module.exports = {
  debug: true,
  CODE_SUCCESS: 0,
  CODE_ERROR: -1,
  CODE_TOKEN_EXPIRED: -2,
  CODE_REFRESH_TOKEN_EXPIRED: -3,
  PWD_SALT: 'admin_imooc_node',
  PRIVATE_KEY: 'admin_imooc_node',
  JWT_EXPIRE: 60 * 60,
  JWT_REFRESH_EXPIRE: 60 * 60 * 24 * 7,
  UPLOAD_PATH,
  UPLOAD_URL,
  MINE_TYPE_EPUB: 'application/epub+zip'
}