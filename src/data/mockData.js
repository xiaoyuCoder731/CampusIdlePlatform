export const mockUsers = [
  { id: 0, username: '管理员', studentId: 'admin', password: 'admin123', grade: '-', department: '管理中心', role: 'admin' },
  { id: 1, username: '张小明', studentId: '2022001001', password: '123456', grade: '2022级', department: '计算机学院', role: 'student' },
  { id: 2, username: '李小红', studentId: '2023002002', password: '123456', grade: '2023级', department: '经济管理学院', role: 'student' },
  { id: 3, username: '王小强', studentId: '2021003003', password: '123456', grade: '2021级', department: '机械工程学院', role: 'student' },
  { id: 4, username: '赵小美', studentId: '2022004004', password: '123456', grade: '2022级', department: '外国语学院', role: 'student' },
  { id: 5, username: '刘小伟', studentId: '2024005005', password: '123456', grade: '2024级', department: '艺术学院', role: 'student' }
]

export const categories = [
  { value: 'all', label: '全部' },
  { value: 'book', label: '书籍教材' },
  { value: 'electronic', label: '电子产品' },
  { value: 'sports', label: '运动器材' },
  { value: 'daily', label: '生活用品' },
  { value: 'vehicle', label: '交通工具' },
  { value: 'other', label: '其他' }
]

export const grades = [
  { value: 'all', label: '全部年级' },
  { value: '2021级', label: '2021级' },
  { value: '2022级', label: '2022级' },
  { value: '2023级', label: '2023级' },
  { value: '2024级', label: '2024级' }
]

export const mockGoods = [
  {
    id: 1,
    name: '高等数学（第七版）',
    category: 'book',
    price: 25,
    originalPrice: 68,
    description: '同济大学高等数学第七版，上下册，无笔记划线，品相良好',
    ownerId: 1,
    ownerName: '张小明',
    ownerGrade: '2022级',
    images: ['/photo/OIP-C.jpg'],
    status: 'on_sale',
    publishTime: '2024-01-15'
  },
  {
    id: 2,
    name: '小米电动滑板车',
    category: 'vehicle',
    price: 800,
    originalPrice: 1999,
    description: '使用一年半，电池续航约25公里，有轻微划痕，功能完好',
    ownerId: 3,
    ownerName: '王小强',
    ownerGrade: '2021级',
    images: ['/photo/OIP-C.jpg'],
    status: 'on_sale',
    publishTime: '2024-01-12'
  },
  {
    id: 3,
    name: 'MacBook Pro 14寸 2021',
    category: 'electronic',
    price: 9500,
    originalPrice: 14999,
    description: 'M1 Pro芯片，16GB内存，512GB硬盘，带原装充电器和保护壳',
    ownerId: 2,
    ownerName: '李小红',
    ownerGrade: '2023级',
    images: ['/photo/OIP-C.jpg'],
    status: 'on_sale',
    publishTime: '2024-01-10'
  },
  {
    id: 4,
    name: '羽毛球拍套装',
    category: 'sports',
    price: 60,
    originalPrice: 120,
    description: '两支球拍，送羽毛球一桶，握把已换新',
    ownerId: 1,
    ownerName: '张小明',
    ownerGrade: '2022级',
    images: ['/photo/OIP-C.jpg'],
    status: 'on_sale',
    publishTime: '2024-01-08'
  },
  {
    id: 5,
    name: '台灯护眼灯',
    category: 'daily',
    price: 35,
    originalPrice: 89,
    description: '可调节亮度和色温，USB充电，适合宿舍使用',
    ownerId: 4,
    ownerName: '赵小美',
    ownerGrade: '2022级',
    images: ['/photo/OIP-C.jpg'],
    status: 'on_sale',
    publishTime: '2024-01-05'
  },
  {
    id: 6,
    name: '篮球',
    category: 'sports',
    price: 45,
    originalPrice: 99,
    description: '斯伯丁室外篮球，使用半年，弹性良好',
    ownerId: 5,
    ownerName: '刘小伟',
    ownerGrade: '2024级',
    images: ['/photo/OIP-C.jpg'],
    status: 'on_sale',
    publishTime: '2024-01-03'
  },
  {
    id: 7,
    name: '四六级词汇书',
    category: 'book',
    price: 15,
    originalPrice: 39,
    description: '新东方四六级词汇，有少量笔记标注',
    ownerId: 2,
    ownerName: '李小红',
    ownerGrade: '2023级',
    images: ['/photo/OIP-C.jpg'],
    status: 'sold',
    publishTime: '2024-01-01'
  },
  {
    id: 8,
    name: '吹风机',
    category: 'daily',
    price: 25,
    originalPrice: 69,
    description: '1200W，可折叠，宿舍使用安全',
    ownerId: 3,
    ownerName: '王小强',
    ownerGrade: '2021级',
    images: ['/photo/OIP-C.jpg'],
    status: 'on_sale',
    publishTime: '2023-12-28'
  }
]
