const { MINE_TYPE_EPUB, UPLOAD_URL, UPLOAD_PATH } = require('../utils/constant')
const fs = require('fs')
const path = require('path')
const Epub = require('../utils/epub')
const xml2js = require('xml2js').parseString

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
    this.coverPath = ''
    this.category = -1
    this.categoryText = ''
    this.language = ''
    this.rootFile = ''
    this.unzipPath = `/unzip/${filename}`
    this.unzipUrl = unzipUrl
    this.originalName = originalname
  } 

  createBookFromData(data) {

  }

  parse() {
    return new Promise((resolve, reject) => {
      const bookPath = `${UPLOAD_PATH}/${this.filePath}`
      if (!fs.existsSync(bookPath)) {
        reject(new Error('电子书不存在'))
      }
      const epub = new Epub(bookPath)
      epub.on('error', err => {
        reject(err)
      })
      epub.on('end', err => {
        if (err) {
          reject(err)
        } else {
          const {
            language,
            creator, 
            creatorFileAs,
            title,
            cover,
            publisher
          } = epub.metadata
          if (!title) {
            reject(new Error('图书标题为空'))
          } else {
            this.title = title
            this.language = language || 'en'
            this.author = creator || creatorFileAs || 'unknow'
            this.publisher = publisher || 'unknow'
            this.rootFile = epub.rootFile
            const handleGetImage= (err, file, mimeType) => {
              if (err) {
                reject(err)
              } else {
                const suffix = mimeType.split('/')[1]
                const coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                const coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}`
                fs.writeFileSync(coverPath, file, 'binary')
                this.coverPath = `/img/${this.fileName}.${suffix}`
                this.cover = coverUrl
                resolve(this)
              }
            }
            try {
              this.unzip() // 解压电子书
              this.parseContents(epub).then(({chapters, chapterTree}) => {
                this.contents = chapters
                this.contentsTree = chapterTree
              })
              epub.getImage(cover, handleGetImage)
            } catch (error) {
              reject(error)
            }
          }
        }
      })
      epub.parse()
    })
  }

  unzip() {
    const AdmZip = require('adm-zip')
    const zip = new AdmZip(Book.genPath(this.path))
    zip.extractAllTo(
      Book.genPath(this.unzipPath),
      true
    )
  }

  parseContents(epub) {
    function getNcxFilePath() {
      const spine = epub && epub.spine
      const mainfest = epub && epub.mainfest
      const ncx = spine && spine.toc && spine.toc.href
      const id = spine && spine.toc && spine.toc.id
      if (ncx) {
        return ncx
      } else {
        return mainfest[id].href
      }
    }

    function findParent(array, level = 0, pid = '') {
      return array.map(item => {
        item.level = level
        item.pid = pid
        if (item.navPoint && item.navPoint.length) {
          item.navPoint = findParent(item.navPoint, level + 1, item['$'].id)
        } else if (item.navPoint) {
          item.navPoint.level = level + 1
          item.navPoint.pid = item['$'].id
        }
        return item
      })
    }

    function flatten(array) {
      return [].concat(...array.map(item => {
        if (item.navPoint && item.navPoint.length) {
          return [].concat(item, ...flatten(item.navPoint))
        } else if (item.navPoint) {
          return [].concat(item, item.navPoint)
        } else {
          return item
        }
      }))
    }

    const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`)
    if (fs.existsSync(ncxFilePath)) {
      return new Promise((resolve, reject) => {
        const xml = fs.readFileSync(ncxFilePath, 'utf-8')
        const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH, '')
        const fileName = this.fileName
        xml2js(xml, {
          explicitArray: false,
          ignoreAttrs: false
        }, function(err, json) {
          if (err) {
            reject(err)
          } else {
            const navMap = json.ncx.navMap
            if (navMap.navPoint && navMap.navPoint.length > 0) {
              navMap.navPoint = findParent(navMap.navPoint)
              const newNavMap = flatten(navMap.navPoint)
              const chapters = []
              newNavMap.forEach((chapter, index) => {
                
                const src = chapter.content['$'].src
                chapter.text = `${UPLOAD_URL}${dir}/${src}`
                chapter.label = chapter.navLabel.text || ''
                chapter.navId = chapter['$'].id
                chapter.fileName = fileName
                chapter.order = index + 1
                chapters.push(chapter)
              })
              const chapterTree = []
              chapters.forEach(c => {
                c.children = []
                if (c.pid === '') {
                  chapterTree.push(c)
                } else {
                  const parent = chapters.find(_ => _.navId === c.pid)
                  parent.children.push(c)
                }
              }) // 将目录转化为树状结构
              resolve({ chapters, chapterTree })
            } else {
              reject(new Error('目录解析失败，目录数为0'))
            }
          } 
        })
      })
    } else {
      throw new Error('目录文件不存在')
    }
  }

  toJson() {
    return {
      path: this.path,
      url: this.url,
      title: this.title,
      language: this.language,
      author: this.author,
      publisher: this.publisher,
      cover: this.cover,
      coverPath: this.coverPath,
      unzipPath: this.unzipPath,
      unzipUrl: this.unzipUrl,
      category: this.category,
      categoryText: this.categoryText,
      contents: this.contents,
      contentsTree: this.contentsTree,
      originalName: this.originalName,
      rootFile: this.rootFile,
      fileName: this.fileName,
      filePath: this.filePath
    }
  }

  static genPath(path) {
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
    return `${UPLOAD_PATH}${path}`
  }
}

module.exports = Book