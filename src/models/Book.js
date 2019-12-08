const { MINE_TYPE_EPUB, UPLOAD_URL, UPLOAD_PATH } = require('../utils/constant')
const fs = require('fs')

class Book {
  constructor(file, data) {
    if (file) {
      this.createBookFromFile(file)
    } else if (data) {
      this.createBookFromData(data)
    }
  }

  createBookFromFile(file) {
    const { 
      destination: des, // 文件本地存储目录
      filename, // 文件名称
      mimetype = MINE_TYPE_EPUB,
      originalname
    } = file
    const suffix = mimetype === MINE_TYPE_EPUB ? '.epub' : ''
    const oldBookPath = `${des}/${filename}`
    const bookPath = `${des}/${filename}${suffix}`
    const url = `${UPLOAD_URL}/book/${filename}${suffix}`
    const unzipPath = `${UPLOAD_PATH}/unzip/${filename}`
    const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`
    if (!fs.existsSync(unzipPath)) {
      fs.mkdirSync(unzipPath, { recursive: true })  // 创建电子书解压后的目录
    }
    if (fs.existsSync(oldBookPath) && !fs.existsSync(bookPath)) {
      fs.renameSync(oldBookPath, bookPath)  // 重命名文件
    }

    this.fileName = filename  // 文件名
    this.path = `/book/${filename}${suffix}`  // epub 文件路径
    this.filePath = this.path // epub 文件路径
    this.url = url
    this.title = ''
    this.author = ''
    this.publisher = ''
    this.contents = []
    this.cover = ''
    this.category = -1
    this.categoryText = ''
    this.language = ''
    this.unzipPath = `/unzip/${filename}`
    this.unzipUrl = unzipUrl
    this.originalNAme = originalname
  } 

  createBookFromData(data) {

  }
}

module.exports = Book