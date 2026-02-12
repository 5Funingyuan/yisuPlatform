const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'yisu-platform-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(express.json());

// 内存数据库（开发用）
const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMye8biJ5n6.6qU8t7QjY5Jp7B4Q7F8jK9S', // admin123
    role: 'ADMIN'
  }
];

const hotels = [
  {
    id: 'h-001',
    name: '易宿臻选酒店（深圳会展中心店）',
    star: '高档型',
    address: '深圳市福田区福华三路 88 号',
    tags: ['近地铁', '含早餐', '免费取消'],
    price: 428,
    promo: '会展差旅专属礼遇，连住 2 晚 95 折',
    intro: '步行可达会展中心，商务出行便捷',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    city: '深圳',
    status: 'APPROVED',
    ownerId: 1
  },
  {
    id: 'h-002',
    name: '海景逸宿酒店（三亚湾店）',
    star: '豪华型',
    address: '三亚市天涯区海滨路 19 号',
    tags: ['海景', '亲子', '免费停车'],
    price: 788,
    promo: '暑期家庭套餐，含双早与儿童乐园票',
    intro: '一线海景阳台，亲子度假热门之选',
    coverImage: 'https://images.unsplash.com/photo-1576675784201-0e142b423952?auto=format&fit=crop&w=1200&q=80',
    city: '三亚',
    status: 'APPROVED',
    ownerId: 1
  }
];

const rooms = [
  {
    id: 'r-001',
    hotelId: 'h-001',
    name: '豪华大床房',
    price: 428,
    stock: 10,
    description: '面积40平米，带独立阳台',
    facilities: ['空调', '电视', '免费WiFi', '迷你吧'],
    status: 'ON'
  },
  {
    id: 'r-002',
    hotelId: 'h-001',
    name: '行政套房',
    price: 688,
    stock: 5,
    description: '面积60平米，行政酒廊待遇',
    facilities: ['空调', '电视', '免费WiFi', '迷你吧', '浴缸'],
    status: 'ON'
  }
];

// 认证中间件
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '认证令牌无效' });
  }
};

// 1. 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '易宿平台API'
  });
});

// 2. 首页
app.get('/', (req, res) => {
  res.json({
    message: '🏨 易宿平台 API 服务器',
    version: '1.0.0',
    endpoints: [
      'GET    /api/hotels - 获取所有酒店',
      'GET    /api/hotels/:id - 获取酒店详情',
      'POST   /api/auth/login - 用户登录',
      'POST   /api/auth/register - 用户注册',
      'GET    /api/hotels/:id/rooms - 获取酒店房型'
    ]
  });
});

// 3. 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    // 检查用户是否存在
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const newUser = {
      id: users.length + 1,
      username,
      passwordHash,
      role: 'USER'
    };
    
    users.push(newUser);
    
    // 生成JWT
    const token = jwt.sign(
      { uid: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        }
      },
      message: '注册成功'
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 4. 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 生成JWT
    const token = jwt.sign(
      { uid: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 5. 获取当前用户信息
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.uid);
  
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  
  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// 6. 获取酒店列表（公开接口）
app.get('/api/hotels', (req, res) => {
  const { city, keyword, minPrice, maxPrice, tags } = req.query;
  
  let filteredHotels = hotels.filter(hotel => hotel.status === 'APPROVED');
  
  // 按城市筛选
  if (city) {
    filteredHotels = filteredHotels.filter(hotel => hotel.city === city);
  }
  
  // 按关键词筛选
  if (keyword) {
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.name.includes(keyword) || 
      hotel.address.includes(keyword) ||
      (hotel.tags && hotel.tags.some(tag => tag.includes(keyword)))
    );
  }
  
  // 按价格筛选
  if (minPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price >= Number(minPrice));
  }
  
  if (maxPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price <= Number(maxPrice));
  }
  
  // 按标签筛选
  if (tags) {
    const tagArray = tags.split(',');
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.tags && tagArray.some(tag => hotel.tags.includes(tag))
    );
  }
  
  res.json({
    success: true,
    data: filteredHotels,
    total: filteredHotels.length
  });
});

// 7. 获取酒店详情（公开接口）
app.get('/api/hotels/:id', (req, res) => {
  const hotel = hotels.find(h => h.id === req.params.id);
  
  if (!hotel) {
    return res.status(404).json({ success: false, message: '酒店不存在' });
  }
  
  // 用户只能看到已审核的酒店，管理员可以看到所有
  const isAdmin = req.user && req.user.role === 'ADMIN';
  if (hotel.status !== 'APPROVED' && !isAdmin) {
    return res.status(403).json({ success: false, message: '酒店不可访问' });
  }
  
  res.json({
    success: true,
    data: hotel
  });
});

// 8. 创建酒店（需要登录）
app.post('/api/hotels', authMiddleware, (req, res) => {
  try {
    const { name, city, address, description, star, tags, price, promo, coverImage, intro } = req.body;
    
    if (!name || !city || !address) {
      return res.status(400).json({ success: false, message: '名称、城市和地址是必填项' });
    }
    
    const newHotel = {
      id: `h-${(hotels.length + 1).toString().padStart(3, '0')}`,
      name,
      city,
      address,
      description,
      star,
      tags: tags || [],
      price: price || 0,
      promo,
      coverImage,
      intro,
      status: 'DRAFT',
      ownerId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    hotels.push(newHotel);
    
    res.status(201).json({
      success: true,
      data: newHotel,
      message: '酒店创建成功'
    });
  } catch (error) {
    console.error('创建酒店错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 9. 获取酒店房型（公开接口）
app.get('/api/hotels/:id/rooms', (req, res) => {
  const hotelRooms = rooms.filter(room => 
    room.hotelId === req.params.id && room.status === 'ON'
  );
  
  res.json({
    success: true,
    data: hotelRooms
  });
});

// 10. 添加房型（需要酒店所有者或管理员）
app.post('/api/hotels/:id/rooms', authMiddleware, (req, res) => {
  try {
    const hotel = hotels.find(h => h.id === req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ success: false, message: '酒店不存在' });
    }
    
    // 权限检查
    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = hotel.ownerId === req.user.uid;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: '无权为此酒店添加房型' });
    }
    
    const { name, price, stock, description, facilities } = req.body;
    
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: '名称、价格和库存是必填项' });
    }
    
    const newRoom = {
      id: `r-${(rooms.length + 1).toString().padStart(3, '0')}`,
      hotelId: req.params.id,
      name,
      price: Number(price),
      stock: Number(stock),
      description,
      facilities: facilities || [],
      status: 'ON',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    rooms.push(newRoom);
    
    res.status(201).json({
      success: true,
      data: newRoom,
      message: '房型创建成功'
    });
  } catch (error) {
    console.error('创建房型错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 11. 管理员接口：获取所有酒店（包括未审核的）
app.get('/api/admin/hotels', authMiddleware, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: '权限不足' });
  }
  
  res.json({
    success: true,
    data: hotels
  });
});

// 12. 管理员接口：审核酒店
app.post('/api/admin/hotels/:id/approve', authMiddleware, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: '权限不足' });
  }
  
  const hotel = hotels.find(h => h.id === req.params.id);
  
  if (!hotel) {
    return res.status(404).json({ success: false, message: '酒店不存在' });
  }
  
  if (hotel.status !== 'PENDING') {
    return res.status(400).json({ success: false, message: '只有待审核状态的酒店可以审核' });
  }
  
  hotel.status = 'APPROVED';
  hotel.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: hotel,
    message: '酒店审核通过'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🚀 易宿平台 API 服务器启动成功！');
  console.log('='.repeat(70));
  console.log(`📡 服务器地址: http://localhost:${PORT}`);
  console.log('');
  console.log('🎯 主要接口:');
  console.log(`   首页: http://localhost:${PORT}/`);
  console.log(`   所有酒店: http://localhost:${PORT}/api/hotels`);
  console.log(`   深圳酒店: http://localhost:${PORT}/api/hotels?city=深圳`);
  console.log(`   搜索酒店: http://localhost:${PORT}/api/hotels?keyword=海景`);
  console.log(`   酒店详情: http://localhost:${PORT}/api/hotels/h-001`);
  console.log(`   酒店房型: http://localhost:${PORT}/api/hotels/h-001/rooms`);
  console.log('');
  console.log('🔐 认证接口:');
  console.log(`   登录: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`        {"username": "admin", "password": "admin123"}`);
  console.log(`   注册: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`        {"username": "test", "password": "test123"}`);
  console.log('');
  console.log('👑 管理员接口:');
  console.log(`   所有酒店(含未审核): GET http://localhost:${PORT}/api/admin/hotels`);
  console.log(`   审核酒店: POST http://localhost:${PORT}/api/admin/hotels/h-003/approve`);
  console.log('='.repeat(70));
});